# Idea to DO

## Database

### Clean Database

-> Get a clean database scheme. 

```

                    ******************
                    *    USER AUTH   *
                    ******************


TABLE -> profiles (user_id uuid primary key,
                   username varchar(50) unique,
                   display_name text,
                   role text not null default 'player',
                   is_active boolean not null default true,
                   metadata jsonb not null default '{}',
                   created_at timestamptz not null default now(),
                   updated_at timestamptz not null default now()
                   )

TABLE -> campaigns (campaign_id uuid primary key default gen_random_uuid(),
                    owner_user_id uuid not null references profiles(user_id),
                    name text not null,
                    description text,
                    settings jsonb not null default '{}',
                    created_at timestamptz not null default now(),
                    updated_at timestamptz not null default now()
                    )

TABLE -> campaign_members (campaign_id uuid references campaigns(id) on delete cascade,
                           user_id uuid references profiles(user_id) on delete cascade,
                           role text not null default 'player',
                           primary key (campaign_id, user_id)
                           )


TABLE -> characters(character_id                BIGSERIAL    PRIMARY KEY,
                    name                        TEXT         NOT NULL,
                    character_classe            FOREIGN KEY (character_classe), 
                    ancestry                    FOREIGN KEY (ancestry),            
                    community                   FOREIGN KEY (community),            
                    characters_stats            FOREIGN KEY (characters_stats),
                    characters_equipment        FOREIGN KEY (characters_equipment),
                    class_item_choice           FOREIGN KEY (classe_type),
                    characters_companion        FOREIGN KEY (characters_companion),
                    characters_info             FOREIGN KEY (characters_info),

                    prayer_dice_value           INTEGER,
                    unstoppable_value           INTEGER,

                    data_json                   JS           ,
                    created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
                    updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
                    )

TABLE -> characters_stats(characters_stats_id                BIGSERIAL    PRIMARY KEY,
                          character_id                       FOREIGN KEY(character),
                          characters_equipment               FOREIGN KEY(equipment),
                          character_experiences              FOREIGN KEY(experiences)
                          level                              INTEGER,
                          agility integer not null default 0,
                          strength integer not null default 0,
                          finesse integer not null default 0,
                          instinct integer not null default 0,
                          presence integer not null default 0,
                          knowledge integer not null default 0,
                          health                             INTEGER,
                          stress                             INTEGER,
                          hope                               INTEGER,
                          evasion                            INTEGER,
                          armor_score                        INTEGER,
                          threshold_major                    INTEGER,
                          threshold_severe                   INTEGER,
                          hit_points                         INTEGER,
                          proficiency                        INT          NOT_NULL,
                          rally_die_value                    INTEGER,
                         )

TABLE -> characters_equipment(character_equipment_id         BIGSERIAL    PRIMARY KEY,
                              character_id                       FOREIGN KEY(character),
                              armor_name                     FOREIGN KEY(equipment),
                              primary_weapon                 FOREIGN KEY(equipment),
                              secondary_weapon               FOREIGN KEY(equipment),
                              weapon_notes                   TEXT,
                              )


TABLE -> characters_consumable(character_equipment_id         BIGSERIAL    PRIMARY KEY,
                               character_id                       FOREIGN KEY(character),
                               class_item                     FOREIGN KEY(equipment),
                               potion_choice                  FOREIGN KEY(Consumables),
                               gold_handfuls                  INTEGER NOT_NULL,
                               gold_bags                      INTEGER NOT_NULL,
                               gold_chests                    INTEGER NOT_NULL,
                               consumable_notes                TEXT,
                              )

TABLE -> character_inventory(character_inventory_id           BIGSERIAL     PRIMARY KEY,
                             character_id                     FOREIGN KEY(character),
                             item_id                          FOREIGN KEY(Items),
                             item_name                        TEXT,
                             quantity                         INTEGER,
                             notes                            TEXT,
                             created_at                       TIMESTAMPTZ
                             )

TABLE -> characters_companion(characters_companion_id      BIGSERIAL    PRIMARY KEY,
                              character_id                     FOREIGN KEY(character),
                              companion_name              TEXT,
                              companion_evasion           INTEGER,
                              companion_stress            INTEGER,
                              companion_range             TEXT,
                              companion_notes             TEXT,
                             )

TABLE -> character_info(character_info_id                BIGSERIAL      PRIMARY KEY,
                        character_id                     FOREIGN KEY(character),
                        pronouns                         TEXT,
                        notes                            TEXT,
                        description                      TEXT,
                        heritage_notes                   TEXT,
                        background                       TEXT,
                        connection_notes                 TEXT,
                        warrior_notes                    TEXT,
                        rally_notes                      TEXT,
                       )


TABLE -> character_domain_cards(characters_domain_card_id        BIGSERIAL       PRIMARY KEY,
                                character_id                     FOREIGN KEY(character),
                                card_name                       FOREIGN KEY(card_domain),
                                character_card_level             FOREIGN KEY(card_domain)
                                )

TABLE -> character_class(class_id                               BIGSERIAL PRIMARY KEY,
                         character_id                           FOREIGN KEY(character),
                         class_name                             FOREIGN KEY(classes),                 ,
                         subclass1_name                         FOREIGN KEY(subclass),
                         subclass2_name                         FOREIGN KEY(subclass),
                        )

TABLE -> character_experiences(character_experiences_id        BIGSERIAL PRIMARY KEY,
                               character_id                    FOREIGN KEY(character),
                               experience_name                 TEXT,
                               modifier_value                  INTEGER,
                               )

TABLE -> srd_sources (id text primary key,
                      title text not null,
                      license text,
                      source_path text,
                      version text
                      )

TABLE -> srd_classes(class_id                          BIGSERIAL PRIMARY KEY   ,
                     domain1                           FOREIGN KEY(srd_domains),
                     domain2                           FOREIGN KEY(srd_domains),
                     class_name                        TEXT                    ,
                     class_description                 TEXT                    ,
                     class_item1                       TEXT                    ,                   
                     class_item2                       TEXT                    ,                   
                     evasion                           INTEGER                 ,
                     starting_hit_points               INTEGER                 ,
                     hope_feature                      TEXT                    ,
                     class_feature                     TEXT                    ,
                     source_id                         FOREIGN KEY(srd_sources),
                 )

TABLE -> srd_subclass(subclass_id                            BIGSERIAL PRIMARY KEY,
                      class_id          INTEGER not null references srd_classes(id),
                      subclass_name                          TEXT                 ,
                      subclass_description                   TEXT                 ,
                      foundation_feature text,
                      specialization_feature text,
                      mastery_feature text,
                      source_id                         FOREIGN KEY(srd_sources),
                      )

TABLE -> srd_ancestry(ancestry_id BIGSERIAL PRIMARY KEY,
                      ancestry_feature_1_name text,
                      ancestry_feature_1_text text,
                      ancestry_feature_2_name text,
                      ancestry_feature_2_text text,
                      source_id                         FOREIGN KEY(srd_sources),
                      )

TABLE -> srd_community(community_id INTEGER PRIMARY KEY,
                       community_name TEXT,
                       community_feature_name text,
                       community_feature_text text,
                       source_id                         FOREIGN KEY(srd_sources),
                       )


TABLE -> srd_domain_card(domain_card_id        BIGSERIAL PRIMARY KEY,
                         domains_id             FOREIGN KEY(srd_domains),
                         card_name              TEXT,
                         domain_name            TEXT,   
                         card_level             INTEGER,
                         card_type              TEXT,
                         description_text       TEXT,
                         source_id                         FOREIGN KEY(srd_sources),
                         )

TABLE -> srd_equipment(equipment_id         BIGSERIAL PRIMARY KEY,
                       item_name            TEXT,
                       category             TEXT, --weapon, armor
                       description_text     TEXT,
                       tier integer,
                       trait text,
                       range_name text,
                       damage_die text,
                       damage_type text,
                       burden text,
                       armor_score integer,
                       feature_text text,
                       thresholds jsonb,
                       source_id text references srd_sources(id),
                       )

TABLE -> srd_consumables(consumables_id     BIGSERIAL PRIMARY KEY,
                         item_name          TEXT,
                         category        TEXT,
                         description_text   TEXT,
                         source_id text references srd_sources(id)
                         )

TABLE -> Items(item_id          BIGSERIAL PRIMARY KEY,
               item_name        TEXT,
               subcategory      TEXT,
               description_text TEXT,
               source_url       URL)


####################
## FOR THE FUTURE ##
####################


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
