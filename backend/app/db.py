from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any

PROJECT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = PROJECT_DIR / "backend"
DATABASE_DIR = BACKEND_DIR / "database"
DATABASE_PATH = DATABASE_DIR / "daggerheart.db"


def get_connection() -> sqlite3.Connection:
    DATABASE_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON;")
    return connection


def _ensure_column(connection: sqlite3.Connection, table_name: str, column_name: str, definition: str) -> None:
    existing_columns = {
        row["name"]
        for row in connection.execute(f"PRAGMA table_info({table_name})").fetchall()
    }
    if column_name not in existing_columns:
        connection.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {definition}")


def initialize_app_tables() -> None:
    with get_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS characters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                class_name TEXT NOT NULL,
                subclass_name TEXT,
                ancestry TEXT,
                community TEXT,
                level INTEGER NOT NULL DEFAULT 1,
                evasion INTEGER,
                armor INTEGER,
                hit_points INTEGER,
                stress INTEGER,
                hope INTEGER,
                notes TEXT,
                data_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS character_traits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                character_id INTEGER NOT NULL,
                trait_name TEXT NOT NULL,
                modifier_text TEXT NOT NULL,
                FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS character_experiences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                character_id INTEGER NOT NULL,
                slot_number INTEGER NOT NULL,
                experience_name TEXT NOT NULL,
                modifier_value INTEGER NOT NULL DEFAULT 2,
                FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS character_domain_cards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                character_id INTEGER NOT NULL,
                slot_number INTEGER NOT NULL,
                card_name TEXT NOT NULL,
                domain_name TEXT,
                card_level INTEGER,
                card_type TEXT,
                FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS character_inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                character_id INTEGER NOT NULL,
                item_name TEXT NOT NULL,
                category TEXT,
                quantity INTEGER NOT NULL DEFAULT 1,
                equipped INTEGER NOT NULL DEFAULT 0,
                slot_name TEXT,
                notes TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS Items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_name TEXT NOT NULL UNIQUE,
                subcategory TEXT,
                description_text TEXT NOT NULL,
                source_url TEXT
            );

            CREATE TABLE IF NOT EXISTS Consumables (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_name TEXT NOT NULL UNIQUE,
                subcategory TEXT,
                description_text TEXT NOT NULL,
                source_url TEXT
            );

            CREATE TABLE IF NOT EXISTS adversaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                tier INTEGER NOT NULL DEFAULT 1,
                role TEXT DEFAULT 'Standard',
                description TEXT,
                motives TEXT,
                tactics TEXT,
                difficulty INTEGER,
                thresholds_major INTEGER,
                thresholds_severe INTEGER,
                hit_points INTEGER,
                stress INTEGER,
                attack_name TEXT,
                attack_range TEXT,
                attack_damage TEXT,
                attack_standard TEXT,
                attack_modifier INTEGER,
                passive_features TEXT,
                action_features TEXT,
                reaction_features TEXT,
                fear_features TEXT,
                experiences_json TEXT NOT NULL DEFAULT '[]',
                features TEXT,
                experiences TEXT,
                notes TEXT,
                data_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS npcs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL DEFAULT 'Unnamed NPC',
                tier INTEGER,
                role TEXT,
                description TEXT,
                motives TEXT,
                tactics TEXT,
                difficulty INTEGER,
                thresholds_major INTEGER,
                thresholds_severe INTEGER,
                hit_points INTEGER,
                stress INTEGER,
                attack_name TEXT,
                attack_range TEXT,
                attack_damage TEXT,
                attack_standard TEXT,
                attack_modifier INTEGER,
                passive_features TEXT,
                action_features TEXT,
                reaction_features TEXT,
                fear_features TEXT,
                experiences_json TEXT NOT NULL DEFAULT '[]',
                features TEXT,
                experiences TEXT,
                notes TEXT,
                data_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS environments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                tier INTEGER NOT NULL DEFAULT 1,
                environment_type TEXT NOT NULL DEFAULT 'Traversal',
                description TEXT,
                impulses TEXT,
                difficulty INTEGER,
                potential_adversaries TEXT,
                features TEXT,
                notes TEXT,
                data_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS encounter_boards (
                id TEXT PRIMARY KEY,
                state_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )

        _ensure_column(connection, "encounter_boards", "state_json", "TEXT NOT NULL DEFAULT '{}'")
        _ensure_column(connection, "encounter_boards", "updated_at", "TEXT")

        for column_name, definition in (
            ("pronouns", "TEXT"),
            ("description", "TEXT"),
            ("heritage_notes", "TEXT"),
            ("proficiency", "INTEGER NOT NULL DEFAULT 1"),
            ("armor_name", "TEXT"),
            ("armor_threshold_major", "TEXT"),
            ("armor_threshold_severe", "TEXT"),
            ("primary_weapon", "TEXT"),
            ("secondary_weapon", "TEXT"),
            ("weapon_notes", "TEXT"),
            ("potion_choice", "TEXT"),
            ("class_item_choice", "TEXT"),
            ("inventory_notes", "TEXT"),
            ("background", "TEXT"),
            ("connection_notes", "TEXT"),
            ("gold_handfuls", "INTEGER NOT NULL DEFAULT 1"),
            ("gold_bags", "INTEGER NOT NULL DEFAULT 0"),
            ("gold_chests", "INTEGER NOT NULL DEFAULT 0"),
            ("prayer_dice", "INTEGER NOT NULL DEFAULT 0"),
            ("unstoppable_value", "INTEGER NOT NULL DEFAULT 0"),
            ("rally_die_value", "TEXT"),
            ("rally_notes", "TEXT"),
            ("warrior_notes", "TEXT"),
            ("companion_name", "TEXT"),
            ("companion_evasion", "INTEGER"),
            ("companion_notes", "TEXT"),
        ):
            _ensure_column(connection, "characters", column_name, definition)

        for column_name, definition in (
            ("role", "TEXT DEFAULT 'Standard'"),
            ("description", "TEXT"),
            ("motives", "TEXT"),
            ("tactics", "TEXT"),
            ("thresholds_major", "INTEGER"),
            ("thresholds_severe", "INTEGER"),
            ("attack_name", "TEXT"),
            ("attack_range", "TEXT"),
            ("attack_damage", "TEXT"),
            ("attack_standard", "TEXT"),
            ("attack_modifier", "INTEGER"),
            ("passive_features", "TEXT"),
            ("action_features", "TEXT"),
            ("reaction_features", "TEXT"),
            ("fear_features", "TEXT"),
            ("experiences_json", "TEXT NOT NULL DEFAULT '[]'"),
            ("features", "TEXT"),
            ("experiences", "TEXT"),
        ):
            _ensure_column(connection, "adversaries", column_name, definition)

        for column_name, definition in (
            ("tier", "INTEGER"),
            ("role", "TEXT"),
            ("description", "TEXT"),
            ("motives", "TEXT"),
            ("tactics", "TEXT"),
            ("difficulty", "INTEGER"),
            ("thresholds_major", "INTEGER"),
            ("thresholds_severe", "INTEGER"),
            ("hit_points", "INTEGER"),
            ("stress", "INTEGER"),
            ("attack_name", "TEXT"),
            ("attack_range", "TEXT"),
            ("attack_damage", "TEXT"),
            ("attack_standard", "TEXT"),
            ("attack_modifier", "INTEGER"),
            ("passive_features", "TEXT"),
            ("action_features", "TEXT"),
            ("reaction_features", "TEXT"),
            ("fear_features", "TEXT"),
            ("experiences_json", "TEXT NOT NULL DEFAULT '[]'"),
            ("features", "TEXT"),
            ("experiences", "TEXT"),
            ("notes", "TEXT"),
            ("data_json", "TEXT NOT NULL DEFAULT '{}'"),
            ("updated_at", "TEXT"),
        ):
            _ensure_column(connection, "npcs", column_name, definition)

        _seed_inventory_content_tables(connection)
        _migrate_legacy_character_payloads(connection)
        _migrate_legacy_adversaries(connection)


def _migrate_legacy_adversaries(connection: sqlite3.Connection) -> None:
    columns = {
        row["name"]
        for row in connection.execute("PRAGMA table_info(adversaries)").fetchall()
    }
    if not {"attack_name", "attack_range", "attack_damage", "attack_bonus"}.intersection(columns):
        return

    select_attack_name = "attack_name" if "attack_name" in columns else "NULL AS attack_name"
    select_attack_range = "attack_range" if "attack_range" in columns else "NULL AS attack_range"
    select_attack_damage = "attack_damage" if "attack_damage" in columns else "NULL AS attack_damage"
    select_attack_bonus = "attack_bonus" if "attack_bonus" in columns else "NULL AS attack_bonus"

    rows = connection.execute(
        f"""
        SELECT id, role, {select_attack_name}, {select_attack_range}, {select_attack_damage},
               {select_attack_bonus}, attack_standard, attack_modifier
        FROM adversaries
        """
    ).fetchall()

    for row in rows:
        updates: dict[str, Any] = {}
        attack_parts = [row["attack_name"], row["attack_range"], row["attack_damage"]]
        if row["attack_standard"] is None and any(isinstance(part, str) and part.strip() for part in attack_parts):
            updates["attack_standard"] = " | ".join(part.strip() for part in attack_parts if isinstance(part, str) and part.strip())
        if row["attack_modifier"] is None and "attack_bonus" in columns and row["attack_bonus"] is not None:
            updates["attack_modifier"] = row["attack_bonus"]
        if row["role"] is None:
            updates["role"] = "Standard"

        if updates:
            assignments = ", ".join(f"{column_name} = ?" for column_name in updates)
            connection.execute(
                f"UPDATE adversaries SET {assignments}, updated_at = updated_at WHERE id = ?",
                (*updates.values(), row["id"]),
            )


def _coerce_payload_int(value: Any) -> int | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, str) and value.strip():
        try:
            return int(value)
        except ValueError:
            return None
    return None


def _normalize_character_tracker_keys(payload: dict[str, Any]) -> bool:
    changed = False
    canonical_keys = {
        "max_hit_points": ("maxHitPoints", "hit_points_max", "hitPoints", "starting_hit_points"),
        "max_stress": ("maxStress", "stress_max", "stress_slots", "stressSlots"),
    }

    for canonical_key, legacy_keys in canonical_keys.items():
        canonical_value = _coerce_payload_int(payload.get(canonical_key))
        if canonical_value is None:
            for legacy_key in legacy_keys:
                legacy_value = _coerce_payload_int(payload.get(legacy_key))
                if legacy_value is not None:
                    payload[canonical_key] = legacy_value
                    changed = True
                    break

        for legacy_key in legacy_keys:
            if legacy_key in payload:
                del payload[legacy_key]
                changed = True

    return changed


def _migrate_legacy_character_payloads(connection: sqlite3.Connection) -> None:
    rows = connection.execute(
        """
        SELECT id, data_json, pronouns, description, heritage_notes, proficiency, armor_name,
               armor_threshold_major, armor_threshold_severe, primary_weapon, secondary_weapon,
               weapon_notes, potion_choice, class_item_choice, inventory_notes, background,
               connection_notes, prayer_dice, unstoppable_value, rally_die_value,
               rally_notes, warrior_notes, companion_name, companion_evasion, companion_notes
        FROM characters
        """
    ).fetchall()

    for row in rows:
        raw_payload = row["data_json"]
        if not raw_payload:
            continue

        try:
            payload = json.loads(raw_payload)
        except json.JSONDecodeError:
            continue

        if not isinstance(payload, dict):
            continue

        if _normalize_character_tracker_keys(payload):
            connection.execute(
                "UPDATE characters SET data_json = ?, updated_at = updated_at WHERE id = ?",
                (json.dumps(payload), row["id"]),
            )

        updates: dict[str, Any] = {}
        for column_name, payload_key in (
            ("pronouns", "pronouns"),
            ("description", "description"),
            ("heritage_notes", "heritage_notes"),
            ("armor_name", "armor_name"),
            ("armor_threshold_major", "armor_threshold_major"),
            ("armor_threshold_severe", "armor_threshold_severe"),
            ("primary_weapon", "primary_weapon"),
            ("secondary_weapon", "secondary_weapon"),
            ("weapon_notes", "weapon_notes"),
            ("potion_choice", "potion_choice"),
            ("class_item_choice", "class_item_choice"),
            ("inventory_notes", "inventory_notes"),
            ("background", "background"),
            ("connection_notes", "connection_notes"),
            ("rally_die_value", "rally_die_value"),
            ("rally_notes", "rally_notes"),
            ("warrior_notes", "warrior_notes"),
            ("companion_name", "companion_name"),
            ("companion_notes", "companion_notes"),
        ):
            if row[column_name] is None and isinstance(payload.get(payload_key), str) and payload[payload_key].strip():
                updates[column_name] = payload[payload_key]

        if (row["proficiency"] is None or row["proficiency"] == 1) and isinstance(payload.get("proficiency"), int):
            updates["proficiency"] = payload["proficiency"]
        if row["prayer_dice"] == 0 and isinstance(payload.get("prayer_dice"), int):
            updates["prayer_dice"] = payload["prayer_dice"]
        if row["unstoppable_value"] == 0 and isinstance(payload.get("unstoppable_value"), int):
            updates["unstoppable_value"] = payload["unstoppable_value"]
        if row["companion_evasion"] is None and isinstance(payload.get("companion_evasion"), int):
            updates["companion_evasion"] = payload["companion_evasion"]

        if updates:
            assignments = ", ".join(f"{column_name} = ?" for column_name in updates)
            connection.execute(
                f"UPDATE characters SET {assignments}, updated_at = updated_at WHERE id = ?",
                (*updates.values(), row["id"]),
            )

        trait_count = connection.execute(
            "SELECT COUNT(*) AS count_value FROM character_traits WHERE character_id = ?",
            (row["id"],),
        ).fetchone()["count_value"]
        if trait_count == 0 and isinstance(payload.get("traits"), dict):
            connection.executemany(
                """
                INSERT INTO character_traits (character_id, trait_name, modifier_text)
                VALUES (?, ?, ?)
                """,
                [
                    (row["id"], trait_name, modifier_text)
                    for trait_name, modifier_text in payload["traits"].items()
                    if isinstance(trait_name, str) and isinstance(modifier_text, str) and modifier_text.strip()
                ],
            )

        experience_count = connection.execute(
            "SELECT COUNT(*) AS count_value FROM character_experiences WHERE character_id = ?",
            (row["id"],),
        ).fetchone()["count_value"]
        if experience_count == 0 and isinstance(payload.get("experiences"), list):
            connection.executemany(
                """
                INSERT INTO character_experiences (character_id, slot_number, experience_name, modifier_value)
                VALUES (?, ?, ?, ?)
                """,
                [
                    (row["id"], index, entry["name"], entry["modifier"])
                    for index, entry in enumerate(payload["experiences"], start=1)
                    if isinstance(entry, dict)
                    and isinstance(entry.get("name"), str)
                    and entry.get("name", "").strip()
                    and isinstance(entry.get("modifier"), int)
                ],
            )

        domain_card_count = connection.execute(
            "SELECT COUNT(*) AS count_value FROM character_domain_cards WHERE character_id = ?",
            (row["id"],),
        ).fetchone()["count_value"]
        if domain_card_count == 0 and isinstance(payload.get("domain_cards"), list):
            for index, card_name in enumerate(payload["domain_cards"], start=1):
                if not isinstance(card_name, str) or not card_name.strip():
                    continue
                card_row = connection.execute(
                    """
                    SELECT domain_name, card_level, card_type
                    FROM DomainCards
                    WHERE lower(card_name) = lower(?)
                    LIMIT 1
                    """,
                    (card_name,),
                ).fetchone()
                connection.execute(
                    """
                    INSERT INTO character_domain_cards (character_id, slot_number, card_name, domain_name, card_level, card_type)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        row["id"],
                        index,
                        card_name,
                        card_row["domain_name"] if card_row else None,
                        card_row["card_level"] if card_row else None,
                        card_row["card_type"] if card_row else None,
                    ),
                )


def _seed_inventory_content_tables(connection: sqlite3.Connection) -> None:
    item_count = connection.execute("SELECT COUNT(*) AS count_value FROM Items").fetchone()["count_value"]
    consumable_count = connection.execute("SELECT COUNT(*) AS count_value FROM Consumables").fetchone()["count_value"]

    if item_count == 0:
        connection.execute(
            """
            INSERT INTO Items (item_name, subcategory, description_text, source_url)
            SELECT item_name, subcategory, description_text, source_url
            FROM Equipment
            WHERE category = 'Item'
            ORDER BY item_name
            """
        )

    if consumable_count == 0:
        connection.execute(
            """
            INSERT INTO Consumables (item_name, subcategory, description_text, source_url)
            SELECT item_name, subcategory, description_text, source_url
            FROM Equipment
            WHERE category = 'Consumable'
            ORDER BY item_name
            """
        )


def fetch_all(query: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
    with get_connection() as connection:
        rows = connection.execute(query, params).fetchall()
    return [dict(row) for row in rows]


def fetch_one(query: str, params: tuple[Any, ...] = ()) -> dict[str, Any] | None:
    with get_connection() as connection:
        row = connection.execute(query, params).fetchone()
    return dict(row) if row else None


def execute_write(query: str, params: tuple[Any, ...] = ()) -> int:
    with get_connection() as connection:
        cursor = connection.execute(query, params)
        connection.commit()
        return int(cursor.lastrowid)
