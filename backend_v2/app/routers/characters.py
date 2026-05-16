from __future__ import annotations

import json
import re
from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.db import get_connection
from app.repositories.builders import list_player_characters
from app.routers.lookup import get_class_detail, get_subclass_detail
from app.schemas.models import (
    Character,
    CharacterCreate,
    CharacterInventoryCreate,
    CharacterInventoryEntry,
    CharacterInventoryUpdate,
    CharacterSheetDetailsUpdate,
    CharacterSummary,
    CharacterTrackersUpdate,
)

router = APIRouter(prefix="/characters", tags=["characters"])


def _coerce_string(value: Any) -> str | None:
    return value if isinstance(value, str) and value.strip() else None


def _coerce_int(value: Any, default: int | None = None) -> int | None:
    if isinstance(value, bool):
        return default
    if isinstance(value, int):
        return value
    if isinstance(value, str) and value.strip():
        try:
            return int(value)
        except ValueError:
            return default
    return default


def _first_coerced_int(payload: dict[str, Any], keys: list[str], default: int | None = None) -> int | None:
    for key in keys:
        value = _coerce_int(payload.get(key))
        if value is not None:
            return value
    return default


def _load_legacy_payload(row: dict[str, Any]) -> dict[str, Any]:
    raw_payload = row.get("data_json")
    if isinstance(raw_payload, str):
        try:
            payload = json.loads(raw_payload or "{}")
        except json.JSONDecodeError:
            payload = {}
    elif isinstance(raw_payload, dict):
        payload = raw_payload
    else:
        payload = {}
    return payload if isinstance(payload, dict) else {}


def _list_inventory_rows(connection: Any, character_id: int) -> list[dict[str, Any]]:
    return [
        dict(row)
        for row in connection.execute(
            """
            SELECT id, character_id, item_name, category, quantity, equipped, slot_name, notes, created_at
            FROM character_inventory
            WHERE character_id = ?
            ORDER BY equipped DESC, category, item_name, id
            """,
            (character_id,),
        ).fetchall()
    ]


def _parse_feature_modifiers(text: str | None) -> tuple[int, dict[str, int]]:
    if not text:
        return 0, {}

    evasion_bonus = 0
    trait_bonuses: dict[str, int] = {}
    normalized_text = text.replace("–", "-").replace("—", "-")
    chunks = [chunk.strip() for chunk in re.split(r"[.;\n]", normalized_text) if chunk.strip()]

    for chunk in chunks:
        lowered_chunk = chunk.lower()
        if "your allies" in lowered_chunk or "allies gain" in lowered_chunk or "ally gains" in lowered_chunk:
            continue

        for match in re.finditer(r"([+-]\d+)\s+(?:bonus|penalty)\s+to\s+(?:your\s+)?evasion", chunk, re.IGNORECASE):
            evasion_bonus += int(match.group(1))
        for match in re.finditer(r"([+-]\d+)\s+to\s+(?:your\s+)?evasion", chunk, re.IGNORECASE):
            evasion_bonus += int(match.group(1))

        all_traits_match = re.search(
            r"([+-]\d+)\s+to\s+all character traits(?:\s+and\s+evasion)?",
            chunk,
            re.IGNORECASE,
        )
        if all_traits_match:
            modifier = int(all_traits_match.group(1))
            for trait_name in ("Agility", "Strength", "Finesse", "Instinct", "Presence", "Knowledge"):
                trait_bonuses[trait_name] = trait_bonuses.get(trait_name, 0) + modifier
            if re.search(r"all character traits\s+and\s+evasion", chunk, re.IGNORECASE):
                evasion_bonus += modifier

        for trait_name in ("Agility", "Strength", "Finesse", "Instinct", "Presence", "Knowledge"):
            for match in re.finditer(
                rf"([+-]\d+)\s+(?:bonus|penalty)\s+to\s+(?:your\s+)?{trait_name}",
                chunk,
                re.IGNORECASE,
            ):
                trait_bonuses[trait_name] = trait_bonuses.get(trait_name, 0) + int(match.group(1))
            for match in re.finditer(rf"([+-]\d+)\s+to\s+(?:your\s+)?{trait_name}", chunk, re.IGNORECASE):
                trait_bonuses[trait_name] = trait_bonuses.get(trait_name, 0) + int(match.group(1))
    return evasion_bonus, trait_bonuses


def _apply_numeric_modifier(value: str, modifier: int) -> str:
    try:
        base_value = int(value)
    except ValueError:
        return value
    adjusted = base_value + modifier
    return f"{adjusted:+d}" if adjusted > 0 else str(adjusted)


def _format_signed_modifier(value: int) -> str:
    return f"{value:+d}" if value > 0 else str(value)


def _sync_equipped_fields(connection: Any, character_id: int) -> None:
    entries = _list_inventory_rows(connection, character_id)

    primary_weapon = next(
        (entry["item_name"] for entry in entries if entry["equipped"] and entry["slot_name"] == "primary"),
        None,
    )
    secondary_weapon = next(
        (entry["item_name"] for entry in entries if entry["equipped"] and entry["slot_name"] == "secondary"),
        None,
    )
    armor_name = next(
        (entry["item_name"] for entry in entries if entry["equipped"] and entry["slot_name"] == "armor"),
        None,
    )

    armor_score = None
    armor_threshold_major = None
    armor_threshold_severe = None
    if armor_name:
        armor_row = connection.execute(
            """
            SELECT base_score, thresholds_major, thresholds_severe, feature_text, description_text
            FROM Equipment
            WHERE item_name = ?
            LIMIT 1
            """,
            (armor_name,),
        ).fetchone()
        level_row = connection.execute(
            "SELECT level FROM characters WHERE id = ?",
            (character_id,),
        ).fetchone()
        level = int(level_row["level"]) if level_row and level_row["level"] is not None else 1
        if armor_row:
            armor_score = armor_row["base_score"]
            armor_threshold_major = (
                str(int(armor_row["thresholds_major"]) + level) if armor_row["thresholds_major"] is not None else None
            )
            armor_threshold_severe = (
                str(int(armor_row["thresholds_severe"]) + level) if armor_row["thresholds_severe"] is not None else None
            )

    connection.execute(
        """
        UPDATE characters
        SET primary_weapon = ?,
            secondary_weapon = ?,
            armor_name = ?,
            armor = COALESCE(?, armor),
            armor_threshold_major = COALESCE(?, armor_threshold_major),
            armor_threshold_severe = COALESCE(?, armor_threshold_severe),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            primary_weapon,
            secondary_weapon,
            armor_name,
            armor_score,
            armor_threshold_major,
            armor_threshold_severe,
            character_id,
        ),
    )


def _persist_character_payload(payload: CharacterCreate, character_id: int | None = None) -> int:
    builder = payload.data_json if isinstance(payload.data_json, dict) else {}

    trait_rows = [
        (trait_name, modifier_text)
        for trait_name, modifier_text in (builder.get("traits") or {}).items()
        if isinstance(trait_name, str) and isinstance(modifier_text, str) and modifier_text.strip()
    ]
    experience_rows = [
        (
            index,
            entry.get("name"),
            entry.get("modifier", 2),
        )
        for index, entry in enumerate(builder.get("experiences") or [], start=1)
        if isinstance(entry, dict) and isinstance(entry.get("name"), str) and entry.get("name", "").strip()
    ]
    domain_card_names = [value for value in builder.get("domain_cards") or [] if isinstance(value, str) and value.strip()]

    class_domains: list[str] = []
    try:
        class_detail = get_class_detail(payload.class_name)
        class_domains = class_detail.domains
    except HTTPException:
        pass

    domain_card_rows: list[tuple[int, str, str | None, int | None, str | None]] = []
    with get_connection() as connection:
        armor_name_value = _coerce_string(builder.get("armor_name"))
        armor_score_value = payload.armor
        armor_threshold_major_value = _coerce_string(builder.get("armor_threshold_major"))
        armor_threshold_severe_value = _coerce_string(builder.get("armor_threshold_severe"))
        if armor_name_value:
            armor_row = connection.execute(
                """
                SELECT base_score, thresholds_major, thresholds_severe
                FROM Equipment
                WHERE lower(item_name) = lower(?)
                LIMIT 1
                """,
                (armor_name_value,),
            ).fetchone()
            if armor_row is not None:
                armor_score_value = armor_row["base_score"]
                armor_threshold_major_value = (
                    str(int(armor_row["thresholds_major"]) + payload.level)
                    if armor_row["thresholds_major"] is not None
                    else None
                )
                armor_threshold_severe_value = (
                    str(int(armor_row["thresholds_severe"]) + payload.level)
                    if armor_row["thresholds_severe"] is not None
                    else None
                )

        for index, card_name in enumerate(domain_card_names, start=1):
            card_row = connection.execute(
                """
                SELECT domain_name, card_level, card_type
                FROM DomainCards
                WHERE lower(card_name) = lower(?)
                LIMIT 1
                """,
                (card_name,),
            ).fetchone()
            if card_row is None:
                domain_card_rows.append((index, card_name, None, None, None))
                continue
            domain_card_rows.append(
                (
                    index,
                    card_name,
                    card_row["domain_name"],
                    card_row["card_level"],
                    card_row["card_type"],
                )
            )

        if character_id is None:
            cursor = connection.execute(
                """
                INSERT INTO characters (
                    name, class_name, subclass_name, ancestry, community, level,
                    evasion, armor, hit_points, stress, hope, notes, data_json,
                    pronouns, description, heritage_notes, proficiency, armor_name,
                    armor_threshold_major, armor_threshold_severe, primary_weapon,
                    secondary_weapon, weapon_notes, potion_choice, class_item_choice,
                    inventory_notes, background, connection_notes,
                    gold_handfuls, gold_bags, gold_chests, prayer_dice,
                    unstoppable_value, rally_die_value, rally_notes, warrior_notes,
                    companion_name, companion_evasion, companion_notes, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """,
                (
                    payload.name,
                    payload.class_name,
                    payload.subclass_name,
                    payload.ancestry,
                    payload.community,
                    payload.level,
                    payload.evasion,
                    armor_score_value,
                    payload.hit_points,
                    payload.stress,
                    payload.hope,
                    payload.notes,
                    json.dumps(builder),
                    _coerce_string(builder.get("pronouns")),
                    _coerce_string(builder.get("description")),
                    _coerce_string(builder.get("heritage_notes")),
                    _coerce_int(builder.get("proficiency"), 1) or 1,
                    armor_name_value,
                    armor_threshold_major_value,
                    armor_threshold_severe_value,
                    _coerce_string(builder.get("primary_weapon")),
                    _coerce_string(builder.get("secondary_weapon")),
                    _coerce_string(builder.get("weapon_notes")),
                    _coerce_string(builder.get("potion_choice")),
                    _coerce_string(builder.get("class_item_choice")),
                    _coerce_string(builder.get("inventory_notes")),
                    _coerce_string(builder.get("background")),
                    _coerce_string(builder.get("connection_notes")),
                    _coerce_int(builder.get("gold_handfuls"), 1) or 1,
                    _coerce_int(builder.get("gold_bags"), 0) or 0,
                    _coerce_int(builder.get("gold_chests"), 0) or 0,
                    _coerce_int(builder.get("prayer_dice"), 0) or 0,
                    _coerce_int(builder.get("unstoppable_value"), 0) or 0,
                    _coerce_string(builder.get("rally_die_value")),
                    _coerce_string(builder.get("rally_notes")),
                    _coerce_string(builder.get("warrior_notes")),
                    _coerce_string(builder.get("companion_name")),
                    _coerce_int(builder.get("companion_evasion"), 10) or 10,
                    _coerce_string(builder.get("companion_notes")),
                ),
            )
            character_id = int(cursor.lastrowid)
        else:
            existing = connection.execute("SELECT id FROM characters WHERE id = ?", (character_id,)).fetchone()
            if existing is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")

            connection.execute(
                """
                UPDATE characters
                SET name = ?,
                    class_name = ?,
                    subclass_name = ?,
                    ancestry = ?,
                    community = ?,
                    level = ?,
                    evasion = ?,
                    armor = ?,
                    hit_points = ?,
                    stress = ?,
                    hope = ?,
                    notes = ?,
                    data_json = ?,
                    pronouns = ?,
                    description = ?,
                    heritage_notes = ?,
                    proficiency = ?,
                    armor_name = ?,
                    armor_threshold_major = ?,
                    armor_threshold_severe = ?,
                    primary_weapon = ?,
                    secondary_weapon = ?,
                    weapon_notes = ?,
                    potion_choice = ?,
                    class_item_choice = ?,
                    inventory_notes = ?,
                    background = ?,
                    connection_notes = ?,
                    gold_handfuls = ?,
                    gold_bags = ?,
                    gold_chests = ?,
                    prayer_dice = ?,
                    unstoppable_value = ?,
                    rally_die_value = ?,
                    rally_notes = ?,
                    warrior_notes = ?,
                    companion_name = ?,
                    companion_evasion = ?,
                    companion_notes = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (
                    payload.name,
                    payload.class_name,
                    payload.subclass_name,
                    payload.ancestry,
                    payload.community,
                    payload.level,
                    payload.evasion,
                    armor_score_value,
                    payload.hit_points,
                    payload.stress,
                    payload.hope,
                    payload.notes,
                    json.dumps(builder),
                    _coerce_string(builder.get("pronouns")),
                    _coerce_string(builder.get("description")),
                    _coerce_string(builder.get("heritage_notes")),
                    _coerce_int(builder.get("proficiency"), 1) or 1,
                    armor_name_value,
                    armor_threshold_major_value,
                    armor_threshold_severe_value,
                    _coerce_string(builder.get("primary_weapon")),
                    _coerce_string(builder.get("secondary_weapon")),
                    _coerce_string(builder.get("weapon_notes")),
                    _coerce_string(builder.get("potion_choice")),
                    _coerce_string(builder.get("class_item_choice")),
                    _coerce_string(builder.get("inventory_notes")),
                    _coerce_string(builder.get("background")),
                    _coerce_string(builder.get("connection_notes")),
                    _coerce_int(builder.get("gold_handfuls"), 1) or 1,
                    _coerce_int(builder.get("gold_bags"), 0) or 0,
                    _coerce_int(builder.get("gold_chests"), 0) or 0,
                    _coerce_int(builder.get("prayer_dice"), 0) or 0,
                    _coerce_int(builder.get("unstoppable_value"), 0) or 0,
                    _coerce_string(builder.get("rally_die_value")),
                    _coerce_string(builder.get("rally_notes")),
                    _coerce_string(builder.get("warrior_notes")),
                    _coerce_string(builder.get("companion_name")),
                    _coerce_int(builder.get("companion_evasion"), 10) or 10,
                    _coerce_string(builder.get("companion_notes")),
                    character_id,
                ),
            )

            connection.execute("DELETE FROM character_traits WHERE character_id = ?", (character_id,))
            connection.execute("DELETE FROM character_experiences WHERE character_id = ?", (character_id,))
            connection.execute("DELETE FROM character_domain_cards WHERE character_id = ?", (character_id,))

        if trait_rows:
            connection.executemany(
                """
                INSERT INTO character_traits (character_id, trait_name, modifier_text)
                VALUES (?, ?, ?)
                """,
                [(character_id, trait_name, modifier_text) for trait_name, modifier_text in trait_rows],
            )

        if experience_rows:
            connection.executemany(
                """
                INSERT INTO character_experiences (character_id, slot_number, experience_name, modifier_value)
                VALUES (?, ?, ?, ?)
                """,
                [
                    (character_id, slot_number, experience_name, _coerce_int(modifier_value, 2) or 2)
                    for slot_number, experience_name, modifier_value in experience_rows
                ],
            )

        if domain_card_rows:
            connection.executemany(
                """
                INSERT INTO character_domain_cards (character_id, slot_number, card_name, domain_name, card_level, card_type)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                [
                    (character_id, slot_number, card_name, domain_name, card_level, card_type)
                    for slot_number, card_name, domain_name, card_level, card_type in domain_card_rows
                    if not class_domains or domain_name in class_domains or domain_name is None
                ],
            )

        connection.commit()

    return character_id


def _hydrate_character(character_id: int) -> Character:
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT id, name, class_name, subclass_name, ancestry, community, level,
                   evasion, armor, hit_points, stress, hope, notes, data_json,
                   pronouns, description, heritage_notes, proficiency, armor_name,
                   armor_threshold_major, armor_threshold_severe, primary_weapon,
                   secondary_weapon, weapon_notes, potion_choice, class_item_choice,
                   inventory_notes, background, connection_notes, gold_handfuls,
                   gold_bags, gold_chests, prayer_dice, unstoppable_value,
                   rally_die_value, rally_notes, warrior_notes, companion_name,
                   companion_evasion, companion_notes, created_at, updated_at
            FROM characters
            WHERE id = ?
            """,
            (character_id,),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")

        base_row = dict(row)
        legacy_payload = _load_legacy_payload(base_row)

        traits = {
            trait_row["trait_name"]: trait_row["modifier_text"]
            for trait_row in connection.execute(
                """
                SELECT trait_name, modifier_text
                FROM character_traits
                WHERE character_id = ?
                ORDER BY id
                """,
                (character_id,),
            ).fetchall()
        }
        if not traits and isinstance(legacy_payload.get("traits"), dict):
            traits = {
                key: value
                for key, value in legacy_payload["traits"].items()
                if isinstance(key, str) and isinstance(value, str)
            }

        experiences = [
            {
                "name": exp_row["experience_name"],
                "modifier": exp_row["modifier_value"],
            }
            for exp_row in connection.execute(
                """
                SELECT slot_number, experience_name, modifier_value
                FROM character_experiences
                WHERE character_id = ?
                ORDER BY slot_number, id
                """,
                (character_id,),
            ).fetchall()
        ]
        if not experiences and isinstance(legacy_payload.get("experiences"), list):
            experiences = [
                entry
                for entry in legacy_payload["experiences"]
                if isinstance(entry, dict)
                and isinstance(entry.get("name"), str)
                and isinstance(entry.get("modifier"), int)
            ]

        domain_cards = [
            card_row["card_name"]
            for card_row in connection.execute(
                """
                SELECT slot_number, card_name
                FROM character_domain_cards
                WHERE character_id = ?
                ORDER BY slot_number, id
                """,
                (character_id,),
            ).fetchall()
        ]
        if not domain_cards and isinstance(legacy_payload.get("domain_cards"), list):
            domain_cards = [card for card in legacy_payload["domain_cards"] if isinstance(card, str)]

        inventory_entries = [
            CharacterInventoryEntry(
                id=entry["id"],
                character_id=entry["character_id"],
                item_name=entry["item_name"],
                category=entry["category"],
                quantity=entry["quantity"],
                equipped=bool(entry["equipped"]),
                slot_name=entry["slot_name"],
                notes=entry["notes"],
                created_at=entry["created_at"],
            ).model_dump()
            for entry in _list_inventory_rows(connection, character_id)
        ]

    class_domains: list[str] = []
    class_items: list[str] = []
    subclass_spellcast_trait: str | None = None
    class_feature_text = _coerce_string(legacy_payload.get("class_feature")) or ""
    hope_feature_text = _coerce_string(legacy_payload.get("hope_feature")) or ""
    subclass_feature_texts: list[tuple[str, str]] = []
    default_max_hit_points = _first_coerced_int(
        legacy_payload,
        ["max_hit_points"],
    ) or 0
    default_max_stress = _first_coerced_int(
        legacy_payload,
        ["max_stress"],
        6,
    ) or 6

    try:
        class_detail = get_class_detail(base_row["class_name"])
        class_domains = class_detail.domains
        class_items = class_detail.class_items
        class_feature_text = class_detail.class_feature
        hope_feature_text = class_detail.hope_feature
        if default_max_hit_points <= 0:
            default_max_hit_points = class_detail.starting_hit_points
    except HTTPException:
        if isinstance(legacy_payload.get("class_domains"), list):
            class_domains = [value for value in legacy_payload["class_domains"] if isinstance(value, str)]
        if isinstance(legacy_payload.get("class_items"), list):
            class_items = [value for value in legacy_payload["class_items"] if isinstance(value, str)]

    if base_row.get("subclass_name"):
        try:
            subclass_detail = get_subclass_detail(base_row["subclass_name"])
            subclass_spellcast_trait = subclass_detail.spellcast_trait_type
            subclass_feature_texts = [
                ("Foundation", subclass_detail.foundation_feature),
                ("Specialization", subclass_detail.specialization_feature),
                ("Mastery", subclass_detail.mastery_feature),
            ]
        except HTTPException:
            subclass_spellcast_trait = _coerce_string(legacy_payload.get("subclass_spellcast_trait"))

    payload = {
        **legacy_payload,
        "pronouns": base_row.get("pronouns") or _coerce_string(legacy_payload.get("pronouns")) or "",
        "description": base_row.get("description") or _coerce_string(legacy_payload.get("description")) or "",
        "heritage_notes": base_row.get("heritage_notes") or _coerce_string(legacy_payload.get("heritage_notes")) or "",
        "traits": traits,
        "proficiency": base_row.get("proficiency") or _coerce_int(legacy_payload.get("proficiency"), 1) or 1,
        "max_hit_points": default_max_hit_points,
        "max_stress": default_max_stress,
        "armor_name": base_row.get("armor_name") or _coerce_string(legacy_payload.get("armor_name")) or "",
        "armor_threshold_major": base_row.get("armor_threshold_major")
        or _coerce_string(legacy_payload.get("armor_threshold_major"))
        or "",
        "armor_threshold_severe": base_row.get("armor_threshold_severe")
        or _coerce_string(legacy_payload.get("armor_threshold_severe"))
        or "",
        "primary_weapon": base_row.get("primary_weapon") or _coerce_string(legacy_payload.get("primary_weapon")) or "",
        "secondary_weapon": base_row.get("secondary_weapon")
        or _coerce_string(legacy_payload.get("secondary_weapon"))
        or "",
        "weapon_notes": base_row.get("weapon_notes") or _coerce_string(legacy_payload.get("weapon_notes")) or "",
        "potion_choice": base_row.get("potion_choice") or _coerce_string(legacy_payload.get("potion_choice")) or "",
        "class_item_choice": base_row.get("class_item_choice")
        or _coerce_string(legacy_payload.get("class_item_choice"))
        or "",
        "inventory_notes": base_row.get("inventory_notes") or _coerce_string(legacy_payload.get("inventory_notes")) or "",
        "background": base_row.get("background") or _coerce_string(legacy_payload.get("background")) or "",
        "experiences": experiences,
        "domain_cards": domain_cards,
        "class_domains": class_domains,
        "class_items": class_items,
        "class_feature": class_feature_text,
        "hope_feature": hope_feature_text,
        "subclass_spellcast_trait": subclass_spellcast_trait,
        "connection_notes": base_row.get("connection_notes") or _coerce_string(legacy_payload.get("connection_notes")) or "",
        "gold_handfuls": base_row.get("gold_handfuls") if base_row.get("gold_handfuls") is not None else 1,
        "gold_bags": base_row.get("gold_bags") if base_row.get("gold_bags") is not None else 0,
        "gold_chests": base_row.get("gold_chests") if base_row.get("gold_chests") is not None else 0,
        "prayer_dice": base_row.get("prayer_dice") if base_row.get("prayer_dice") is not None else 0,
        "unstoppable_value": base_row.get("unstoppable_value") if base_row.get("unstoppable_value") is not None else 0,
        "rally_die_value": base_row.get("rally_die_value") or _coerce_string(legacy_payload.get("rally_die_value")) or "",
        "rally_notes": base_row.get("rally_notes") or _coerce_string(legacy_payload.get("rally_notes")) or "",
        "warrior_notes": base_row.get("warrior_notes") or _coerce_string(legacy_payload.get("warrior_notes")) or "",
        "companion_name": base_row.get("companion_name") or _coerce_string(legacy_payload.get("companion_name")) or "",
        "companion_evasion": base_row.get("companion_evasion")
        if base_row.get("companion_evasion") is not None
        else _coerce_int(legacy_payload.get("companion_evasion"), 10)
        or 10,
        "companion_notes": base_row.get("companion_notes") or _coerce_string(legacy_payload.get("companion_notes")) or "",
        "inventory_entries": inventory_entries,
    }

    equipped_feature_rows = []
    ancestry_row = None
    community_row = None
    with get_connection() as connection:
        equipped_feature_rows = connection.execute(
            """
            SELECT ci.item_name, ci.slot_name, e.feature_text, e.description_text
            FROM character_inventory ci
            LEFT JOIN Equipment e ON e.item_name = ci.item_name
            WHERE ci.character_id = ? AND ci.equipped = 1
            """,
            (character_id,),
        ).fetchall()
        if base_row.get("ancestry"):
            ancestry_row = connection.execute(
                """
                SELECT ancestry_name, ancestry_feature1, ancestry_feature2
                FROM Ancestry
                WHERE lower(ancestry_name) = lower(?)
                LIMIT 1
                """,
                (base_row["ancestry"],),
            ).fetchone()
        if base_row.get("community"):
            community_row = connection.execute(
                """
                SELECT community_name, community_feature
                FROM Community
                WHERE lower(trim(community_name)) = lower(trim(?))
                LIMIT 1
                """,
                (base_row["community"],),
            ).fetchone()

    total_evasion_bonus = 0
    trait_modifiers: dict[str, int] = {}
    evasion_sources: list[dict[str, str | int]] = []
    trait_modifier_sources: dict[str, list[dict[str, str | int]]] = {}
    feature_sources: list[tuple[str, str]] = []
    if ancestry_row:
        if ancestry_row["ancestry_feature1"]:
            feature_sources.append((f"{ancestry_row['ancestry_name']} Feature 1", ancestry_row["ancestry_feature1"]))
        if ancestry_row["ancestry_feature2"]:
            feature_sources.append((f"{ancestry_row['ancestry_name']} Feature 2", ancestry_row["ancestry_feature2"]))
    if community_row and community_row["community_feature"]:
        feature_sources.append((f"{community_row['community_name'].strip()} Community", community_row["community_feature"]))
    if hope_feature_text:
        feature_sources.append((f"{base_row['class_name']} Hope Feature", hope_feature_text))
    if class_feature_text:
        feature_sources.append((f"{base_row['class_name']} Class Feature", class_feature_text))
    if base_row.get("subclass_name"):
        for feature_label, feature_text in subclass_feature_texts:
            if feature_text:
                feature_sources.append((f"{base_row['subclass_name']} {feature_label}", feature_text))
    for feature_row in equipped_feature_rows:
        source_text = feature_row["feature_text"] or feature_row["description_text"]
        if source_text:
            feature_sources.append((feature_row["item_name"] or "Equipped gear", source_text))

    for source_name, source_text in feature_sources:
        evasion_delta, trait_delta = _parse_feature_modifiers(source_text)
        total_evasion_bonus += evasion_delta
        if evasion_delta:
            evasion_sources.append(
                {
                    "source": source_name,
                    "modifier": evasion_delta,
                    "label": f"{source_name} ({_format_signed_modifier(evasion_delta)} Evasion)",
                }
            )
        for trait_name, modifier in trait_delta.items():
            trait_modifiers[trait_name] = trait_modifiers.get(trait_name, 0) + modifier
            trait_modifier_sources.setdefault(trait_name, []).append(
                {
                    "source": source_name,
                    "modifier": modifier,
                    "label": f"{source_name} ({_format_signed_modifier(modifier)} {trait_name})",
                }
            )

    if base_row["evasion"] is not None:
        payload["derived_evasion"] = base_row["evasion"] + total_evasion_bonus
        payload["derived_evasion_sources"] = [
            {"source": "Base", "modifier": base_row["evasion"], "label": f"Base ({base_row['evasion']})"},
            *evasion_sources,
        ]
    if payload["traits"]:
        payload["traits"] = {
            trait_name: _apply_numeric_modifier(modifier_text, trait_modifiers.get(trait_name, 0))
            for trait_name, modifier_text in payload["traits"].items()
        }
        payload["trait_modifier_sources"] = {
            trait_name: [
                {"source": "Base", "modifier": modifier_text, "label": f"Base ({modifier_text})"},
                *trait_modifier_sources.get(trait_name, []),
            ]
            for trait_name, modifier_text in traits.items()
        }

    return Character(
        id=base_row["id"],
        name=base_row["name"],
        class_name=base_row["class_name"],
        subclass_name=base_row["subclass_name"],
        ancestry=base_row["ancestry"],
        community=base_row["community"],
        level=base_row["level"],
        evasion=base_row["evasion"],
        armor=base_row["armor"],
        hit_points=base_row["hit_points"],
        stress=base_row["stress"],
        hope=base_row["hope"],
        notes=base_row["notes"],
        data_json=payload,
        created_at=base_row["created_at"],
        updated_at=base_row["updated_at"],
    )


@router.get("", response_model=list[Character])
def list_characters() -> list[Character]:
    with get_connection() as connection:
        character_ids = [
            row["id"]
            for row in connection.execute(
                """
                SELECT id
                FROM characters
                ORDER BY updated_at DESC, id DESC
                """
            ).fetchall()
        ]
    return [_hydrate_character(character_id) for character_id in character_ids]


@router.get("/summary", response_model=list[CharacterSummary])
def list_character_summaries() -> list[CharacterSummary]:
    return [CharacterSummary(**row) for row in list_player_characters()]


@router.get("/{character_id}", response_model=Character)
def get_character(character_id: int) -> Character:
    return _hydrate_character(character_id)


@router.get("/{character_id}/inventory", response_model=list[CharacterInventoryEntry])
def list_character_inventory(character_id: int) -> list[CharacterInventoryEntry]:
    with get_connection() as connection:
        existing = connection.execute("SELECT id FROM characters WHERE id = ?", (character_id,)).fetchone()
        if existing is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
        rows = _list_inventory_rows(connection, character_id)
    return [
        CharacterInventoryEntry(
            id=row["id"],
            character_id=row["character_id"],
            item_name=row["item_name"],
            category=row["category"],
            quantity=row["quantity"],
            equipped=bool(row["equipped"]),
            slot_name=row["slot_name"],
            notes=row["notes"],
            created_at=row["created_at"],
        )
        for row in rows
    ]


@router.post("/{character_id}/inventory", response_model=CharacterInventoryEntry, status_code=status.HTTP_201_CREATED)
def add_character_inventory(character_id: int, payload: CharacterInventoryCreate) -> CharacterInventoryEntry:
    with get_connection() as connection:
        existing = connection.execute("SELECT id FROM characters WHERE id = ?", (character_id,)).fetchone()
        if existing is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")

        equipment_row = connection.execute(
            """
            SELECT category
            FROM Equipment
            WHERE lower(item_name) = lower(?)
            LIMIT 1
            """,
            (payload.item_name,),
        ).fetchone()
        category = equipment_row["category"] if equipment_row else None

        cursor = connection.execute(
            """
            INSERT INTO character_inventory (character_id, item_name, category, quantity, notes)
            VALUES (?, ?, ?, ?, ?)
            """,
            (character_id, payload.item_name, category, payload.quantity, _coerce_string(payload.notes)),
        )
        entry_id = int(cursor.lastrowid)
        connection.commit()

        row = connection.execute(
            """
            SELECT id, character_id, item_name, category, quantity, equipped, slot_name, notes, created_at
            FROM character_inventory
            WHERE id = ?
            """,
            (entry_id,),
        ).fetchone()

    return CharacterInventoryEntry(
        id=row["id"],
        character_id=row["character_id"],
        item_name=row["item_name"],
        category=row["category"],
        quantity=row["quantity"],
        equipped=bool(row["equipped"]),
        slot_name=row["slot_name"],
        notes=row["notes"],
        created_at=row["created_at"],
    )


@router.patch("/{character_id}/inventory/{entry_id}", response_model=CharacterInventoryEntry)
def update_character_inventory(
    character_id: int,
    entry_id: int,
    payload: CharacterInventoryUpdate,
) -> CharacterInventoryEntry:
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT id, character_id, item_name, category, quantity, equipped, slot_name, notes, created_at
            FROM character_inventory
            WHERE id = ? AND character_id = ?
            """,
            (entry_id, character_id),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory entry not found")

        current = dict(row)
        next_quantity = payload.quantity if payload.quantity is not None else current["quantity"]
        next_equipped = int(payload.equipped) if payload.equipped is not None else current["equipped"]
        next_slot_name = payload.slot_name if payload.slot_name is not None else current["slot_name"]
        next_notes = _coerce_string(payload.notes) if payload.notes is not None else current["notes"]

        if next_equipped and next_slot_name in {"primary", "secondary", "armor"}:
            connection.execute(
                """
                UPDATE character_inventory
                SET equipped = 0
                WHERE character_id = ? AND slot_name = ? AND id <> ?
                """,
                (character_id, next_slot_name, entry_id),
            )

        connection.execute(
            """
            UPDATE character_inventory
            SET quantity = ?, equipped = ?, slot_name = ?, notes = ?
            WHERE id = ? AND character_id = ?
            """,
            (next_quantity, next_equipped, next_slot_name, next_notes, entry_id, character_id),
        )

        _sync_equipped_fields(connection, character_id)
        connection.commit()

        updated = connection.execute(
            """
            SELECT id, character_id, item_name, category, quantity, equipped, slot_name, notes, created_at
            FROM character_inventory
            WHERE id = ?
            """,
            (entry_id,),
        ).fetchone()

    return CharacterInventoryEntry(
        id=updated["id"],
        character_id=updated["character_id"],
        item_name=updated["item_name"],
        category=updated["category"],
        quantity=updated["quantity"],
        equipped=bool(updated["equipped"]),
        slot_name=updated["slot_name"],
        notes=updated["notes"],
        created_at=updated["created_at"],
    )


@router.delete("/{character_id}/inventory/{entry_id}", status_code=status.HTTP_200_OK)
def delete_character_inventory(character_id: int, entry_id: int) -> None:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT id FROM character_inventory WHERE id = ? AND character_id = ?",
            (entry_id, character_id),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory entry not found")
        connection.execute(
            "DELETE FROM character_inventory WHERE id = ? AND character_id = ?",
            (entry_id, character_id),
        )
        _sync_equipped_fields(connection, character_id)
        connection.commit()


@router.post("", response_model=Character, status_code=status.HTTP_201_CREATED)
def create_character(payload: CharacterCreate) -> Character:
    character_id = _persist_character_payload(payload)
    return _hydrate_character(character_id)


@router.put("/{character_id}", response_model=Character)
def update_character(character_id: int, payload: CharacterCreate) -> Character:
    _persist_character_payload(payload, character_id=character_id)
    return _hydrate_character(character_id)


@router.patch("/{character_id}/trackers", response_model=Character)
def update_character_trackers(character_id: int, payload: CharacterTrackersUpdate) -> Character:
    with get_connection() as connection:
        existing = connection.execute(
            "SELECT id FROM characters WHERE id = ?",
            (character_id,),
        ).fetchone()
        if existing is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")

        connection.execute(
            """
            UPDATE characters
            SET hit_points = COALESCE(?, hit_points),
                stress = COALESCE(?, stress),
                hope = COALESCE(?, hope),
                armor = COALESCE(?, armor),
                gold_handfuls = COALESCE(?, gold_handfuls),
                gold_bags = COALESCE(?, gold_bags),
                gold_chests = COALESCE(?, gold_chests),
                prayer_dice = COALESCE(?, prayer_dice),
                unstoppable_value = COALESCE(?, unstoppable_value),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (
                payload.hit_points,
                payload.stress,
                payload.hope,
                payload.armor,
                payload.gold_handfuls,
                payload.gold_bags,
                payload.gold_chests,
                payload.prayer_dice,
                payload.unstoppable_value,
                character_id,
            ),
        )
        connection.commit()

    return _hydrate_character(character_id)


@router.patch("/{character_id}/sheet-details", response_model=Character)
def update_character_sheet_details(character_id: int, payload: CharacterSheetDetailsUpdate) -> Character:
    with get_connection() as connection:
        existing = connection.execute(
            "SELECT id FROM characters WHERE id = ?",
            (character_id,),
        ).fetchone()
        if existing is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")

        connection.execute(
            """
            UPDATE characters
            SET companion_name = COALESCE(?, companion_name),
                companion_evasion = COALESCE(?, companion_evasion),
                companion_notes = COALESCE(?, companion_notes),
                rally_die_value = COALESCE(?, rally_die_value),
                rally_notes = COALESCE(?, rally_notes),
                warrior_notes = COALESCE(?, warrior_notes),
                inventory_notes = COALESCE(?, inventory_notes),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (
                _coerce_string(payload.companion_name),
                payload.companion_evasion,
                _coerce_string(payload.companion_notes),
                _coerce_string(payload.rally_die_value),
                _coerce_string(payload.rally_notes),
                _coerce_string(payload.warrior_notes),
                _coerce_string(payload.inventory_notes),
                character_id,
            ),
        )
        connection.commit()

    return _hydrate_character(character_id)
