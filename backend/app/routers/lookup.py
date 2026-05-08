from __future__ import annotations

from fastapi import APIRouter, HTTPException, Path, Query, status

from app.db import fetch_all, fetch_one
from app.schemas.models import (
    AncestryOption,
    ClassDetail,
    ClassOption,
    CommunityOption,
    DomainCardOption,
    EquipmentOption,
    InventoryCatalogOption,
    SubclassDetail,
)

router = APIRouter(prefix="/lookup", tags=["lookup"])

CLASS_TABLE_MAP = {
    "bard": {
        "table": "Bard",
        "domain1": "bard_domain1",
        "domain2": "bard_domain2",
        "evasion": "bard_evasion",
        "hit_points": "bard_starting_hit_points",
        "item1": "bard_item1",
        "item2": "bard_item2",
        "hope": "bard_hope_feature",
        "feature": "bard_class_feature",
    },
    "druid": {
        "table": "Druid",
        "domain1": "druid_domain1",
        "domain2": "druid_domain2",
        "evasion": "druid_evasion",
        "hit_points": "druid_starting_hit_points",
        "item1": "druid_item1",
        "item2": "druid_item2",
        "hope": "druid_hope_feature",
        "feature": "druid_class_feature",
    },
    "guardian": {
        "table": "Guardian",
        "domain1": "guardian_domain1",
        "domain2": "guardian_domain2",
        "evasion": "guardian_evasion",
        "hit_points": "guardian_starting_hit_points",
        "item1": "guardian_item1",
        "item2": "guardian_item2",
        "hope": "guardian_hope_feature",
        "feature": "guardian_class_feature",
    },
    "ranger": {
        "table": "Ranger",
        "domain1": "ranger_domain1",
        "domain2": "ranger_domain2",
        "evasion": "ranger_evasion",
        "hit_points": "ranger_starting_hit_points",
        "item1": "ranger_item1",
        "item2": "ranger_item2",
        "hope": "ranger_hope_feature",
        "feature": "ranger_class_feature",
    },
    "rogue": {
        "table": "Rogue",
        "domain1": "rogue_domain1",
        "domain2": "rogue_domain2",
        "evasion": "rogue_evasion",
        "hit_points": "rogue_starting_hit_points",
        "item1": "rogue_item1",
        "item2": "rogue_item2",
        "hope": "rogue_hope_feature",
        "feature": "rogue_class_feature",
    },
    "seraph": {
        "table": "Seraph",
        "domain1": "seraph_domain1",
        "domain2": "seraph_domain2",
        "evasion": "seraph_evasion",
        "hit_points": "seraph_starting_hit_points",
        "item1": "seraph_item1",
        "item2": "seraph_item2",
        "hope": "seraph_hope_feature",
        "feature": "seraph_class_feature",
    },
    "sorcerer": {
        "table": "Sorcerer",
        "domain1": "sorcerer_domain1",
        "domain2": "sorcerer_domain2",
        "evasion": "sorcerer_evasion",
        "hit_points": "sorcerer_starting_hit_points",
        "item1": "sorcerer_item1",
        "item2": "sorcerer_item2",
        "hope": "sorcerer_hope_feature",
        "feature": "sorcerer_class_feature",
    },
    "warrior": {
        "table": "Warrior",
        "domain1": "warrior_domain1",
        "domain2": "warrior_domain2",
        "evasion": "warrior_evasion",
        "hit_points": "warrior_starting_hit_points",
        "item1": "warrior_item1",
        "item2": "warrior_item2",
        "hope": "warrior_hope_feature",
        "feature": "warrior_class_feature",
    },
    "wizard": {
        "table": "Wizard",
        "domain1": "wizard_domain1",
        "domain2": "wizard_domain2",
        "evasion": "wizard_evasion",
        "hit_points": "wizard_starting_hit_points",
        "item1": "wizard_item1",
        "item2": "wizard_item2",
        "hope": "wizard_hope_feature",
        "feature": "wizard_class_feature",
    },
}

SUBCLASS_TABLE_MAP = {
    "troubadour": {
        "table": "Troubadour",
        "class_name": "Bard",
        "trait": "troubadour_spellcast_trait",
        "trait_type": "troubadour_spellcast_trait_type",
        "foundation": "troubadour_foundation_feature",
        "specialization": "troubadour_specialization_feature",
        "mastery": "troubadour_mastery_feature",
    },
    "wordsmith": {
        "table": "Wordsmith",
        "class_name": "Bard",
        "trait": "wordsmith_spellcast_trait",
        "trait_type": "wordsmith_spellcast_trait_type",
        "foundation": "wordsmith_foundation_feature",
        "specialization": "wordsmith_specialization_feature",
        "mastery": "wordsmith_mastery_feature",
    },
    "warden of the elements": {
        "table": "Warden_of_the_Elements",
        "class_name": "Druid",
        "trait": "warden_elements_spellcast_trait",
        "trait_type": "warden_elements_spellcast_trait_type",
        "foundation": "warden_elements_foundation_feature",
        "specialization": "warden_elements_specialization_feature",
        "mastery": "warden_elements_mastery_feature",
    },
    "warden of renewal": {
        "table": "Warden_of_Renewal",
        "class_name": "Druid",
        "trait": "warden_renewal_spellcast_trait",
        "trait_type": "warden_renewal_spellcast_trait_type",
        "foundation": "warden_renewal_foundation_feature",
        "specialization": "warden_renewal_specialization_feature",
        "mastery": "warden_renewal_mastery_feature",
    },
    "stalwart": {
        "table": "Stalwart",
        "class_name": "Guardian",
        "trait": "stalwart_trait",
        "trait_type": "stalwart_trait_type",
        "foundation": "stalwart_foundation_feature",
        "specialization": "stalwart_specialization_feature",
        "mastery": "stalwart_mastery_feature",
    },
    "vengeance": {
        "table": "Vengeance",
        "class_name": "Guardian",
        "trait": "vengeance_trait",
        "trait_type": "vengeance_trait_type",
        "foundation": "vengeance_foundation_feature",
        "specialization": "vengeance_specialization_feature",
        "mastery": "vengeance_mastery_feature",
    },
    "beastbound": {
        "table": "Beastbound",
        "class_name": "Ranger",
        "trait": "beastbound_trait",
        "trait_type": "beastbound_trait_type",
        "foundation": "beastbound_foundation_feature",
        "specialization": "beastbound_specialization_feature",
        "mastery": "beastbound_mastery_feature",
    },
    "wayfinder": {
        "table": "Wayfinder",
        "class_name": "Ranger",
        "trait": "wayfinder_trait",
        "trait_type": "wayfinder_trait_type",
        "foundation": "wayfinder_foundation_feature",
        "specialization": "wayfinder_specialization_feature",
        "mastery": "wayfinder_mastery_feature",
    },
    "nightwalker": {
        "table": "Nightwalker",
        "class_name": "Rogue",
        "trait": "nightwalker_trait",
        "trait_type": "nightwalker_trait_type",
        "foundation": "nightwalker_foundation_feature",
        "specialization": "nightwalker_specialization_feature",
        "mastery": "nightwalker_mastery_feature",
    },
    "syndicate": {
        "table": "Syndicate",
        "class_name": "Rogue",
        "trait": "syndicate_trait",
        "trait_type": "syndicate_trait_type",
        "foundation": "syndicate_foundation_feature",
        "specialization": "syndicate_specialization_feature",
        "mastery": "syndicate_mastery_feature",
    },
    "winged sentinel": {
        "table": "Winged_Sentinel",
        "class_name": "Seraph",
        "trait": "winged_sentinel_trait",
        "trait_type": "winged_sentinel_trait_type",
        "foundation": "winged_sentinel_foundation_feature",
        "specialization": "winged_sentinel_specialization_feature",
        "mastery": "winged_sentinel_mastery_feature",
    },
    "divine wielder": {
        "table": "Divine_Wielder",
        "class_name": "Seraph",
        "trait": "divine_wielder_trait",
        "trait_type": "divine_wielder_trait_type",
        "foundation": "divine_wielder_foundation_feature",
        "specialization": "divine_wielder_specialization_feature",
        "mastery": "divine_wielder_mastery_feature",
    },
    "elemental origin": {
        "table": "Elemental_Origin",
        "class_name": "Sorcerer",
        "trait": "elemental_origin_trait",
        "trait_type": "elemental_origin_trait_type",
        "foundation": "elemental_origin_foundation_feature",
        "specialization": "elemental_origin_specialization_feature",
        "mastery": "elemental_origin_mastery_feature",
    },
    "primal origin": {
        "table": "Primal_Origin",
        "class_name": "Sorcerer",
        "trait": "primal_origin_trait",
        "trait_type": "primal_origin_trait_type",
        "foundation": "primal_origin_foundation_feature",
        "specialization": "primal_origin_specialization_feature",
        "mastery": "primal_origin_mastery_feature",
    },
    "call of the brave": {
        "table": "Call_of_the_Brave",
        "class_name": "Warrior",
        "trait": "call_brave_trait",
        "trait_type": "call_brave_trait_type",
        "foundation": "call_brave_foundation_feature",
        "specialization": "call_brave_specialization_feature",
        "mastery": "call_brave_mastery_feature",
    },
    "call of the slayer": {
        "table": "Call_of_the_Slayer",
        "class_name": "Warrior",
        "trait": "call_slayer_trait",
        "trait_type": "call_slayer_trait_type",
        "foundation": "call_slayer_foundation_feature",
        "specialization": "call_slayer_specialization_feature",
        "mastery": "call_slayer_mastery_feature",
    },
    "school of knowledge": {
        "table": "School_of_Knowledge",
        "class_name": "Wizard",
        "trait": "school_knowledge_trait",
        "trait_type": "school_knowledge_trait_type",
        "foundation": "school_knowledge_foundation_feature",
        "specialization": "school_knowledge_specialization_feature",
        "mastery": "school_knowledge_mastery_feature",
    },
    "school of war": {
        "table": "School_of_War",
        "class_name": "Wizard",
        "trait": "school_war_trait",
        "trait_type": "school_war_trait_type",
        "foundation": "school_war_foundation_feature",
        "specialization": "school_war_specialization_feature",
        "mastery": "school_war_mastery_feature",
    },
}


def _normalize_lookup_name(value: str) -> str:
    return value.strip().lower().replace("_", " ")


@router.get("/classes", response_model=list[ClassOption])
def list_classes() -> list[ClassOption]:
    rows = fetch_all(
        """
        SELECT class_name, subclass1_name, subclass1_description,
               subclass2_name, subclass2_description
        FROM Classes
        ORDER BY class_name
        """
    )
    return [ClassOption(**row) for row in rows]


@router.get("/ancestries", response_model=list[AncestryOption])
def list_ancestries() -> list[AncestryOption]:
    rows = fetch_all(
        """
        SELECT ancestry_name, ancestry_feature1, ancestry_feature2
        FROM Ancestry
        ORDER BY ancestry_name
        """
    )
    return [AncestryOption(**row) for row in rows]


@router.get("/communities", response_model=list[CommunityOption])
def list_communities() -> list[CommunityOption]:
    rows = fetch_all(
        """
        SELECT community_name, community_feature
        FROM Community
        ORDER BY community_name
        """
    )
    return [CommunityOption(**row) for row in rows]


@router.get("/domain-cards", response_model=list[DomainCardOption])
def list_domain_cards(
    class_name: str | None = Query(default=None, description="Optional class name to filter to that class's two domains."),
    domain_name: str | None = Query(default=None, description="Optional single domain filter."),
    max_level: int = Query(default=1, ge=1, description="Maximum card level to return."),
) -> list[DomainCardOption]:
    allowed_domains: list[str] = []

    if class_name:
        class_detail = get_class_detail(class_name)
        allowed_domains = class_detail.domains
    elif domain_name:
        allowed_domains = [domain_name]

    if allowed_domains:
        placeholders = ", ".join("?" for _ in allowed_domains)
        params = (*allowed_domains, max_level)
        rows = fetch_all(
            f"""
            SELECT card_name, domain_name, card_level, card_type, recall_cost, card_text, source_url
            FROM DomainCards
            WHERE domain_name IN ({placeholders}) AND card_level <= ?
            ORDER BY card_level, domain_name, card_name
            """,
            params,
        )
    else:
        rows = fetch_all(
            """
            SELECT card_name, domain_name, card_level, card_type, recall_cost, card_text, source_url
            FROM DomainCards
            WHERE card_level <= ?
            ORDER BY card_level, domain_name, card_name
            """,
            (max_level,),
        )

    return [DomainCardOption(**row) for row in rows]


@router.get("/equipment", response_model=list[EquipmentOption])
def list_equipment(
    category: str | None = Query(default=None, description="Optional category filter, e.g. Primary Weapon or Armor."),
    tier: int | None = Query(default=None, ge=1, description="Optional tier filter."),
    search: str | None = Query(default=None, description="Optional name search."),
) -> list[EquipmentOption]:
    category_value = category if isinstance(category, str) else None
    tier_value = tier if isinstance(tier, int) else None
    search_value = search if isinstance(search, str) else None

    clauses: list[str] = []
    params: list[object] = []

    if category_value:
        clauses.append("category = ?")
        params.append(category_value)

    if tier_value is not None:
        clauses.append("tier = ?")
        params.append(tier_value)

    if search_value:
        clauses.append("lower(item_name) LIKE ?")
        params.append(f"%{search_value.lower()}%")

    where_sql = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    rows = fetch_all(
        f"""
        SELECT item_name, category, subcategory, tier, trait_name, range_name, damage_text, damage_type,
               burden, thresholds_major, thresholds_severe, base_score, feature_text, description_text, source_url
        FROM Equipment
        {where_sql}
        ORDER BY COALESCE(tier, 0), item_name
        """,
        tuple(params),
    )
    return [EquipmentOption(**row) for row in rows]


@router.get("/items", response_model=list[InventoryCatalogOption])
def list_items(search: str | None = Query(default=None, description="Optional name search.")) -> list[InventoryCatalogOption]:
    params: list[object] = []
    where_sql = ""
    if isinstance(search, str) and search.strip():
        where_sql = "WHERE lower(item_name) LIKE ?"
        params.append(f"%{search.strip().lower()}%")

    rows = fetch_all(
        f"""
        SELECT item_name, 'Item' AS category, subcategory, description_text, source_url
        FROM Items
        {where_sql}
        ORDER BY item_name
        """,
        tuple(params),
    )
    return [InventoryCatalogOption(**row) for row in rows]


@router.get("/consumables", response_model=list[InventoryCatalogOption])
def list_consumables(
    search: str | None = Query(default=None, description="Optional name search."),
) -> list[InventoryCatalogOption]:
    params: list[object] = []
    where_sql = ""
    if isinstance(search, str) and search.strip():
        where_sql = "WHERE lower(item_name) LIKE ?"
        params.append(f"%{search.strip().lower()}%")

    rows = fetch_all(
        f"""
        SELECT item_name, 'Consumable' AS category, subcategory, description_text, source_url
        FROM Consumables
        {where_sql}
        ORDER BY item_name
        """,
        tuple(params),
    )
    return [InventoryCatalogOption(**row) for row in rows]


@router.get("/inventory-content", response_model=list[InventoryCatalogOption])
def list_inventory_content(
    search: str | None = Query(default=None, description="Optional name search across gear, items, and consumables."),
) -> list[InventoryCatalogOption]:
    params: list[object] = []
    where_clause = ""
    if isinstance(search, str) and search.strip():
        where_clause = "WHERE lower(item_name) LIKE ?"
        params.append(f"%{search.strip().lower()}%")

    rows = fetch_all(
        f"""
        SELECT item_name, category, subcategory, description_text, source_url
        FROM (
            SELECT item_name, category, subcategory, description_text, source_url
            FROM Equipment
            WHERE category IN ('Primary Weapon', 'Secondary Weapon', 'Armor')
            UNION ALL
            SELECT item_name, 'Item' AS category, subcategory, description_text, source_url
            FROM Items
            UNION ALL
            SELECT item_name, 'Consumable' AS category, subcategory, description_text, source_url
            FROM Consumables
        )
        {where_clause}
        ORDER BY category, item_name
        """,
        tuple(params),
    )
    return [InventoryCatalogOption(**row) for row in rows]


@router.get("/class/{class_name}", response_model=ClassDetail)
def get_class_detail(class_name: str = Path(..., description="Class name, for example Bard or Wizard")) -> ClassDetail:
    normalized_name = _normalize_lookup_name(class_name)
    config = CLASS_TABLE_MAP.get(normalized_name)
    if config is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")

    row = fetch_one(
        f"""
        SELECT
            {config["domain1"]} AS domain1,
            {config["domain2"]} AS domain2,
            {config["evasion"]} AS starting_evasion,
            {config["hit_points"]} AS starting_hit_points,
            {config["item1"]} AS item1,
            {config["item2"]} AS item2,
            {config["hope"]} AS hope_feature,
            {config["feature"]} AS class_feature
        FROM {config["table"]}
        LIMIT 1
        """
    )
    class_row = fetch_one(
        """
        SELECT class_name, subclass1_name, subclass2_name
        FROM Classes
        WHERE lower(class_name) = ?
        """,
        (normalized_name,),
    )
    if row is None or class_row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")

    return ClassDetail(
        class_name=class_row["class_name"],
        domains=[row["domain1"], row["domain2"]],
        starting_evasion=row["starting_evasion"],
        starting_hit_points=row["starting_hit_points"],
        class_items=[row["item1"], row["item2"]],
        hope_feature=row["hope_feature"],
        class_feature=row["class_feature"],
        subclass_names=[name for name in [class_row["subclass1_name"], class_row["subclass2_name"]] if name],
    )


@router.get("/subclass/{subclass_name}", response_model=SubclassDetail)
def get_subclass_detail(
    subclass_name: str = Path(..., description="Subclass name, for example Troubadour or School of War"),
) -> SubclassDetail:
    normalized_name = _normalize_lookup_name(subclass_name)
    config = SUBCLASS_TABLE_MAP.get(normalized_name)
    if config is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subclass not found")

    row = fetch_one(
        f"""
        SELECT
            {config["trait"]} AS spellcast_trait,
            {config["trait_type"]} AS spellcast_trait_type,
            {config["foundation"]} AS foundation_feature,
            {config["specialization"]} AS specialization_feature,
            {config["mastery"]} AS mastery_feature
        FROM {config["table"]}
        LIMIT 1
        """
    )
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subclass not found")

    return SubclassDetail(
        subclass_name=subclass_name.strip(),
        class_name=config["class_name"],
        spellcast_trait=row["spellcast_trait"],
        spellcast_trait_type=row["spellcast_trait_type"],
        foundation_feature=row["foundation_feature"],
        specialization_feature=row["specialization_feature"],
        mastery_feature=row["mastery_feature"],
    )
