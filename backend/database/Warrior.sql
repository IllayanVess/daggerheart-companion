-- Warrior table for Daggerheart character creator

CREATE TABLE IF NOT EXISTS Warrior (
    id INTEGER PRIMARY KEY,
    warrior_domain1 TEXT,
    warrior_domain2 TEXT,
    warrior_evasion INTEGER,
    warrior_starting_hit_points INTEGER,
    warrior_item1 TEXT,
    warrior_item2 TEXT,
    warrior_hope_feature TEXT,
    warrior_class_feature TEXT
);
INSERT OR REPLACE INTO Warrior (id, warrior_domain1, warrior_domain2, warrior_evasion, warrior_starting_hit_points, warrior_item1, warrior_item2, warrior_hope_feature, warrior_class_feature) VALUES
(1, 'Blade', 'Bone', 11, 6, 'The drawing of a lover', 'a sharpening stone', 'No Mercy: Spend 3 Hope to gain a +1 bonus to your attack rolls until your next rest.', 'Attack of Opportunity: If an adversary within Melee range attempts to leave that range, make a reaction roll using a trait of your choice against their Difficulty. Choose one effect on a success, or two if you critically succeed:

- They can''t move from where they are.
- You deal damage to them equal to your primary weapon''s damage.
- You move with them.

Combat Training: You ignore burden when equipping weapons. When you deal physical damage, you gain a bonus to your damage roll equal to your level.');

CREATE TABLE IF NOT EXISTS Call_of_the_Brave (
    id INTEGER PRIMARY KEY,
    call_brave_trait INTEGER,
    call_brave_trait_type TEXT,
    call_brave_foundation_feature TEXT,
    call_brave_specialization_feature TEXT,
    call_brave_mastery_feature TEXT
);
INSERT OR REPLACE INTO Call_of_the_Brave (id, call_brave_trait, call_brave_trait_type, call_brave_foundation_feature, call_brave_specialization_feature, call_brave_mastery_feature) VALUES
(1, 0, 'Does not have a spellcasting trait', 'Courage: When you fail a roll with Fear, you gain a Hope.

Battle Ritual: Once per long rest, before you attempt something incredibly dangerous or face off against a foe who clearly outmatches you, describe what ritual you perform or preparations you make. When you do, clear 2 Stress and gain 2 Hope.', 'Rise to the Challenge: You are vigilant in the face of mounting danger. While you have 2 or fewer Hit Points unmarked, you can roll a d20 as your Hope Die.', 'Camaraderie: Your unwavering bravery is a rallying point for your allies. You can initiate a Tag Team Roll once per additional time per session. Additionally, when an ally initiates a Tag Team Roll with you, they only need to spend 2 Hope to do so.');

CREATE TABLE IF NOT EXISTS Call_of_the_Slayer (
    id INTEGER PRIMARY KEY,
    call_slayer_trait INTEGER,
    call_slayer_trait_type TEXT,
    call_slayer_foundation_feature TEXT,
    call_slayer_specialization_feature TEXT,
    call_slayer_mastery_feature TEXT
);
INSERT OR REPLACE INTO Call_of_the_Slayer (id, call_slayer_trait, call_slayer_trait_type, call_slayer_foundation_feature, call_slayer_specialization_feature, call_slayer_mastery_feature) VALUES
(1, 0, 'Does not have a spellcasting trait', 'Slayer: You gain a pool of dice called Slayer Dice. On a roll with Hope, you can place a d6 on this card instead of gaining a Hope, adding the die to the pool. You can store a number of Slayer Dice equal to your Proficiency. When you make an attack roll or damage roll, you can spend any number of these Slayer Dice, rolling them and adding their result to the roll. At the end of each session, clear any unspent Slayer Dice on this card and gain a Hope per die cleared.', 'Weapon Specialist: You can wield multiple weapons with dangerous ease. When you succeed on an attack, you can spend a Hope to add one of the damage dice from your secondary weapon to the damage roll. Additionally, once per long rest when you roll your Slayer Dice, reroll any 1s.', 'Martial Preparation: You''re an inspirational warrior to all who travel with you. Your party gains access to the Martial Preparation downtime move. To use this move during a rest, describe how you instruct and train with your party. You and each ally who chooses this downtime move gain a d6 Slayer Die. A PC with a Slayer Die can spend it to roll the die and add the result to an attack or damage roll of their choice.');
