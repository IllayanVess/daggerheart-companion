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
                    caracter_classe             FOREIGN KEY (caracter_classe), 
                    ancestry                    FOREIGN KEY (ancestry),            
                    community                   FOREIGN KEY (community),            
                    caracters_stats             FOREIGN KEY (caracters_stats),
                    caracters_equipment         FOREIGN KEY (caracters_equipment),
                    class_item_choice           FOREIGN KEY (classe_type),
                    caracters_companion         FOREIGN KEY (caracters_companion),
                    caracters_info              FOREIGN KEY (caracters_info),

                    prayer_dice_value           INTEGER,
                    unstoppable_value           INTEGER,

                    data_json                   JS           ,
                    created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
                    updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
)

TABLE -> caracters_stats(caracters_stats_id                 BIGSERIAL    PRIMARY KEY,
                         caracter_id                        FOREIGN KEY(caracter),
                         caracters_equipment                FOREIGN KEY(equipment),
                         character_experiences              FO
                         lvl                                INTEGER,
                         health                             INTEGER,
                         stress                             INTEGER,
                         hope                               INTEGER,
                         evasion                            INTEGER,
                         armor_score                        INTEGER,
                         armor_threshold_major              INTEGER,
                         armor_threshold_severe             INTEGER,
                         hit_points                         INTEGER,
                         proficiency                        INT          NOT_NULL,
                         rally_die_value                    INTEGER,
                         )

TABLE -> caracters_equipment(character_equipment_id         BIGSERIAL    PRIMARY KEY,
                             armor_name                     FOREIGN KEY(equipment),
                             primary_weapon                 FOREIGN KEY(equipment),
                             secondary_weapon               FOREIGN KEY(equipment),
                             weapon_notes                   TEXT,


TABLE -> caracters_consumable(character_equipment_id         BIGSERIAL    PRIMARY KEY,
                              class_item                     FOREIGN KEY(equipment),
                              potion_choice                  FOREIGN KEY (Consumables),
                              gold_handfuls                  INTEGER NOT_NULL,
                              gold_bags                      INTEGER NOT_NULL,
                              gold_chests                    INTEGER NOT_NULL,
                              inventory_notes                TEXT,

TABLE -> caracters_companion(caracters_companion_id      BIGSERIAL    PRIMARY KEY,
                             companion_name              TEXT,
                             companion_evasion           INTEGER,
                             companion_stress            INTEGER,
                             companion_range             TEXT,
                             companion_notes             TEXT,
                             )

TABLE -> caracter_info(caracter_info_id                 BIGSERIAL      PRIMARY KEY,
                       pronouns                         TEXT,
                       notes                            TEXT,
                       description                      TEXT,
                       heritage_notes                   TEXT,
                       background                       TEXT,
                       connection_notes                 TEXT,
                       warrior_notes                    TEXT,
                       rally_notes                      TEXT,
                       )


TABLE -> character_domain_cards(caracters_domain_card_id        BIGSERIAL       PRIMARY KEY,
                                slot_number                     INT,
                                card_name                       FOREIGN KEY(card_domain),
                                caracter_card_level             FOREIGN KEY(card_domain)
                                )

TABLE -> caracter_class(class_id                               BIGSERIAL PRIMARY KEY,
                        class_name                             FOREIGN KEY(classes),                 ,
                        subclass1_name                         FOREIGN KEY(subclass),
                        subclass2_name                         FOREIGN KEY(subclass),
                        )

TABLE -> character_experiences(id,
                               character_id,
                               slot_number,
                               experience_name,
                               modifier_value)

TABLE -> character_traits(id,
                          character_id,
                          trait_name,
                          modifier_text)

TABLE -> classes(class_id                          BIGSERIAL PRIMARY KEY   ,
                 domain1                           FOREIGN KEY(card_domain),
                 domain2                           FOREIGN KEY(card_domain),
                 class_name                        TEXT                    ,
                 class_description                 TEXT                    ,
│                class_item1                       TEXT                    ,                   
│                class_item2                       TEXT                    ,                   
│                evasion                           INTEGER                 ,
│                starting_hit_points               INTEGER                 ,
│                hope_feature                      TEXT                    ,
│                class_feature                     TEXT                    ,
                 )

TABLE -> subclass(subclass_id                            BIGSERIAL PRIMARY KEY,
                  subclass_name                          TEXT                 ,
                  subclass_description                   TEXT                 ,
                 )

TABLE -> domain_card (domain_card_id        BIGSERIAL PRIMARY KEY,
                     card_name              TEXT,
                     domain_name            TEXT,   
                     card_level             INTEGER,
                     card_type              TEXT,
                     description_text       TEXT)



************************************************************
****MAYBE DELETE
********  TABLE -> character_inventory(id,
                             character_id,
                             item_name,
                             category,
                             quantity,
                             equipped,
                             slot_name,
                             notes,
                             created_at) ******
*************************************************************





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


TABLE -> encounter_boards(id,
                          state_json,
                          created_at,
                          updated_at)



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
```
