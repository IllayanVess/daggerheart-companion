-- Ranger table for Daggerheart character creator

CREATE TABLE IF NOT EXISTS Ranger (
    id INTEGER PRIMARY KEY,
    ranger_domain1 TEXT,
    ranger_domain2 TEXT,
    ranger_evasion INTEGER,
    ranger_starting_hit_points INTEGER,
    ranger_item1 TEXT,
    ranger_item2 TEXT,
    ranger_hope_feature TEXT,
    ranger_class_feature TEXT
);
INSERT OR REPLACE INTO Ranger (id, ranger_domain1, ranger_domain2, ranger_evasion, ranger_starting_hit_points, ranger_item1, ranger_item2, ranger_hope_feature, ranger_class_feature) VALUES
(1, 'Bone', 'Sage', 12, 6, 'A trophy from your first kill', 'a seemingly broken compass', 'Hold Them Off: Spend 3 Hope when you succeed on an attack with a weapon to use that same roll against two additional adversaries within range of the attack.', 'Ranger''s Focus: Spend a Hope and make an attack against a target. On a success, deal your attack''s normal damage and temporarily make the attack''s target your Focus . Until this feature ends or you make a different creature your Focus , you gain the following benefits against your Focus :

- You know precisely what direction they are in.
- When you deal damage to them, they must mark a Stress.
- When you fail an attack against them, you can end your Ranger''s Focus feature to reroll your Duality Dice.');

CREATE TABLE IF NOT EXISTS Beastbound (
    id INTEGER PRIMARY KEY,
    beastbound_trait INTEGER,
    beastbound_trait_type TEXT,
    beastbound_foundation_feature TEXT,
    beastbound_specialization_feature TEXT,
    beastbound_mastery_feature TEXT
);
INSERT OR REPLACE INTO Beastbound (id, beastbound_trait, beastbound_trait_type, beastbound_foundation_feature, beastbound_specialization_feature, beastbound_mastery_feature) VALUES
(1, 1, 'Agility', 'Companion: You have an animal companion of your choice (at the GM''s discretion). They stay by your side unless you tell them otherwise.

Take the Ranger Companion sheet. When you level up your character, choose a level-up option for your companion from this sheet as well.', 'Expert Training: Choose an additional level-up option for your companion.

Battle-Bonded: When an adversary attacks you while they''re within your companion''s Melee range, you gain a +2 bonus to your Evasion against the attack.', 'Advanced Training: Choose two additional level-up options for your companion.

Loyal Friend: Once per long rest, when the damage from an attack would mark your companion''s last Stress or your last Hit Point and you''re within Close range of each other, you or your companion can rush to the other''s side and take that damage instead.');

CREATE TABLE IF NOT EXISTS Wayfinder (
    id INTEGER PRIMARY KEY,
    wayfinder_trait INTEGER,
    wayfinder_trait_type TEXT,
    wayfinder_foundation_feature TEXT,
    wayfinder_specialization_feature TEXT,
    wayfinder_mastery_feature TEXT
);
INSERT OR REPLACE INTO Wayfinder (id, wayfinder_trait, wayfinder_trait_type, wayfinder_foundation_feature, wayfinder_specialization_feature, wayfinder_mastery_feature) VALUES
(1, 1, 'Agility', 'Ruthless Predator: When you make a damage roll, you can mark a Stress to gain a +1 bonus to your Proficiency. Additionally, when you deal Severe damage to an adversary, they must mark a Stress.

Path Forward: When you''re traveling to a place you''ve previously visited or you carry an object that has been at the location before, you can identify the shortest, most direct path to your destination.', 'Elusive Predator: When your Focus makes an attack against you, you gain a +2 bonus to your Evasion against the attack.', 'Apex Predator: Before you make an attack roll against your Focus, you can spend a Hope. On a successful attack, you remove a Fear from the GM''s Fear pool.');
