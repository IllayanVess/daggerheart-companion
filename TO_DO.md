# Idea to DO

## Database

### Clean Database

-> Get a clean database scheme. 

```

                    ******************
                    *    USER AUTH   *
                    ******************

TABLE -> USER (user_id       BIGSERIAL    PRIMARY KEY,
               username      VARCHAR(50)  NOT NULL UNIQUE,
               email         VARCHAR(255) NOT NULL UNIQUE,
               password_hash TEXT         NOT NULL,
               is_active     BOOLEAN      NOT NULL DEFAULT true,
               is_verified   BOOLEAN      NOT NULL DEFAULT false,
               role          VARCHAR(20)  NOT NULL DEFAULT 'GM/PC',
               last_login_at TIMESTAMPTZ,
               created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
               updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
               metadata      JSONB)

TABLE -> characters(character_id                BIGSERIAL    PRIMARY KEY,
                    name                        TEXT         NOT NULL,
                    class_name                  FOREIGN KEY (classes),
                    subclass_name               FOREIGN KEY (subclass),
                    ancestry                    FOREIGN KEY (ancestry),
                    community                   FOREIGN KEY (community),
                    level                       INTEGER      NOT NULL,
                    evasion                     INTEGER      NOT_NULL,
                    armor                       INTEGER      NOT_NULL,
                    hit_points                  INTEGER      NOT_NULL,
                    stress                      INTEGER      NOT_NULL,
                    hope                        INTEGER      NOT_NULL,
                    notes                       TEXT         ,
                    data_json                   JS           ,
                    created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
                    updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
                    pronouns                    TEXT,
                    description                 TEXT,
                    heritage_notes              TEXT,
                    proficiency                 INT          NOT_NULL,
                    armor_name                  FOREIGN KEY (equipment),
                    armor_threshold_major       INTEGER      NOT_NULL,
                    armor_threshold_severe      INTEGER      NOT_NULL,
                    primary_weapon              FOREIGN KEY (equipment),
                    secondary_weapon            FOREIGN KEY (equipment),
                    weapon_notes                TEXT,
                    potion_choice               FOREIGN KEY (Consumables),
                    class_item_choice           FOREIGN KEY (CLASS_TYPE),
                    inventory_notes             TEXT,
                    background                  TEXT,
                    connection_notes            TEXT,
                    gold_handfuls               INTEGER NOT_NULL,
                    gold_bags                   INTEGER NOT_NULL,
                    gold_chests                 INTEGER NOT_NULL,
                    prayer_dice_value           INTEGER,
                    unstoppable_value           INTEGER,
                    rally_die_value             INTEGER,
                    rally_notes                 TEXT,
                    warrior_notes               TEXT,
                    companion_name              TEXT,
                    companion_evasion           INTEGER,
                    companion_stress            INTEGER,
                    companion_notes             TEXT)


TABLE -> classes(CLASS_ID (PK),
                 class_name ,
                 subclass1_name ,
                 subclass1_description ,
                 subclass2_name ,
                 subclass2_description) ** ALL CLASSES

TABLE -> adversaries(id,
                     name,
                     tier,
                     role,
                     description,
                     motives_and_tactics
                     difficulty,
                     thresholds_major,
                     thresholds_severe,
                     hit_points,
                     stress,
                     attack_name,
                     attack_range,
                     attack_damage,
                     attack_standard,
                     attack_modifier,
                     passive_features,
                     action_features,
                     reaction_features,
                     fear_features,
                     experiences_json,
                     features,experiences,
                     notes,data_json,
                     created_at,updated_at)


TABLE -> Consumables(id,
                     item_name,
                     subcategory,
                     description_text,
                     source_url)

TABLE -> character_domain_cards(id,
                                character_id,
                                slot_number
                                card_name,
                                domain_name,
                                card_level,card_type)

TABLE -> encounter_boards(id,
                          state_json,
                          created_at,
                          updated_at)

TABLE -> DomainCards(id,
                     card_name,
                     domain_name,
                     card_level,
                     card_type,
                     description_text)

TABLE -> character_experiences(id,
                               character_id,
                               slot_number,
                               experience_name,
                               modifier_value)

TABLE -> environments(id,
                      name,tier,
                      environment_type,
                      description,impulses,
                      difficulty,
                      potential_adversaries,
                      features,notes,
                      data_json,
                      created_at,
                      updated_at)

TABLE -> Equipment(id,
                   item_name,
                   category,
                   subcategory,
                   description_text,
                   source_url)

TABLE -> character_inventory(id,
                             character_id,
                             item_name,
                             category,
                             quantity,
                             equipped,
                             slot_name,
                             notes,
                             created_at)

TABLE -> npcs(id,
              name,
              tier,
              role,
              description,
              motives,
              tactics,
              difficulty,
              thresholds_major,
              thresholds_severe,
              hit_points,stress,
              attack_name,
              attack_range,
              attack_damage,
              attack_standard,
              attack_modifier,
              passive_features,
              action_features,
              reaction_features,
              fear_features,
              experiences_json,
              features,experiences,
              notes,data_json,
              created_at,
              updated_at)

TABLE -> Items(id,
               item_name,
               subcategory,
               description_text,
               source_url)

TABLE -> character_traits(id,
                          character_id,
                          trait_name,
                          modifier_text)

```
