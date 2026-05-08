from __future__ import annotations

import json
from typing import Any

from app.db import fetch_all, fetch_one, get_connection
from app.schemas.models import AdversaryCreate, EnvironmentCreate, NPCCreate


def _dump_json(payload: dict[str, Any]) -> str:
    return json.dumps(payload or {})


def _load_builder_row(row: dict[str, Any] | None) -> dict[str, Any] | None:
    if row is None:
        return None

    payload = dict(row)
    raw_json = payload.get("data_json")
    if isinstance(raw_json, str):
        try:
            payload["data_json"] = json.loads(raw_json or "{}")
        except json.JSONDecodeError:
            payload["data_json"] = {}
    elif not isinstance(raw_json, dict):
        payload["data_json"] = {}

    feature_groups = payload["data_json"].get("feature_groups")
    if isinstance(feature_groups, dict):
        normalized_feature_groups: dict[str, list[str]] = {}
        for key, values in feature_groups.items():
            if not isinstance(key, str) or not isinstance(values, list):
                continue
            clean_values = [value.strip() for value in values if isinstance(value, str) and value.strip()]
            if clean_values:
                normalized_feature_groups[key] = clean_values
        payload["feature_groups"] = normalized_feature_groups
    else:
        payload["feature_groups"] = {}

    attack_parts = [payload.get("attack_name"), payload.get("attack_range"), payload.get("attack_damage")]
    if any(isinstance(part, str) and part.strip() for part in attack_parts):
        payload["attack_standard"] = " | ".join(part.strip() for part in attack_parts if isinstance(part, str) and part.strip())

    raw_experiences = payload.get("experiences_json")
    if isinstance(raw_experiences, str):
        try:
            payload["experiences_list"] = json.loads(raw_experiences or "[]")
        except json.JSONDecodeError:
            payload["experiences_list"] = []
    elif isinstance(raw_experiences, list):
        payload["experiences_list"] = raw_experiences
    else:
        payload["experiences_list"] = []
    return payload


def list_adversaries() -> list[dict[str, Any]]:
    rows = fetch_all(
        """
        SELECT id, name, tier, role, description, motives, tactics, difficulty,
               thresholds_major, thresholds_severe, hit_points, stress,
               attack_name, attack_range, attack_damage, attack_standard, attack_modifier,
               passive_features, action_features, reaction_features, fear_features, experiences_json,
               features, experiences, notes,
               data_json, created_at, updated_at
        FROM adversaries
        ORDER BY updated_at DESC, id DESC
        """
    )
    return [_load_builder_row(row) for row in rows if row is not None]


def get_adversary(adversary_id: int) -> dict[str, Any] | None:
    row = fetch_one(
        """
        SELECT id, name, tier, role, description, motives, tactics, difficulty,
               thresholds_major, thresholds_severe, hit_points, stress,
               attack_name, attack_range, attack_damage, attack_standard, attack_modifier,
               passive_features, action_features, reaction_features, fear_features, experiences_json,
               features, experiences, notes,
               data_json, created_at, updated_at
        FROM adversaries
        WHERE id = ?
        """,
        (adversary_id,),
    )
    return _load_builder_row(row)


def create_adversary(payload: AdversaryCreate) -> dict[str, Any]:
    data_json = {
        **(payload.data_json or {}),
        "feature_groups": payload.feature_groups,
    }
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO adversaries (
                name, tier, role, description, motives, tactics, difficulty,
                thresholds_major, thresholds_severe, hit_points, stress,
                attack_name, attack_range, attack_damage, attack_standard, attack_modifier,
                passive_features, action_features, reaction_features, fear_features, experiences_json,
                features, experiences, notes,
                data_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """,
            (
                payload.name,
                payload.tier,
                payload.role,
                payload.description,
                payload.motives,
                payload.tactics,
                payload.difficulty,
                payload.thresholds_major,
                payload.thresholds_severe,
                payload.hit_points,
                payload.stress,
                payload.attack_name,
                payload.attack_range,
                payload.attack_damage,
                payload.attack_standard,
                payload.attack_modifier,
                payload.passive_features,
                payload.action_features,
                payload.reaction_features,
                payload.fear_features,
                _dump_json(payload.experiences_list),
                payload.features,
                payload.experiences,
                payload.notes,
                _dump_json(data_json),
            ),
        )
        adversary_id = int(cursor.lastrowid)
        connection.commit()
    return get_adversary(adversary_id) or {}


def update_adversary(adversary_id: int, payload: AdversaryCreate) -> dict[str, Any] | None:
    data_json = {
        **(payload.data_json or {}),
        "feature_groups": payload.feature_groups,
    }
    with get_connection() as connection:
        connection.execute(
            """
            UPDATE adversaries
            SET name = ?,
                tier = ?,
                role = ?,
                description = ?,
                motives = ?,
                tactics = ?,
                difficulty = ?,
                thresholds_major = ?,
                thresholds_severe = ?,
                hit_points = ?,
                stress = ?,
                attack_name = ?,
                attack_range = ?,
                attack_damage = ?,
                attack_standard = ?,
                attack_modifier = ?,
                passive_features = ?,
                action_features = ?,
                reaction_features = ?,
                fear_features = ?,
                experiences_json = ?,
                features = ?,
                experiences = ?,
                notes = ?,
                data_json = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (
                payload.name,
                payload.tier,
                payload.role,
                payload.description,
                payload.motives,
                payload.tactics,
                payload.difficulty,
                payload.thresholds_major,
                payload.thresholds_severe,
                payload.hit_points,
                payload.stress,
                payload.attack_name,
                payload.attack_range,
                payload.attack_damage,
                payload.attack_standard,
                payload.attack_modifier,
                payload.passive_features,
                payload.action_features,
                payload.reaction_features,
                payload.fear_features,
                _dump_json(payload.experiences_list),
                payload.features,
                payload.experiences,
                payload.notes,
                _dump_json(data_json),
                adversary_id,
            ),
        )
        connection.commit()
    return get_adversary(adversary_id)


def delete_adversary(adversary_id: int) -> None:
    with get_connection() as connection:
        connection.execute("DELETE FROM adversaries WHERE id = ?", (adversary_id,))
        connection.commit()


def list_npcs() -> list[dict[str, Any]]:
    rows = fetch_all(
        """
        SELECT id, name, tier, role, description, motives, tactics, difficulty,
               thresholds_major, thresholds_severe, hit_points, stress,
               attack_name, attack_range, attack_damage, attack_standard, attack_modifier,
               passive_features, action_features, reaction_features, fear_features, experiences_json,
               features, experiences, notes,
               data_json, created_at, updated_at
        FROM npcs
        ORDER BY updated_at DESC, id DESC
        """
    )
    return [_load_builder_row(row) for row in rows if row is not None]


def get_npc(npc_id: int) -> dict[str, Any] | None:
    row = fetch_one(
        """
        SELECT id, name, tier, role, description, motives, tactics, difficulty,
               thresholds_major, thresholds_severe, hit_points, stress,
               attack_name, attack_range, attack_damage, attack_standard, attack_modifier,
               passive_features, action_features, reaction_features, fear_features, experiences_json,
               features, experiences, notes,
               data_json, created_at, updated_at
        FROM npcs
        WHERE id = ?
        """,
        (npc_id,),
    )
    return _load_builder_row(row)


def create_npc(payload: NPCCreate) -> dict[str, Any]:
    data_json = {
        **(payload.data_json or {}),
        "feature_groups": payload.feature_groups,
    }
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO npcs (
                name, tier, role, description, motives, tactics, difficulty,
                thresholds_major, thresholds_severe, hit_points, stress,
                attack_name, attack_range, attack_damage, attack_standard, attack_modifier,
                passive_features, action_features, reaction_features, fear_features, experiences_json,
                features, experiences, notes,
                data_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """,
            (
                payload.name.strip() if isinstance(payload.name, str) and payload.name.strip() else "Unnamed NPC",
                payload.tier,
                payload.role,
                payload.description,
                payload.motives,
                payload.tactics,
                payload.difficulty,
                payload.thresholds_major,
                payload.thresholds_severe,
                payload.hit_points,
                payload.stress,
                payload.attack_name,
                payload.attack_range,
                payload.attack_damage,
                payload.attack_standard,
                payload.attack_modifier,
                payload.passive_features,
                payload.action_features,
                payload.reaction_features,
                payload.fear_features,
                _dump_json(payload.experiences_list),
                payload.features,
                payload.experiences,
                payload.notes,
                _dump_json(data_json),
            ),
        )
        npc_id = int(cursor.lastrowid)
        connection.commit()
    return get_npc(npc_id) or {}


def update_npc(npc_id: int, payload: NPCCreate) -> dict[str, Any] | None:
    data_json = {
        **(payload.data_json or {}),
        "feature_groups": payload.feature_groups,
    }
    with get_connection() as connection:
        connection.execute(
            """
            UPDATE npcs
            SET name = ?,
                tier = ?,
                role = ?,
                description = ?,
                motives = ?,
                tactics = ?,
                difficulty = ?,
                thresholds_major = ?,
                thresholds_severe = ?,
                hit_points = ?,
                stress = ?,
                attack_name = ?,
                attack_range = ?,
                attack_damage = ?,
                attack_standard = ?,
                attack_modifier = ?,
                passive_features = ?,
                action_features = ?,
                reaction_features = ?,
                fear_features = ?,
                experiences_json = ?,
                features = ?,
                experiences = ?,
                notes = ?,
                data_json = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (
                payload.name.strip() if isinstance(payload.name, str) and payload.name.strip() else "Unnamed NPC",
                payload.tier,
                payload.role,
                payload.description,
                payload.motives,
                payload.tactics,
                payload.difficulty,
                payload.thresholds_major,
                payload.thresholds_severe,
                payload.hit_points,
                payload.stress,
                payload.attack_name,
                payload.attack_range,
                payload.attack_damage,
                payload.attack_standard,
                payload.attack_modifier,
                payload.passive_features,
                payload.action_features,
                payload.reaction_features,
                payload.fear_features,
                _dump_json(payload.experiences_list),
                payload.features,
                payload.experiences,
                payload.notes,
                _dump_json(data_json),
                npc_id,
            ),
        )
        connection.commit()
    return get_npc(npc_id)


def delete_npc(npc_id: int) -> None:
    with get_connection() as connection:
        connection.execute("DELETE FROM npcs WHERE id = ?", (npc_id,))
        connection.commit()


def list_environments() -> list[dict[str, Any]]:
    rows = fetch_all(
        """
        SELECT id, name, tier, environment_type, description, impulses, difficulty,
               potential_adversaries, features, notes, data_json, created_at, updated_at
        FROM environments
        ORDER BY updated_at DESC, id DESC
        """
    )
    return [_load_builder_row(row) for row in rows if row is not None]


def get_environment(environment_id: int) -> dict[str, Any] | None:
    row = fetch_one(
        """
        SELECT id, name, tier, environment_type, description, impulses, difficulty,
               potential_adversaries, features, notes, data_json, created_at, updated_at
        FROM environments
        WHERE id = ?
        """,
        (environment_id,),
    )
    return _load_builder_row(row)


def create_environment(payload: EnvironmentCreate) -> dict[str, Any]:
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO environments (
                name, tier, environment_type, description, impulses, difficulty,
                potential_adversaries, features, notes, data_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """,
            (
                payload.name,
                payload.tier,
                payload.environment_type,
                payload.description,
                payload.impulses,
                payload.difficulty,
                payload.potential_adversaries,
                payload.features,
                payload.notes,
                _dump_json(payload.data_json),
            ),
        )
        environment_id = int(cursor.lastrowid)
        connection.commit()
    return get_environment(environment_id) or {}


def update_environment(environment_id: int, payload: EnvironmentCreate) -> dict[str, Any] | None:
    with get_connection() as connection:
        connection.execute(
            """
            UPDATE environments
            SET name = ?,
                tier = ?,
                environment_type = ?,
                description = ?,
                impulses = ?,
                difficulty = ?,
                potential_adversaries = ?,
                features = ?,
                notes = ?,
                data_json = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (
                payload.name,
                payload.tier,
                payload.environment_type,
                payload.description,
                payload.impulses,
                payload.difficulty,
                payload.potential_adversaries,
                payload.features,
                payload.notes,
                _dump_json(payload.data_json),
                environment_id,
            ),
        )
        connection.commit()
    return get_environment(environment_id)


def delete_environment(environment_id: int) -> None:
    with get_connection() as connection:
        connection.execute("DELETE FROM environments WHERE id = ?", (environment_id,))
        connection.commit()


def list_player_characters() -> list[dict[str, Any]]:
    return fetch_all(
        """
        SELECT id, name, class_name, subclass_name, level, updated_at
        FROM characters
        ORDER BY updated_at DESC, id DESC
        """
    )
