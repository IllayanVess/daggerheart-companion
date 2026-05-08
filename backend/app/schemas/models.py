from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

ADVERSARY_ROLE_OPTIONS = (
    "Bruiser",
    "Horde",
    "Leader",
    "Minion",
    "Ranged",
    "Skulk",
    "Social",
    "Solo",
    "Standard",
    "Support",
)


class AdversaryBase(BaseModel):
    name: str
    tier: int = 1
    role: str | None = "Standard"
    description: str | None = None
    motives: str | None = None
    tactics: str | None = None
    difficulty: int | None = None
    thresholds_major: int | None = None
    thresholds_severe: int | None = None
    hit_points: int | None = None
    stress: int | None = None
    attack_name: str | None = None
    attack_range: str | None = None
    attack_damage: str | None = None
    attack_standard: str | None = None
    attack_modifier: int | None = None
    passive_features: str | None = None
    action_features: str | None = None
    reaction_features: str | None = None
    fear_features: str | None = None
    feature_groups: dict[str, list[str]] = Field(default_factory=dict)
    features: str | None = None
    experiences_list: list[dict[str, Any]] = Field(default_factory=list)
    experiences: str | None = None
    notes: str | None = None
    data_json: dict[str, Any] = Field(default_factory=dict)

    @field_validator("experiences_list", mode="before")
    @classmethod
    def coerce_experiences_list(cls, value: Any) -> list:
     if isinstance(value, list):
        return value
     return []

    def model_post_init(self, __context: Any) -> None:
        if self.role:
            normalized_role = self.role.strip().title()
            if normalized_role == "Standards":
                normalized_role = "Standard"
            if normalized_role == "Socials":
                normalized_role = "Social"
            if normalized_role not in ADVERSARY_ROLE_OPTIONS:
                raise ValueError(f"role must be one of: {', '.join(ADVERSARY_ROLE_OPTIONS)}")
            self.role = normalized_role

        if self.tier < 1 or self.tier > 4:
            raise ValueError("tier must be between 1 and 4")

        attack_parts = [part for part in (self.attack_name, self.attack_range, self.attack_damage) if part]
        if attack_parts:
            self.attack_standard = " | ".join(
                part.strip()
                for part in (
                    self.attack_name or "",
                    self.attack_range or "",
                    self.attack_damage or "",
                )
                if part and part.strip()
            )

        feature_sections = [
            ("Passive", self.passive_features),
            ("Action", self.action_features),
            ("Reaction", self.reaction_features),
            ("Fear", self.fear_features),
        ]
        normalized_feature_groups: dict[str, list[str]] = {}
        for key, values in self.feature_groups.items():
            if not isinstance(key, str) or not isinstance(values, list):
                continue
            normalized_values = [
                value.strip()
                for value in values
                if isinstance(value, str) and value.strip()
            ]
            if normalized_values:
                normalized_feature_groups[key.strip()] = normalized_values

        if normalized_feature_groups:
            self.feature_groups = normalized_feature_groups
            self.passive_features = "\n\n".join(normalized_feature_groups.get("passive", [])) or None
            self.action_features = "\n\n".join(normalized_feature_groups.get("action", [])) or None
            self.reaction_features = "\n\n".join(normalized_feature_groups.get("reaction", [])) or None
            self.fear_features = "\n\n".join(normalized_feature_groups.get("fear", [])) or None
            feature_sections = [
                (key.replace("_", " ").title(), "\n\n".join(values))
                for key, values in normalized_feature_groups.items()
            ]

        structured_features = [
            f"{label}: {content.strip()}"
            for label, content in feature_sections
            if isinstance(content, str) and content.strip()
        ]
        if structured_features:
            self.features = "\n\n".join(structured_features)

        normalized_experiences: list[dict[str, Any]] = []
        for experience in self.experiences_list:
            if not isinstance(experience, dict):
                continue
            name = experience.get("name")
            modifier = experience.get("modifier", 2)
            if isinstance(name, str) and name.strip():
                normalized_experiences.append(
                    {
                        "name": name.strip(),
                        "modifier": int(modifier) if isinstance(modifier, int) else 2,
                    }
                )
        self.experiences_list = normalized_experiences
        if normalized_experiences:
            self.experiences = ", ".join(
                f"{entry['name']} {entry['modifier']:+d}"
                for entry in normalized_experiences
            )


class AdversaryCreate(AdversaryBase):
    pass


class AdversaryResponse(AdversaryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class NPCBase(BaseModel):
    name: str | None = None
    tier: int | None = None
    role: str | None = None
    description: str | None = None
    motives: str | None = None
    tactics: str | None = None
    difficulty: int | None = None
    thresholds_major: int | None = None
    thresholds_severe: int | None = None
    hit_points: int | None = None
    stress: int | None = None
    attack_name: str | None = None
    attack_range: str | None = None
    attack_damage: str | None = None
    attack_standard: str | None = None
    attack_modifier: int | None = None
    passive_features: str | None = None
    action_features: str | None = None
    reaction_features: str | None = None
    fear_features: str | None = None
    feature_groups: dict[str, list[str]] = Field(default_factory=dict)
    features: str | None = None
    experiences_list: list[dict[str, Any]] = Field(default_factory=list)
    experiences: str | None = None
    notes: str | None = None
    data_json: dict[str, Any] = Field(default_factory=dict)

    @field_validator("experiences_list", mode="before")
    @classmethod
    def coerce_experiences_list(cls, value: Any) -> list:
     if isinstance(value, list):
        return value
     return []

    def model_post_init(self, __context: Any) -> None:
        if isinstance(self.role, str):
            self.role = self.role.strip() or None

        if self.tier is not None and (self.tier < 1 or self.tier > 4):
            raise ValueError("tier must be between 1 and 4 when provided")

        attack_parts = [part for part in (self.attack_name, self.attack_range, self.attack_damage) if part]
        if attack_parts:
            self.attack_standard = " | ".join(
                part.strip()
                for part in (
                    self.attack_name or "",
                    self.attack_range or "",
                    self.attack_damage or "",
                )
                if part and part.strip()
            )

        normalized_feature_groups: dict[str, list[str]] = {}
        for key, values in self.feature_groups.items():
            if not isinstance(key, str) or not isinstance(values, list):
                continue
            normalized_values = [
                value.strip()
                for value in values
                if isinstance(value, str) and value.strip()
            ]
            normalized_feature_groups[key.strip()] = normalized_values
        self.feature_groups = normalized_feature_groups

        feature_sections = [
            ("Passive", self.passive_features),
            ("Action", self.action_features),
            ("Reaction", self.reaction_features),
            ("Fear", self.fear_features),
        ]
        if any(normalized_feature_groups.values()):
            self.passive_features = "\n\n".join(normalized_feature_groups.get("passive", [])) or None
            self.action_features = "\n\n".join(normalized_feature_groups.get("action", [])) or None
            self.reaction_features = "\n\n".join(normalized_feature_groups.get("reaction", [])) or None
            self.fear_features = "\n\n".join(normalized_feature_groups.get("fear", [])) or None
            feature_sections = [
                (key.replace("_", " ").title(), "\n\n".join(values))
                for key, values in normalized_feature_groups.items()
            ]

        structured_features = [
            f"{label}: {content.strip()}"
            for label, content in feature_sections
            if isinstance(content, str) and content.strip()
        ]
        if structured_features:
            self.features = "\n\n".join(structured_features)

        normalized_experiences: list[dict[str, Any]] = []
        for experience in self.experiences_list:
            if not isinstance(experience, dict):
                continue
            name = experience.get("name")
            modifier = experience.get("modifier", 2)
            if isinstance(name, str) and name.strip():
                normalized_experiences.append(
                    {
                        "name": name.strip(),
                        "modifier": int(modifier) if isinstance(modifier, int) else 2,
                    }
                )
        self.experiences_list = normalized_experiences
        if normalized_experiences:
            self.experiences = ", ".join(
                f"{entry['name']} {entry['modifier']:+d}"
                for entry in normalized_experiences
            )


class NPCCreate(NPCBase):
    pass


class NPCResponse(NPCBase):
    id: int
    name: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EnvironmentBase(BaseModel):
    name: str
    tier: int = 1
    environment_type: str = "Traversal"
    description: str | None = None
    impulses: str | None = None
    difficulty: int | None = None
    potential_adversaries: str | None = None
    features: str | None = None
    notes: str | None = None
    data_json: dict[str, Any] = Field(default_factory=dict)


class EnvironmentCreate(EnvironmentBase):
    pass


class EnvironmentResponse(EnvironmentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CharacterBase(BaseModel):
    name: str
    class_name: str
    subclass_name: str | None = None
    ancestry: str | None = None
    community: str | None = None
    level: int = 1
    evasion: int | None = 0
    armor: int | None = None
    hit_points: int | None = 0
    stress: int | None = 6
    hope: int | None = 2
    notes: str | None = None
    data_json: dict[str, Any] = Field(default_factory=dict)


class CharacterCreate(CharacterBase):
    pass


class CharacterResponse(CharacterBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


Character = CharacterResponse


class CharacterSummary(BaseModel):
    id: int
    name: str
    class_name: str
    subclass_name: str | None = None
    level: int
    updated_at: datetime


class CharacterTrackersUpdate(BaseModel):
    hit_points: int | None = None
    stress: int | None = None
    hope: int | None = None
    armor: int | None = None
    gold_handfuls: int | None = None
    gold_bags: int | None = None
    gold_chests: int | None = None
    prayer_dice: int | None = None
    unstoppable_value: int | None = None


class CharacterSheetDetailsUpdate(BaseModel):
    companion_name: str | None = None
    companion_evasion: int | None = None
    companion_notes: str | None = None
    rally_die_value: str | None = None
    rally_notes: str | None = None
    warrior_notes: str | None = None
    inventory_notes: str | None = None


class CharacterInventoryEntry(BaseModel):
    id: int
    character_id: int
    item_name: str
    category: str | None = None
    quantity: int = 1
    equipped: bool = False
    slot_name: str | None = None
    notes: str | None = None
    created_at: datetime | None = None


class CharacterInventoryCreate(BaseModel):
    item_name: str
    quantity: int = 1
    notes: str | None = None


class CharacterInventoryUpdate(BaseModel):
    quantity: int | None = None
    equipped: bool | None = None
    slot_name: str | None = None
    notes: str | None = None


class ClassOption(BaseModel):
    class_name: str
    subclass1_name: str | None = None
    subclass1_description: str | None = None
    subclass2_name: str | None = None
    subclass2_description: str | None = None


class ClassDetail(BaseModel):
    class_name: str
    domains: list[str]
    starting_evasion: int
    starting_hit_points: int
    class_items: list[str]
    hope_feature: str
    class_feature: str
    subclass_names: list[str] = Field(default_factory=list)


class SubclassDetail(BaseModel):
    subclass_name: str
    class_name: str
    spellcast_trait: int | None = None
    spellcast_trait_type: str | None = None
    foundation_feature: str
    specialization_feature: str | None = None
    mastery_feature: str | None = None


class AncestryOption(BaseModel):
    ancestry_name: str
    ancestry_feature1: str | None = None
    ancestry_feature2: str | None = None


class CommunityOption(BaseModel):
    community_name: str
    community_feature: str | None = None


class DomainCardOption(BaseModel):
    card_name: str
    domain_name: str
    card_level: int
    card_type: str
    card_text: str
    recall_cost: int | None = None
    source_url: str | None = None


class EquipmentOption(BaseModel):
    item_name: str
    category: str
    subcategory: str | None = None
    tier: int | None = None
    trait_name: str | None = None
    range_name: str | None = None
    damage_text: str | None = None
    damage_type: str | None = None
    burden: str | None = None
    thresholds_major: int | None = None
    thresholds_severe: int | None = None
    base_score: int | None = None
    feature_text: str | None = None
    description_text: str | None = None
    source_url: str | None = None


class InventoryCatalogOption(BaseModel):
    item_name: str
    category: str
    subcategory: str | None = None
    description_text: str
    source_url: str | None = None


class NamedRoll(BaseModel):
    id: str
    name: str
    expression: str


class BoardToken(BaseModel):
    id: str
    sourceId: str
    type: str  # "pc" | "adversary" | "npc" | "object"
    name: str
    portraitUrl: Optional[str] = None
    currentHp: int = 0
    maxHp: int = 0
    currentStress: int = 0
    maxStress: int = 0
    namedRolls: List[NamedRoll] = []
    description: Optional[str] = None
    data: Dict[str, Any] = {}


class CellState(BaseModel):
    environment: Optional[str] = None
    creature: Optional[BoardToken] = None
    objects: List[BoardToken] = []


class BoardState(BaseModel):
    id: str
    defaultEnvironment: Optional[str] = None
    cells: Dict[str, CellState] = {}
