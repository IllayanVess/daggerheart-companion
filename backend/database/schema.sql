/*
This is the sql Scheme its in 3 part :

-> User and campain handle
-> SRD table tables scrap from daggetheart
-> In game tables with a character and all its stats 

*/



/*
                    ***************************
                    *    USER AUTH SESSION    *
                    ***************************
*/

-- For user auth
CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'player',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- For gaming session
CREATE TABLE IF NOT EXISTS campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES profiles(user_id),
    name TEXT NOT NULL,
    description TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- For character in session
CREATE TABLE IF NOT EXISTS campaign_members (
    campaign_id UUID REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'player',
    PRIMARY KEY (campaign_id, user_id)
);


/*
                    ************************
                    *    SRD SCRAP DATA    *
                    ************************
*/

CREATE TABLE IF NOT EXISTS srd_classes (
    class_name TEXT PRIMARY KEY,
    class_description TEXT,

    domain1 TEXT UNIQUE,
    domain2 TEXT UNIQUE,

    class_item1 TEXT,
    class_item2 TEXT,

    evasion INTEGER,
    starting_hit_points INTEGER,

    hope_feature TEXT,
    class_feature TEXT,

    source_url TEXT
);

CREATE TABLE IF NOT EXISTS srd_subclass (
    subclass_name TEXT PRIMARY KEY,
    class_name TEXT REFERENCES srd_classes(class_name),

    subclass_description TEXT,
    spellcast_trait_type TEXT,
    spellcast_trait TEXT,

    foundation_feature TEXT,
    specialization_feature TEXT,
    mastery_feature TEXT,

    source_url TEXT
);

CREATE TABLE IF NOT EXISTS srd_ancestry (
    ancestry_name TEXT PRIMARY KEY,

    ancestry_feature_1_name TEXT,
    ancestry_feature_1_description TEXT,

    ancestry_feature_2_name TEXT,
    ancestry_feature_2_description TEXT,
    
    source_url TEXT
);

CREATE TABLE IF NOT EXISTS srd_community (
    community_name TEXT PRIMARY KEY,

    community_feature_name TEXT,
    community_feature_text TEXT,

    source_url TEXT
);                       

CREATE TABLE IF NOT EXISTS srd_domain_card (
    domain_card_name TEXT PRIMARY KEY,

    domain_name TEXT REFERENCES srd_classes(domain1),

    card_level INTEGER,
    card_type TEXT,
    recall_cost INTEGER,
    description_text TEXT,

    source_url TEXT
    );

CREATE TABLE IF NOT EXISTS srd_armor (
    item_name TEXT PRIMARY KEY,
    category TEXT,

    tier INTEGER,
    thresholds_major INTEGER,
    thresholds_severe INTEGER,
    base_score INTEGER,

    feature_text TEXT,
    description_text TEXT,

    source_url TEXT
);

CREATE TABLE IF NOT EXISTS srd_weapon (
    item_name TEXT PRIMARY KEY,
    category TEXT,

    tier INTEGER,
    trait TEXT,
    range TEXT,

    damage_text TEXT,
    damage_type TEXT,

    burden TEXT,

    feature_text TEXT,
    description_text TEXT,

    source_url TEXT   
);

CREATE TABLE IF NOT EXISTS srd_consumables (
    item_name TEXT PRIMARY KEY,
    category TEXT,

    description_text TEXT,

    source_url TEXT   
);


CREATE TABLE IF NOT EXISTS srd_item(
    item_name TEXT PRIMARY KEY,
    category TEXT,

    description_text TEXT,

    source_url TEXT
);

/*
                    ***************
                    *  Character  *
                    ***************
*/

CREATE TABLE IF NOT EXISTS characters (
    character_id BIGSERIAL PRIMARY KEY,

    name TEXT NOT NULL,

    class_item_choice TEXT,

    prayer_dice_value INTEGER,
    unstoppable_value INTEGER,

    data_json JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS characters_equipment (
    character_equipment_id BIGSERIAL PRIMARY KEY,

    character_id BIGINT REFERENCES characters(character_id),

    armor_name TEXT REFERENCES srd_armor(item_name),
    primary_weapon TEXT REFERENCES srd_weapon(item_name),
    secondary_weapon TEXT REFERENCES srd_weapon(item_name),

    weapon_notes TEXT
);

CREATE TABLE IF NOT EXISTS characters_consumable (
    characters_consumable_id BIGSERIAL PRIMARY KEY,

    character_id BIGINT REFERENCES characters(character_id),
    consumables_name TEXT REFERENCES srd_consumables(item_name),

    consumable_notes TEXT
);

CREATE TABLE IF NOT EXISTS characters_item (
    character_item_id BIGSERIAL PRIMARY KEY,

    character_id BIGINT REFERENCES characters(character_id),
    item_name TEXT REFERENCES srd_item(item_name),

    item_notes TEXT
);

CREATE TABLE IF NOT EXISTS character_inventory (
    character_inventory_id BIGSERIAL PRIMARY KEY,

    character_id BIGINT REFERENCES characters(character_id),

    item_category TEXT,
    item_name TEXT,
    quantity INTEGER,

    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS characters_companion (
    characters_companion_id BIGSERIAL PRIMARY KEY,

    character_id BIGINT REFERENCES characters(character_id),

    companion_name TEXT,
    companion_evasion INTEGER,
    companion_stress INTEGER,
    companion_range TEXT,
    companion_notes TEXT
);

CREATE TABLE IF NOT EXISTS character_info (
    character_info_id BIGSERIAL PRIMARY KEY,

    character_id BIGINT REFERENCES characters(character_id),

    pronouns TEXT,
    notes TEXT,
    description TEXT,

    heritage_notes TEXT,
    background TEXT,
    connection_notes TEXT,
    warrior_notes TEXT,
    rally_notes TEXT
);

CREATE TABLE IF NOT EXISTS character_domain_cards (
    characters_domain_card_id BIGSERIAL PRIMARY KEY,

    character_id BIGINT REFERENCES characters(character_id),

    domain_card_name name REFERENCES srd_domain_card(domain_card_name),
    character_card_level INTEGER
);

CREATE TABLE IF NOT EXISTS character_class (
    caracter_class_id BIGSERIAL PRIMARY KEY,

    character_id BIGINT REFERENCES characters(character_id),

    class_name TEXT REFERENCES srd_classes(class_name),

    subclass1_name TEXT REFERENCES srd_subclass(subclass_name),
    subclass2_name TEXT REFERENCES srd_subclass(subclass_name)
);

CREATE TABLE IF NOT EXISTS character_experiences (
    character_experiences_id BIGSERIAL PRIMARY KEY,

    character_id BIGINT REFERENCES characters(character_id),

    experience_name TEXT,
    modifier_value INTEGER
);

CREATE TABLE IF NOT EXISTS characters_stats (
    characters_stats_id BIGSERIAL PRIMARY KEY,

    character_id BIGINT REFERENCES characters(character_id),

    characters_equipment BIGINT REFERENCES characters_equipment(character_equipment_id),
    character_experiences BIGINT REFERENCES character_experiences(character_experiences_id),

    level INTEGER,

    agility INTEGER NOT NULL DEFAULT 0,
    strength INTEGER NOT NULL DEFAULT 0,
    finesse INTEGER NOT NULL DEFAULT 0,
    instinct INTEGER NOT NULL DEFAULT 0,
    presence INTEGER NOT NULL DEFAULT 0,
    knowledge INTEGER NOT NULL DEFAULT 0,

    health INTEGER,
    stress INTEGER,
    hope INTEGER,

    evasion INTEGER,
    armor_score INTEGER,

    threshold_major INTEGER,
    threshold_severe INTEGER,

    hit_points INTEGER,

    proficiency INT NOT NULL,

    gold_handfuls INTEGER NOT NULL,
    gold_bags INTEGER NOT NULL,
    gold_chests INTEGER NOT NULL,

    rally_die_value INTEGER
);

