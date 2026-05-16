-- Sorcerer table for Daggerheart character creator

CREATE TABLE IF NOT EXISTS Sorcerer (
    id INTEGER PRIMARY KEY,
    sorcerer_domain1 TEXT,
    sorcerer_domain2 TEXT,
    sorcerer_evasion INTEGER,
    sorcerer_starting_hit_points INTEGER,
    sorcerer_item1 TEXT,
    sorcerer_item2 TEXT,
    sorcerer_hope_feature TEXT,
    sorcerer_class_feature TEXT
);
INSERT OR REPLACE INTO Sorcerer (id, sorcerer_domain1, sorcerer_domain2, sorcerer_evasion, sorcerer_starting_hit_points, sorcerer_item1, sorcerer_item2, sorcerer_hope_feature, sorcerer_class_feature) VALUES
(1, 'Arcana', 'Midnight', 10, 6, 'A whispering orb', 'a family heirloom', 'Volatile Magic: Spend 3 Hope to reroll any number of your damage dice on an attack that deals magic damage.', 'Arcane Sense: You can sense the presence of magical people and objects within Close range.

Minor Illusion: Make a Spellcast Roll (10). On a success, you create a minor visual illusion no larger than yourself within Close range. This illusion is convincing to anyone at Close range or farther.

Channel Raw Power: Once per long rest, you can place a domain card from your loadout into your vault and choose to either:

- Gain Hope equal to the level of the card.
- Enhance a spell that deals damage, gaining a bonus to your damage roll equal to twice the level of the card.');

CREATE TABLE IF NOT EXISTS Elemental_Origin (
    id INTEGER PRIMARY KEY,
    elemental_origin_trait INTEGER,
    elemental_origin_trait_type TEXT,
    elemental_origin_foundation_feature TEXT,
    elemental_origin_specialization_feature TEXT,
    elemental_origin_mastery_feature TEXT
);
INSERT OR REPLACE INTO Elemental_Origin (id, elemental_origin_trait, elemental_origin_trait_type, elemental_origin_foundation_feature, elemental_origin_specialization_feature, elemental_origin_mastery_feature) VALUES
(1, 1, 'Instinct', 'Elementalist: Choose one of the following elements at character creation: air, earth, fire, lightning, water.

You can shape this element into harmless effects. Additionally, spend a Hope and describe how your control over this element helps an action roll you''re about to make, then either gain a +2 bonus to the roll or a +3 bonus to the roll''s damage.', 'Natural Evasion: You can call forth your element to protect you from harm. When an attack roll against you succeeds, you can mark a Stress and describe how you use your element to defend you. When you do, roll a d6 and add its result to your Evasion against the attack.', 'Transcendence: Once per long rest, you can transform into a physical manifestation of your element. When you do, describe your transformation and choose two of the following benefits to gain until your next rest:

- +4 bonus to your Severe threshold
- +1 bonus to a character trait of your choice
- +1 bonus to your Proficiency
- +2 bonus to your Evasion');

CREATE TABLE IF NOT EXISTS Primal_Origin (
    id INTEGER PRIMARY KEY,
    primal_origin_trait INTEGER,
    primal_origin_trait_type TEXT,
    primal_origin_foundation_feature TEXT,
    primal_origin_specialization_feature TEXT,
    primal_origin_mastery_feature TEXT
);
INSERT OR REPLACE INTO Primal_Origin (id, primal_origin_trait, primal_origin_trait_type, primal_origin_foundation_feature, primal_origin_specialization_feature, primal_origin_mastery_feature) VALUES
(1, 1, 'Instinct', 'Manipulate Magic: Your primal origin allows you to modify the essence of magic itself. After you cast a spell or make an attack using a weapon that deals magic damage, you can mark a Stress to do one of the following:

- Extend the spell or attack''s reach by one range
- Gain a +2 bonus to the action roll''s result
- Double a damage die of your choice
- Hit an additional target within range', 'Enchanted Aid: You can enhance the magic of others with your essence. When you Help an Ally with a Spellcast Roll, you can roll a d8 as your advantage die. Once per long rest, after an ally has made a Spellcast Roll with your help, you can swap the results of their Duality Dice.', 'Arcane Charge: You can gather magical energy to enhance your capabilities. When you take magic damage, you become Charged . Alternatively, you can spend 2 Hope to become Charged . When you successfully make an attack that deals magic damage while Charged , you can clear your Charge to either gain a +10 bonus to the damage roll or gain a +3 bonus to the Difficulty of a reaction roll the spell causes the target to make. You stop being Charged at your next long rest.');
