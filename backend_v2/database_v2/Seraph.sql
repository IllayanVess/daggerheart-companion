-- Seraph table for Daggerheart character creator

CREATE TABLE IF NOT EXISTS Seraph (
    id INTEGER PRIMARY KEY,
    seraph_domain1 TEXT,
    seraph_domain2 TEXT,
    seraph_evasion INTEGER,
    seraph_starting_hit_points INTEGER,
    seraph_item1 TEXT,
    seraph_item2 TEXT,
    seraph_hope_feature TEXT,
    seraph_class_feature TEXT
);
INSERT OR REPLACE INTO Seraph (id, seraph_domain1, seraph_domain2, seraph_evasion, seraph_starting_hit_points, seraph_item1, seraph_item2, seraph_hope_feature, seraph_class_feature) VALUES
(1, 'Splendor', 'Valor', 9, 7, 'A bundle of offerings', 'a sigil of your god', 'Life Support: Spend 3 Hope to clear a Hit Point on an ally within Close range.', 'Prayer Dice: At the beginning of each session, roll a number of d4s equal to your subclass''s Spellcast trait and place them on your character sheet in the space provided. These are your Prayer Dice. You can spend any number of Prayer Dice to aid yourself or an ally within Far range. You can use a spent die''s value to reduce incoming damage, add to a roll''s result after the roll is made, or gain Hope equal to the result. At the end of each session, clear all unspent Prayer Dice.');

CREATE TABLE IF NOT EXISTS Winged_Sentinel (
    id INTEGER PRIMARY KEY,
    winged_sentinel_trait INTEGER,
    winged_sentinel_trait_type TEXT,
    winged_sentinel_foundation_feature TEXT,
    winged_sentinel_specialization_feature TEXT,
    winged_sentinel_mastery_feature TEXT
);
INSERT OR REPLACE INTO Winged_Sentinel (id, winged_sentinel_trait, winged_sentinel_trait_type, winged_sentinel_foundation_feature, winged_sentinel_specialization_feature, winged_sentinel_mastery_feature) VALUES
(1, 1, 'Strength', 'Wings of Light: You can fly. While flying, you can do the following:

- Mark a Stress to pick up and carry another willing creature approximately your size or smaller.
- Spend a Hope to deal an extra 1d8 damage on a successful attack.', 'Ethereal Visage: Your supernatural visage strikes awe and fear. While flying, you have advantage on Presence Rolls. When you succeed with Hope on a Presence Roll, you can remove a Fear from the GM''s Fear pool instead of gaining Hope.', 'Ascendant: Gain a permanent +4 bonus to your Severe damage threshold.

Power of the Gods: While flying, you deal an extra 1d12 damage instead of 1d8 from your "Wings of Light" feature.');

CREATE TABLE IF NOT EXISTS Divine_Wielder (
    id INTEGER PRIMARY KEY,
    divine_wielder_trait INTEGER,
    divine_wielder_trait_type TEXT,
    divine_wielder_foundation_feature TEXT,
    divine_wielder_specialization_feature TEXT,
    divine_wielder_mastery_feature TEXT
);
INSERT OR REPLACE INTO Divine_Wielder (id, divine_wielder_trait, divine_wielder_trait_type, divine_wielder_foundation_feature, divine_wielder_specialization_feature, divine_wielder_mastery_feature) VALUES
(1, 1, 'Strength', 'Spirit Weapon: When you have an equipped weapon with a range of Melee or Very Close, it can fly from your hand to attack an adversary within Close range and then return to you. You can mark a Stress to target an additional adversary within range with the same attack roll.

Sparing Touch: Once per long rest, touch a creature and clear 2 Hit Points or 2 Stress from them.', 'Devout: When you roll your Prayer Dice, you can roll an additional die and discard the lowest result. Additionally, you can use your "Sparing Touch" feature twice instead of once per long rest.', 'Sacred Resonance: When you roll damage for your "Spirit Weapon" feature, if any of the die results match, double the value of each matching die. For example, if you roll two 5s, they count as two 10s.');
