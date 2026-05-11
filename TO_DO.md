# Idea to DO

## Database

### Clean Database

-> Get a clean database scheme. 

```
TABLE -> USER (USER_ID (PK), Name, PASSWORD, EMAIL) ** FOR LOGIN

TABLE -> SESSION (SESION_ID (PK), Name, PASSWORD) ** MAYBE

TABLE -> SUB_SESSION (ID (PK), PLAYERS) ** LINK TABLE between SESSION/PLAYER ?

TABLE -> PLAYERS (NAME (PK), USER_ID (FK), ROLE, CLASSES, ITEM, Consumables...) ** BIG SUMMARY 

TABLE -> Classes(CLASS_ID (PK),class_name ,subclass1_name ,
                 subclass1_description ,subclass2_name ,
                 subclass2_description) ** ALL CLASSES

TABLE -> adversaries(id,name,tier,role,description,motives,tactics
                     difficulty,thresholds_major,thresholds_severe,
                     hit_points,stress,attack_name,attack_range,
                     attack_damage,attack_standard,attack_modifier,
                     passive_features,action_features,reaction_features,
                     fear_features,experiences_json,features,experiences,
                     notes,data_json,created_at,updated_at)

TABLE -> characters(id,name,class_name,subclass_name,ancestry,community,
                    level,evasion,armor,hit_points,stress,hope,notes
                    ,data_json,created_at,updated_at,pronouns,description
                    ,heritage_notes,proficiency,armor_name,armor_threshold_major
                    ,armor_threshold_severe,primary_weapon,secondary_weapon
                    ,weapon_notes,potion_choice,class_item_choice
                    ,inventory_notes,background,connection_notes,gold_handfuls
                    ,gold_bags,gold_chests,prayer_dice,unstoppable_value
                    ,rally_die_value,rally_notes,warrior_notes,companion_name
                    ,companion_evasion,companion_notes)

TABLE -> Consumables(id,item_name,subcategory,description_text,source_url)

TABLE -> character_domain_cards(id,character_id,slot_number
                                card_name,domain_name,card_level,card_type)

TABLE -> encounter_boards(id,state_json,created_at,updated_at)

TABLE -> DomainCards(id,card_name,domain_name,card_level,card_type,description_text)

TABLE -> character_experiences(id,character_id,slot_number,experience_name,modifier_value)

TABLE -> environments(id,name,tier,environment_type,description,impulses,
                      difficulty,potential_adversaries,features,notes,
                      data_json,created_at,updated_at)

TABLE -> Equipment(id,item_name,category,subcategory,description_text,source_url)

TABLE -> character_inventory(id,character_id,item_name,category,quantity,equipped,slot_name,
                            notes,created_at)

TABLE -> npcs(id,name,tier,role,description,motives,tactics
              ,difficulty,thresholds_major,thresholds_severe
              ,hit_points,stress,attack_name,attack_range
              ,attack_damage,attack_standard,attack_modifier
              ,passive_features,action_features,reaction_features
              ,fear_features,experiences_json,features,experiences
              ,notes,data_json,created_at,updated_at)

TABLE -> Items(id,item_name,subcategory,description_text,source_url)

TABLE -> character_traits(id,character_id,trait_name,modifier_text)

```
