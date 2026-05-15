# Idea to DO

## Database

### Clean Database

-> Get a clean database scheme. 


#### 1 - Create User and Session 

```sql

                    ******************
                    *    USER AUTH   *
                    ******************


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


CREATE TABLE IF NOT EXISTS campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES profiles(user_id),
    name TEXT NOT NULL,
    description TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_members (
    campaign_id UUID REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'player',
    PRIMARY KEY (campaign_id, user_id)
);

```
#### 2 - Create souce data 

```sql
CREATE TABLE IF NOT EXISTS srd_sources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    license TEXT,
    source_path TEXT,
    version TEXT
);

CREATE TABLE IF NOT EXISTS srd_domains (
    srd_domains_id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    source_id TEXT REFERENCES srd_sources(id)
);

CREATE TABLE IF NOT EXISTS srd_classes (
    class_id BIGSERIAL PRIMARY KEY,

    domain1 BIGINT REFERENCES srd_domains(id),
    domain2 BIGINT REFERENCES srd_domains(id),

    class_name TEXT,
    class_description TEXT,

    class_item1 TEXT,
    class_item2 TEXT,

    evasion INTEGER,
    starting_hit_points INTEGER,

    hope_feature TEXT,
    class_feature TEXT,

    source_id TEXT REFERENCES srd_sources(id)
);

CREATE TABLE IF NOT EXISTS srd_subclass (
    subclass_id BIGSERIAL PRIMARY KEY,

    class_id BIGINT NOT NULL REFERENCES srd_classes(class_id),

    subclass_name TEXT,
    subclass_description TEXT,

    foundation_feature TEXT,
    specialization_feature TEXT,
    spell_cast_feature TEXT,
    mastery_feature TEXT,

    source_id TEXT REFERENCES srd_sources(id)
);

CREATE TABLE IF NOT EXISTS srd_ancestry (
    ancestry_id BIGSERIAL PRIMARY KEY,

    ancestry_feature_1_name TEXT,
    ancestry_feature_1_text TEXT,

    ancestry_feature_2_name TEXT,
    ancestry_feature_2_text TEXT,

    source_id TEXT REFERENCES srd_sources(id)
);

CREATE TABLE IF NOT EXISTS srd_community (
    community_id INTEGER PRIMARY KEY,

    community_name TEXT,
    community_feature_name TEXT,
    community_feature_text TEXT,

    source_id TEXT REFERENCES srd_sources(id)
);                       )

CREATE TABLE IF NOT EXISTS srd_domain_card (
    domain_card_id BIGSERIAL PRIMARY KEY,

    domains_id BIGINT REFERENCES srd_domains(id),

    card_name TEXT,
    domain_name TEXT,
    card_level INTEGER,
    card_type TEXT,
    description_text TEXT,

    source_id TEXT REFERENCES srd_sources(id)
);

CREATE TABLE IF NOT EXISTS srd_equipment (
    equipment_id BIGSERIAL PRIMARY KEY,

    item_name TEXT,
    category TEXT, -- weapon, armor

    description_text TEXT,
    tier INTEGER,
    trait TEXT,

    range_name TEXT,
    damage_die TEXT,
    damage_type TEXT,

    burden TEXT,

    armor_score INTEGER,
    feature_text TEXT,

    thresholds JSONB,

    source_id TEXT REFERENCES srd_sources(id)
);

CREATE TABLE IF NOT EXISTS srd_consumables (
    consumables_id BIGSERIAL PRIMARY KEY,

    item_name TEXT,
    category TEXT,

    description_text TEXT,

    source_id TEXT REFERENCES srd_sources(id)
);

```

### 3 - Character 

```sql

CREATE TABLE IF NOT EXISTS characters (
    character_id BIGSERIAL PRIMARY KEY,

    name TEXT NOT NULL,

    character_classe BIGINT REFERENCES srd_classes(class_id),
    ancestry BIGINT REFERENCES srd_ancestry(ancestry_id),
    community INTEGER REFERENCES srd_community(community_id),

    characters_stats BIGINT REFERENCES characters_stats(id),
    characters_equipment BIGINT REFERENCES characters_equipment(id),
    class_item_choice TEXT,
    characters_companion BIGINT REFERENCES characters_companion(id),
    characters_info BIGINT REFERENCES characters_info(id),

    prayer_dice_value INTEGER,
    unstoppable_value INTEGER,

    data_json JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS characters_stats (
    characters_stats_id BIGSERIAL PRIMARY KEY,

    character_id BIGINT REFERENCES characters(character_id),

    characters_equipment BIGINT REFERENCES characters_equipment(id),
    character_experiences BIGINT REFERENCES experiences(id),

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

    rally_die_value INTEGER
);

CREATE TABLE IF NOT EXISTS characters_equipment (
    character_equipment_id BIGSERIAL PRIMARY KEY,

    character_id BIGINT REFERENCES characters(character_id),

    armor_name BIGINT REFERENCES srd_equipment(equipment_id),
    primary_weapon BIGINT REFERENCES srd_equipment(equipment_id),
    secondary_weapon BIGINT REFERENCES srd_equipment(equipment_id),

    weapon_notes TEXT
);

CREATE TABLE IF NOT EXISTS characters_consumable (
    character_equipment_id BIGSERIAL PRIMARY KEY,

    character_id BIGINT REFERENCES characters(character_id),

    class_item BIGINT REFERENCES srd_equipment(equipment_id),
    potion_choice BIGINT REFERENCES srd_consumables(consumables_id),

    gold_handfuls INTEGER NOT NULL,
    gold_bags INTEGER NOT NULL,
    gold_chests INTEGER NOT NULL,

    consumable_notes TEXT
);

CREATE TABLE IF NOT EXISTS character_inventory (
    character_inventory_id BIGSERIAL PRIMARY KEY,

    character_id BIGINT REFERENCES characters(character_id),
    item_id BIGINT REFERENCES srd_equipment(equipment_id),
    item_id BIGINT REFERENCES srd_consumables(consumables_id),

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

    card_name TEXT REFERENCES srd_domain_card(card_name),
    character_card_level INTEGER
);

CREATE TABLE IF NOT EXISTS character_class (
    class_id BIGSERIAL PRIMARY KEY,

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

```
___
# FOR THE FUTURE 

### 4 - Adversary/Npc

```sql

srd_adversaries (
  id text primary key,
  name text not null,
  tier integer,
  role text,
  description text,
  motives_and_tactics text,
  difficulty integer,
  threshold_major integer,
  threshold_severe integer,
  hit_points integer,
  stress integer,
  attack jsonb,
  features jsonb not null default '[]',
  experiences jsonb not null default '[]',
  source_id text references srd_sources(id)
)

adversary_instances (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  template_id text references srd_adversaries(id),
  name text not null,
  current_hit_points integer,
  current_stress integer,
  override_json jsonb not null default '{}',
  notes text
)

npcs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  name text not null,
  tier integer,
  role text,
  description text,
  motives text,
  tactics text,
  stats_json jsonb not null default '{}',
  notes text
)

encounter_boards (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  session_id uuid,
  name text not null default 'Encounter',
  width integer not null default 30,
  height integer not null default 30,
  state_json jsonb not null default '{}',
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

encounter_tokens (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references encounter_boards(id) on delete cascade,
  token_type text not null, -- character, adversary, npc, environment, custom
  ref_id uuid,
  label text not null,
  x numeric not null,
  y numeric not null,
  size numeric not null default 1,
  metadata jsonb not null default '{}'
)

```
