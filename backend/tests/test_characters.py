# backend/tests/test_characters.py
"""
Tests for character API endpoints.
Covers CRUD operations, inventory management, and tracker updates.
"""

import json
import pytest


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

ARAGORN_PAYLOAD = {
    "name": "Aragorn",
    "class_name": "Warrior",
    "subclass_name": "Call of the Brave",
    "ancestry": "Human",
    "community": "Harborfolk",
    "level": 1,
    "evasion": 10,
    "armor": 12,
    "hit_points": 10,
    "stress": 6,
    "hope": 2,
    "notes": "A ranger from the north",
    "data_json": {
        "traits": {
            "Agility": "+1",
            "Strength": "+2",
            "Finesse": "+1",
            "Instinct": "+0",
            "Presence": "+0",
            "Knowledge": "-1",
        },
        "proficiency": 1,
        "max_hit_points": 10,
        "max_stress": 6,
        "pronouns": "he/him",
        "description": "A tall mysterious stranger",
    },
}


def create_aragorn(client) -> int:
    """Create the standard Aragorn character and return its ID."""
    response = client.post("/api/characters", json=ARAGORN_PAYLOAD)
    assert response.status_code == 201, response.text
    return response.json()["id"]


# ---------------------------------------------------------------------------
# Creation
# ---------------------------------------------------------------------------


class TestCharacterCreation:
    """Tests for creating new characters"""

    def test_create_character_success(self, client):
        """Test successful character creation with valid data"""
        response = client.post("/api/characters", json=ARAGORN_PAYLOAD)
        assert response.status_code == 201
        data = response.json()

        assert data["id"] is not None
        assert data["name"] == "Aragorn"
        assert data["class_name"] == "Warrior"
        assert data["level"] == 1
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_character_minimal_data(self, client):
        """Test character creation with only required fields"""
        character_data = {
            "name": "Minimal Hero",
            "class_name": "Bard",
            "data_json": {},
        }

        response = client.post("/api/characters", json=character_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Minimal Hero"
        assert data["class_name"] == "Bard"
        assert data["level"] == 1  # default value

    def test_create_character_missing_name(self, client):
        """Test character creation fails without name"""
        character_data = {
            "class_name": "Warrior",
            "data_json": {},
        }

        response = client.post("/api/characters", json=character_data)
        assert response.status_code == 422  # Validation error

    def test_create_character_with_full_traits(self, client):
        """Test character creation with all six traits assigned"""
        character_data = {
            "name": "Balanced Hero",
            "class_name": "Rogue",
            "data_json": {
                "traits": {
                    "Agility": "+2",
                    "Strength": "+1",
                    "Finesse": "+1",
                    "Instinct": "+0",
                    "Presence": "+0",
                    "Knowledge": "-1",
                }
            },
        }

        response = client.post("/api/characters", json=character_data)
        assert response.status_code == 201
        data = response.json()
        traits = data["data_json"]["traits"]
        assert traits["Agility"] == "+2"
        assert traits["Knowledge"] == "-1"


# ---------------------------------------------------------------------------
# Retrieval
# ---------------------------------------------------------------------------


class TestCharacterRetrieval:
    """Tests for getting character data"""

    def test_get_character_by_id(self, client):
        """Test retrieving a character by ID"""
        char_id = create_aragorn(client)

        response = client.get(f"/api/characters/{char_id}")
        assert response.status_code == 200
        data = response.json()

        assert data["id"] == char_id
        assert data["name"] == "Aragorn"
        assert data["class_name"] == "Warrior"

    def test_get_character_not_found(self, client):
        """Test getting a non-existent character returns 404"""
        response = client.get("/api/characters/99999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_list_all_characters(self, client):
        """Test retrieving the list of all characters"""
        char1_id = create_aragorn(client)

        char2_data = {"name": "Legolas", "class_name": "Ranger", "data_json": {}}
        response = client.post("/api/characters", json=char2_data)
        assert response.status_code == 201
        char2_id = response.json()["id"]

        response = client.get("/api/characters")
        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        assert len(data) >= 2
        assert any(c["id"] == char1_id for c in data)
        assert any(c["id"] == char2_id for c in data)

    def test_list_character_summaries(self, client):
        """Test retrieving character summaries (lightweight)"""
        create_aragorn(client)

        response = client.get("/api/characters/summary")
        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        if len(data) > 0:
            summary = data[0]
            assert "id" in summary
            assert "name" in summary
            assert "class_name" in summary
            assert "level" in summary
            # Should NOT have full data_json
            assert "data_json" not in summary


# ---------------------------------------------------------------------------
# Updates
# ---------------------------------------------------------------------------


class TestCharacterUpdate:
    """Tests for updating characters"""

    def test_update_character_trackers(self, client):
        """Test updating HP, Stress, and Hope trackers"""
        char_id = create_aragorn(client)

        update_data = {"hit_points": 5, "stress": 3, "hope": 1, "armor": 4}

        response = client.patch(f"/api/characters/{char_id}/trackers", json=update_data)
        assert response.status_code == 200
        data = response.json()

        assert data["hit_points"] == 5
        assert data["stress"] == 3
        assert data["hope"] == 1
        assert data["armor"] == 4

    def test_update_character_gold(self, client):
        """Test updating gold trackers"""
        char_id = create_aragorn(client)

        update_data = {
            "gold_handfuls": 5,
            "gold_bags": 2,
            "gold_chests": 1,
            "prayer_dice": 3,
            "unstoppable_value": 4,
        }

        response = client.patch(f"/api/characters/{char_id}/trackers", json=update_data)
        assert response.status_code == 200
        data = response.json()

        # Gold fields are stored in data_json by the backend
        payload = data["data_json"]
        assert payload["gold_handfuls"] == 5
        assert payload["gold_bags"] == 2
        assert payload["gold_chests"] == 1
        assert payload["prayer_dice"] == 3
        assert payload["unstoppable_value"] == 4

    def test_update_character_sheet_details(self, client):
        """Test updating sheet details (companion, rally, etc.)"""
        char_id = create_aragorn(client)

        update_data = {
            "companion_name": "Shadow",
            "companion_evasion": 14,
            "companion_notes": "Loyal wolf companion",
            "rally_die_value": "d8",
            "rally_notes": "Inspire allies",
            "warrior_notes": "Combat training notes",
            "inventory_notes": "Carries a magical sword",
        }

        response = client.patch(
            f"/api/characters/{char_id}/sheet-details", json=update_data
        )
        assert response.status_code == 200
        data = response.json()
        payload = data["data_json"]

        assert payload["companion_name"] == "Shadow"
        assert payload["companion_evasion"] == 14
        assert payload["companion_notes"] == "Loyal wolf companion"
        assert payload["rally_die_value"] == "d8"
        assert payload["rally_notes"] == "Inspire allies"
        assert payload["warrior_notes"] == "Combat training notes"
        assert payload["inventory_notes"] == "Carries a magical sword"

    def test_full_character_update(self, client):
        """Test full character replacement (PUT)"""
        char_id = create_aragorn(client)

        updated_data = {
            "name": "Aragorn Updated",
            "class_name": "Warrior",
            "subclass_name": "Call of the Slayer",
            "ancestry": "Human",
            "community": "Nomad",
            "level": 2,
            "evasion": 12,
            "armor": 14,
            "hit_points": 15,
            "stress": 7,
            "hope": 3,
            "notes": "Now a seasoned warrior",
            "data_json": {
                "traits": {
                    "Agility": "+2",
                    "Strength": "+2",
                    "Finesse": "+1",
                    "Instinct": "+0",
                    "Presence": "+0",
                    "Knowledge": "-1",
                },
                "proficiency": 2,
                "max_hit_points": 15,
                "max_stress": 7,
            },
        }

        response = client.put(f"/api/characters/{char_id}", json=updated_data)
        assert response.status_code == 200
        data = response.json()

        assert data["name"] == "Aragorn Updated"
        assert data["level"] == 2
        assert data["evasion"] == 12
        assert data["hit_points"] == 15


# ---------------------------------------------------------------------------
# Inventory
# ---------------------------------------------------------------------------


class TestCharacterInventory:
    """Tests for character inventory management"""

    def test_get_empty_inventory(self, client):
        """Test retrieving inventory for a character with no items"""
        char_id = create_aragorn(client)

        response = client.get(f"/api/characters/{char_id}/inventory")
        assert response.status_code == 200
        assert response.json() == []

    def test_add_inventory_item(self, client):
        """Test adding an item to character inventory"""
        char_id = create_aragorn(client)

        inventory_data = {
            "item_name": "Longsword",
            "quantity": 1,
            "notes": "Family heirloom",
        }

        response = client.post(
            f"/api/characters/{char_id}/inventory", json=inventory_data
        )
        assert response.status_code == 201
        data = response.json()

        assert data["character_id"] == char_id
        assert data["item_name"] == "Longsword"
        assert data["quantity"] == 1
        assert data["notes"] == "Family heirloom"
        assert data["id"] is not None

    def test_add_multiple_inventory_items(self, client):
        """Test adding multiple items to inventory"""
        char_id = create_aragorn(client)

        items = ["Health Potion", "Rope", "Torch"]
        for item in items:
            response = client.post(
                f"/api/characters/{char_id}/inventory", json={"item_name": item}
            )
            assert response.status_code == 201

        response = client.get(f"/api/characters/{char_id}/inventory")
        assert len(response.json()) == 3

    def test_list_inventory_items(self, client):
        """Test listing all inventory items for a character"""
        char_id = create_aragorn(client)

        client.post(
            f"/api/characters/{char_id}/inventory", json={"item_name": "Steel Sword"}
        )

        response = client.get(f"/api/characters/{char_id}/inventory")
        assert response.status_code == 200
        data = response.json()

        assert len(data) >= 1
        assert data[0]["item_name"] == "Steel Sword"

    def test_update_inventory_item(self, client):
        """Test updating inventory item quantity and notes"""
        char_id = create_aragorn(client)

        add_response = client.post(
            f"/api/characters/{char_id}/inventory", json={"item_name": "Arrows"}
        )
        entry_id = add_response.json()["id"]

        update_data = {"quantity": 20, "notes": "Steel-tipped arrows"}
        response = client.patch(
            f"/api/characters/{char_id}/inventory/{entry_id}", json=update_data
        )
        assert response.status_code == 200
        data = response.json()

        assert data["quantity"] == 20
        assert data["notes"] == "Steel-tipped arrows"

    def test_equip_inventory_item(self, client):
        """Test equipping an inventory item (primary weapon)"""
        char_id = create_aragorn(client)

        add_response = client.post(
            f"/api/characters/{char_id}/inventory", json={"item_name": "Battle Axe"}
        )
        entry_id = add_response.json()["id"]

        update_data = {"equipped": True, "slot_name": "primary"}
        response = client.patch(
            f"/api/characters/{char_id}/inventory/{entry_id}", json=update_data
        )
        assert response.status_code == 200
        data = response.json()

        assert data["equipped"] is True
        assert data["slot_name"] == "primary"

    def test_delete_inventory_item(self, client):
        """Test removing an item from inventory"""
        char_id = create_aragorn(client)

        add_response = client.post(
            f"/api/characters/{char_id}/inventory", json={"item_name": "Shield"}
        )
        entry_id = add_response.json()["id"]

        response = client.delete(f"/api/characters/{char_id}/inventory/{entry_id}")
        assert response.status_code == 200

        get_response = client.get(f"/api/characters/{char_id}/inventory")
        assert not any(item["id"] == entry_id for item in get_response.json())

    def test_inventory_not_found(self, client):
        """Test getting inventory for non-existent character"""
        response = client.get("/api/characters/99999/inventory")
        assert response.status_code == 404


# ---------------------------------------------------------------------------
# Error handling
# ---------------------------------------------------------------------------


class TestCharacterErrorHandling:
    """Tests for error scenarios"""

    def test_update_trackers_character_not_found(self, client):
        """Test updating trackers for non-existent character"""
        update_data = {"hit_points": 10}
        response = client.patch("/api/characters/99999/trackers", json=update_data)
        assert response.status_code == 404

    def test_update_sheet_details_character_not_found(self, client):
        """Test updating sheet details for non-existent character"""
        update_data = {"companion_name": "Test"}
        response = client.patch("/api/characters/99999/sheet-details", json=update_data)
        assert response.status_code == 404

    def test_invalid_trait_assignment(self, client):
        """Test that invalid trait assignments are handled"""
        character_data = {
            "name": "Invalid Hero",
            "class_name": "Warrior",
            "data_json": {
                "traits": {
                    "Agility": "+2",
                    "Strength": "+2",  # Two +2 modifiers (invalid per game rules)
                    "Finesse": "+1",
                    "Instinct": "+0",
                    "Presence": "+0",
                    "Knowledge": "-1",
                }
            },
        }

        # Trait validation is frontend-side; backend should not crash
        response = client.post("/api/characters", json=character_data)
        assert response.status_code in [201, 422]