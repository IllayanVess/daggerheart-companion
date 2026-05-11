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

TABLE -> characters()

TABLE -> Consumables()

TABLE -> character_domain_cards()

TABLE -> encounter_boards()

TABLE -> DomainCards()

TABLE -> character_experiences()

TABLE -> environments()

TABLE -> Equipment()

TABLE -> character_inventory()

TABLE -> npcs()

TABLE -> Items()

TABLE -> character_traits()

```
