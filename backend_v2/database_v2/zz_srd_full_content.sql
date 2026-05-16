-- Generated from daggerheart.db after SRD import.

-- This file intentionally runs after the hand-written schema files.

-- Full SRD content for Classes
DROP TABLE IF EXISTS Classes;
CREATE TABLE Classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL UNIQUE,
    subclass1_name TEXT,
    subclass1_description TEXT,
    subclass2_name TEXT,
    subclass2_description TEXT
);
INSERT INTO Classes (id, class_name, subclass1_name, subclass1_description, subclass2_name, subclass2_description) VALUES
(1, 'Bard', 'Troubadour', 'Play the Troubadour if you want to play music to bolster your allies', 'Wordsmith', 'Play the Wordsmith if you want to use clever wordplay and captivate crowds'),
(2, 'Druid', 'Warden of the Elements', 'Play the Warden of the Elements if you want to embody the natural elements of the wild', 'Warden of Renewal', 'Play the Warden of Renewal if you want to use powerful magic to heal your party'),
(3, 'Guardian', 'Stalwart', 'Play the Stalwart if you want to take heavy blows and keep fighting', 'Vengeance', 'Play the Vengeance if you want to strike down enemies who harm you or your allies'),
(4, 'Ranger', 'Beastbound', 'Play the Beastbound if you want to form a deep bond with an animal ally', 'Wayfinder', 'Play the Wayfinder if you want to hunt your prey and strike with deadly force'),
(5, 'Rogue', 'Nightwalker', 'Play the Nightwalker if you want to manipulate shadows to maneuver through the environment', 'Syndicate', 'Play the Syndicate if you want to have a web of contacts everywhere you go'),
(6, 'Seraph', 'Winged Sentinel', 'Play the Winged Sentinel if you want to take flight and strike crushing blows from the sky', 'Divine Wielder', 'Play the Divine Wielder if you want to dominate the battlefield with a legendary weapon'),
(7, 'Sorcerer', 'Elemental Origin', 'Play the Elemental Origin if you want to channel the raw power of a particular element', 'Primal Origin', 'Play the Primal Origin if you want to extend the versatility of your spells in powerful ways'),
(8, 'Warrior', 'Call of the Brave', 'Play the Call of the Brave if you want to use the might of your enemies to fuel your own power', 'Call of the Slayer', 'Play the Call of the Slayer if you want to strike down adversaries with immense force'),
(9, 'Wizard', 'School of Knowledge', 'Play the School of Knowledge if you want a keen understanding of the world around you', 'School of War', 'Play the School of War if you want to utilize trained magic for violence');

-- Full SRD content for Bard
DROP TABLE IF EXISTS Bard;
CREATE TABLE Bard (
    id INTEGER PRIMARY KEY,
    bard_domain1 TEXT,
    bard_domain2 TEXT,
    bard_evasion INTEGER,
    bard_starting_hit_points INTEGER,
    bard_item1 TEXT,
    bard_item2 TEXT,
    bard_hope_feature TEXT,
    bard_class_feature TEXT
);
INSERT INTO Bard (id, bard_domain1, bard_domain2, bard_evasion, bard_starting_hit_points, bard_item1, bard_item2, bard_hope_feature, bard_class_feature) VALUES
(1, 'Grace', 'Codex', 10, 5, 'A romance novel', 'a letter never opened', 'Make a Scene: Spend 3 Hope to temporarily Distract a target within Close range, giving them a -2 penalty to their Difficulty.', 'Rally: Once per session, describe how you rally the party and give yourself and each of your allies a Rally Die. At level 1, your Rally Die is a d6 . A PC can spend their Rally Die to roll it, adding the result to their action roll, reaction roll, damage roll, or to clear a number of Stress equal to the result. At the end of each session, clear all unspent Rally Dice. At level 5, your Rally Die increases to a d8 .');

-- Full SRD content for Troubadour
DROP TABLE IF EXISTS Troubadour;
CREATE TABLE Troubadour (
    id INTEGER PRIMARY KEY,
    troubadour_spellcast_trait INTEGER,
    troubadour_spellcast_trait_type TEXT,
    troubadour_foundation_feature TEXT,
    troubadour_specialization_feature TEXT,
    troubadour_mastery_feature TEXT
);
INSERT INTO Troubadour (id, troubadour_spellcast_trait, troubadour_spellcast_trait_type, troubadour_foundation_feature, troubadour_specialization_feature, troubadour_mastery_feature) VALUES
(1, 1, 'Presence', 'Gifted Performer: You can play three different types of songs, once each per long rest; describe how you perform for others to gain the listed benefit:

- Relaxing Song: You and all allies within Close range clear a Hit Point.
- Epic Song: Make a target within Close range temporarily Vulnerable.
- Heartbreaking Song: You and all allies within Close range gain a Hope.', 'Maestro: Your rallying songs steel the courage of those who listen. When you give a Rally Die to an ally, they can gain a Hope or clear a Stress.', 'Virtuoso: You are among the greatest of your craft and your skill is boundless. You can perform each of your "Gifted Performer" feature''s songs twice per long rest.');

-- Full SRD content for Wordsmith
DROP TABLE IF EXISTS Wordsmith;
CREATE TABLE Wordsmith (
    id INTEGER PRIMARY KEY,
    wordsmith_spellcast_trait INTEGER,
    wordsmith_spellcast_trait_type TEXT,
    wordsmith_foundation_feature TEXT,
    wordsmith_specialization_feature TEXT,
    wordsmith_mastery_feature TEXT
);
INSERT INTO Wordsmith (id, wordsmith_spellcast_trait, wordsmith_spellcast_trait_type, wordsmith_foundation_feature, wordsmith_specialization_feature, wordsmith_mastery_feature) VALUES
(1, 1, 'Presence', 'Rousing Speech: Once per long rest, you can give a heartfelt, inspiring speech. All allies within Far range clear 2 Stress.

Heart of a Poet: After you make an action roll to impress, persuade, or offend someone, you can spend a Hope to add a d4 to the roll.', 'Eloquent: Your moving words boost morale. Once per session, when you encourage an ally, you can do one of the following:

- Allow them to find a mundane object or tool they need.
- Help an Ally without spending Hope.
- Give them an additional downtime move during their next rest.', 'Epic Poetry: Your Rally Die increases to a d10. Additionally, when you Help an Ally, you can narrate the moment as if you were writing the tale of their heroism in a memoir. When you do, roll a d10 as your advantage die.');

-- Full SRD content for Druid
DROP TABLE IF EXISTS Druid;
CREATE TABLE Druid (
    id INTEGER PRIMARY KEY,
    druid_domain1 TEXT,
    druid_domain2 TEXT,
    druid_evasion INTEGER,
    druid_starting_hit_points INTEGER,
    druid_item1 TEXT,
    druid_item2 TEXT,
    druid_hope_feature TEXT,
    druid_class_feature TEXT
);
INSERT INTO Druid (id, druid_domain1, druid_domain2, druid_evasion, druid_starting_hit_points, druid_item1, druid_item2, druid_hope_feature, druid_class_feature) VALUES
(1, 'Sage', 'Arcana', 10, 6, 'A small bag of rocks and bones', 'a strange pendant found in the dirt', 'Evolution: Spend 3 Hope to transform into a Beastform without marking a Stress. When you do, choose one trait to raise by +1 until you drop out of that Beastform.', 'Beastform: Mark a Stress to magically transform into a creature of your tier or lower from the Beastform list. You can drop out of this form at any time. While transformed, you can''t use weapons or cast spells from domain cards, but you can still use other features or abilities you have access to. Spells you cast before you transform stay active and last for their normal duration, and you can talk and communicate as normal. Additionally, you gain the Beastform''s features, add their Evasion bonus to your Evasion, and use the trait specified in their statistics for your attack. While you''re in a Beastform, your armor becomes part of your body and you mark Armor Slots as usual; when you drop out of a Beastform, those marked Armor Slots remain marked. If you mark your last Hit Point, you automatically drop out of this form.

Wildtouch: You can perform harmless, subtle effects that involve nature-such as causing a flower to rapidly grow, summoning a slight gust of wind, or starting a campfire-at will.');

-- Full SRD content for Warden_of_the_Elements
DROP TABLE IF EXISTS Warden_of_the_Elements;
CREATE TABLE Warden_of_the_Elements (
    id INTEGER PRIMARY KEY,
    warden_elements_spellcast_trait INTEGER,
    warden_elements_spellcast_trait_type TEXT,
    warden_elements_foundation_feature TEXT,
    warden_elements_specialization_feature TEXT,
    warden_elements_mastery_feature TEXT
);
INSERT INTO Warden_of_the_Elements (id, warden_elements_spellcast_trait, warden_elements_spellcast_trait_type, warden_elements_foundation_feature, warden_elements_specialization_feature, warden_elements_mastery_feature) VALUES
(1, 1, 'Instinct', 'Elemental Incarnation: Mark a Stress to Channel one of the following elements until you take Severe damage or until your next rest:

- Fire: When an adversary within Melee range deals damage to you, they take 1d10 magic damage.
- Earth: Gain a bonus to your damage thresholds equal to your Proficiency.
- Water: When you deal damage to an adversary within Melee range, all other adversaries within Very Close range must mark a Stress .
- Air: You can hover, gaining advantage on Agility Rolls.', 'Elemental Aura: Once per rest while Channeling, you can assume an aura matching your element. The aura affects targets within Close range until your Channeling ends.

- Fire: When an adversary marks 1 or more Hit Points, they must also mark a Stress .
- Earth: Your allies gain a +1 bonus to Strength.
- Water: When an adversary deals damage to you, you can mark a Stress to move them anywhere within Very Close range of where they are.
- Air: When you or an ally takes damage from an attack beyond Melee range, reduce the damage by 1d8 .', 'Elemental Dominion: You further embody your element. While Channeling, you gain the following benefit:

- Fire: You gain a +1 bonus to your Proficiency for attacks and spells that deal damage.
- Earth: When you would mark Hit Points, roll a d6 per Hit Point marked. For each result of 6, reduce the number of Hit Points you mark by 1.
- Water: When an attack against you succeeds, you can mark a Stress to make the attacker temporarily Vulnerable.
- Air: You gain a +1 bonus to your Evasion and can fly.');

-- Full SRD content for Warden_of_Renewal
DROP TABLE IF EXISTS Warden_of_Renewal;
CREATE TABLE Warden_of_Renewal (
    id INTEGER PRIMARY KEY,
    warden_renewal_spellcast_trait INTEGER,
    warden_renewal_spellcast_trait_type TEXT,
    warden_renewal_foundation_feature TEXT,
    warden_renewal_specialization_feature TEXT,
    warden_renewal_mastery_feature TEXT
);
INSERT INTO Warden_of_Renewal (id, warden_renewal_spellcast_trait, warden_renewal_spellcast_trait_type, warden_renewal_foundation_feature, warden_renewal_specialization_feature, warden_renewal_mastery_feature) VALUES
(1, 1, 'Instinct', 'Clarity of Nature: Once per long rest, you can create a space of natural serenity within Close range. When you spend a few minutes resting within the space, clear Stress equal to your Instinct, distributed as you choose between you and your allies.

Regeneration: Touch a creature and spend 3 Hope. That creature clears 1d4 Hit Points.', 'Regenerative Reach: You can target creatures within Very Close range with your "Regeneration" feature.

Warden''s Protection: Once per long rest, spend 2 Hope to clear 2 Hit Points on 1d4 allies within Close range.', 'Defender: Your animal transformation embodies a healing guardian spirit. When you''re in Beastform and an ally within Close range marks 2 or more Hit Points, you can mark a Stress to reduce the number of Hit Points they mark by 1.');

-- Full SRD content for Guardian
DROP TABLE IF EXISTS Guardian;
CREATE TABLE Guardian (
    id INTEGER PRIMARY KEY,
    guardian_domain1 TEXT,
    guardian_domain2 TEXT,
    guardian_evasion INTEGER,
    guardian_starting_hit_points INTEGER,
    guardian_item1 TEXT,
    guardian_item2 TEXT,
    guardian_hope_feature TEXT,
    guardian_class_feature TEXT
);
INSERT INTO Guardian (id, guardian_domain1, guardian_domain2, guardian_evasion, guardian_starting_hit_points, guardian_item1, guardian_item2, guardian_hope_feature, guardian_class_feature) VALUES
(1, 'Valor', 'Blade', 9, 7, 'A totem from your mentor', 'a secret key', 'Frontline Tank: Spend 3 Hope to clear 2 Armor Slots.', 'Unstoppable: Once per long rest, you can become Unstoppable. You gain an Unstoppable Die. At level 1, your Unstoppable Die is a d4. Place it on your character sheet in the space provided, starting with the 1 value facing up. After you make a damage roll that deals 1 or more Hit Points to a target, increase the Unstoppable Die value by one. When the die''s value would exceed its maximum value or when the scene ends, remove the die and drop out of Unstoppable. At level 5, your Unstoppable Die increases to a d6.

While Unstoppable, you gain the following benefits:

- You reduce the severity of physical damage by one threshold (Severe to Major, Major to Minor, Minor to None).
- You add the current value of the Unstoppable Die to your damage roll.
- You can''t be Restrained or Vulnerable.

Tip: If your Unstoppable Die is a d4 and the 4 is currently facing up, you remove the die the next time you would increase it. However, if your Unstoppable Die has increased to a d6 and the 4 is currently facing up, you''ll turn it to 5 the next time you would increase it. In this case, you''ll remove the die after you would need to increase it higher than 6.');

-- Full SRD content for Stalwart
DROP TABLE IF EXISTS Stalwart;
CREATE TABLE Stalwart (
    id INTEGER PRIMARY KEY,
    stalwart_trait INTEGER,
    stalwart_trait_type TEXT,
    stalwart_foundation_feature TEXT,
    stalwart_specialization_feature TEXT,
    stalwart_mastery_feature TEXT
);
INSERT INTO Stalwart (id, stalwart_trait, stalwart_trait_type, stalwart_foundation_feature, stalwart_specialization_feature, stalwart_mastery_feature) VALUES
(1, 0, 'Does not have a spellcasting trait', 'Unwavering: Gain a permanent +1 bonus to your damage thresholds.

Iron Will: When you take physical damage, you can mark an additional Armor Slot to reduce the severity.', 'Unrelenting: Gain a permanent +2 bonus to your damage thresholds.

Partners-in-Arms: When an ally within Very Close range takes damage, you can mark an Armor Slot to reduce the severity by one threshold.', 'Undaunted: Gain a permanent +3 bonus to your damage thresholds.

Loyal Protector: When an ally within Close range has 2 or fewer Hit Points and would take damage, you can mark a Stress to sprint to their side and take the damage instead.');

-- Full SRD content for Vengeance
DROP TABLE IF EXISTS Vengeance;
CREATE TABLE Vengeance (
    id INTEGER PRIMARY KEY,
    vengeance_trait INTEGER,
    vengeance_trait_type TEXT,
    vengeance_foundation_feature TEXT,
    vengeance_specialization_feature TEXT,
    vengeance_mastery_feature TEXT
);
INSERT INTO Vengeance (id, vengeance_trait, vengeance_trait_type, vengeance_foundation_feature, vengeance_specialization_feature, vengeance_mastery_feature) VALUES
(1, 0, 'Does not have a spellcasting trait', 'At Ease: Gain an additional Stress slot.

Revenge: When an adversary within Melee range succeeds on an attack against you, you can mark 2 Stress to force the attacker to mark a Hit Point.', 'Act of Reprisal: When an adversary damages an ally within Melee range, you gain a +1 bonus to your Proficiency for the next successful attack you make against that adversary.', 'Nemesis: Spend 2 Hope to Prioritize an adversary until your next rest. When you make an attack against your Prioritized adversary, you can swap the results of your Hope and Fear Dice. You can only Prioritize one adversary at a time.');

-- Full SRD content for Ranger
DROP TABLE IF EXISTS Ranger;
CREATE TABLE Ranger (
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
INSERT INTO Ranger (id, ranger_domain1, ranger_domain2, ranger_evasion, ranger_starting_hit_points, ranger_item1, ranger_item2, ranger_hope_feature, ranger_class_feature) VALUES
(1, 'Bone', 'Sage', 12, 6, 'A trophy from your first kill', 'a seemingly broken compass', 'Hold Them Off: Spend 3 Hope when you succeed on an attack with a weapon to use that same roll against two additional adversaries within range of the attack.', 'Ranger''s Focus: Spend a Hope and make an attack against a target. On a success, deal your attack''s normal damage and temporarily make the attack''s target your Focus . Until this feature ends or you make a different creature your Focus , you gain the following benefits against your Focus :

- You know precisely what direction they are in.
- When you deal damage to them, they must mark a Stress.
- When you fail an attack against them, you can end your Ranger''s Focus feature to reroll your Duality Dice.');

-- Full SRD content for Beastbound
DROP TABLE IF EXISTS Beastbound;
CREATE TABLE Beastbound (
    id INTEGER PRIMARY KEY,
    beastbound_trait INTEGER,
    beastbound_trait_type TEXT,
    beastbound_foundation_feature TEXT,
    beastbound_specialization_feature TEXT,
    beastbound_mastery_feature TEXT
);
INSERT INTO Beastbound (id, beastbound_trait, beastbound_trait_type, beastbound_foundation_feature, beastbound_specialization_feature, beastbound_mastery_feature) VALUES
(1, 1, 'Agility', 'Companion: You have an animal companion of your choice (at the GM''s discretion). They stay by your side unless you tell them otherwise.

Take the Ranger Companion sheet. When you level up your character, choose a level-up option for your companion from this sheet as well.', 'Expert Training: Choose an additional level-up option for your companion.

Battle-Bonded: When an adversary attacks you while they''re within your companion''s Melee range, you gain a +2 bonus to your Evasion against the attack.', 'Advanced Training: Choose two additional level-up options for your companion.

Loyal Friend: Once per long rest, when the damage from an attack would mark your companion''s last Stress or your last Hit Point and you''re within Close range of each other, you or your companion can rush to the other''s side and take that damage instead.');

-- Full SRD content for Wayfinder
DROP TABLE IF EXISTS Wayfinder;
CREATE TABLE Wayfinder (
    id INTEGER PRIMARY KEY,
    wayfinder_trait INTEGER,
    wayfinder_trait_type TEXT,
    wayfinder_foundation_feature TEXT,
    wayfinder_specialization_feature TEXT,
    wayfinder_mastery_feature TEXT
);
INSERT INTO Wayfinder (id, wayfinder_trait, wayfinder_trait_type, wayfinder_foundation_feature, wayfinder_specialization_feature, wayfinder_mastery_feature) VALUES
(1, 1, 'Agility', 'Ruthless Predator: When you make a damage roll, you can mark a Stress to gain a +1 bonus to your Proficiency. Additionally, when you deal Severe damage to an adversary, they must mark a Stress.

Path Forward: When you''re traveling to a place you''ve previously visited or you carry an object that has been at the location before, you can identify the shortest, most direct path to your destination.', 'Elusive Predator: When your Focus makes an attack against you, you gain a +2 bonus to your Evasion against the attack.', 'Apex Predator: Before you make an attack roll against your Focus, you can spend a Hope. On a successful attack, you remove a Fear from the GM''s Fear pool.');

-- Full SRD content for Rogue
DROP TABLE IF EXISTS Rogue;
CREATE TABLE Rogue (
    id INTEGER PRIMARY KEY,
    rogue_domain1 TEXT,
    rogue_domain2 TEXT,
    rogue_evasion INTEGER,
    rogue_starting_hit_points INTEGER,
    rogue_item1 TEXT,
    rogue_item2 TEXT,
    rogue_hope_feature TEXT,
    rogue_class_feature TEXT
);
INSERT INTO Rogue (id, rogue_domain1, rogue_domain2, rogue_evasion, rogue_starting_hit_points, rogue_item1, rogue_item2, rogue_hope_feature, rogue_class_feature) VALUES
(1, 'Midnight', 'Grace', 12, 6, 'A set of forgery tools', 'a grappling hook', 'Rogue''s Dodge: Spend 3 Hope to gain a +2 bonus to your Evasion until the next time an attack succeeds against you. Otherwise, this bonus lasts until your next rest.', 'Cloaked: Any time you would be Hidden , you are instead Cloaked . In addition to the benefits of the Hidden condition, while Cloaked you remain unseen if you are stationary when an adversary moves to where they would normally see you. After you make an attack or end a move within line of sight of an adversary, you are no longer Cloaked .

Sneak Attack: When you succeed on an attack while Cloaked or while an ally is within Melee range of your target, add a number of d6s equal to your tier to your damage roll.

- Level 1 -> Tier 1
- Levels 2-4 -> Tier 2
- Levels 5-7 -> Tier 3
- Levels 8-10 -> Tier 4');

-- Full SRD content for Nightwalker
DROP TABLE IF EXISTS Nightwalker;
CREATE TABLE Nightwalker (
    id INTEGER PRIMARY KEY,
    nightwalker_trait INTEGER,
    nightwalker_trait_type TEXT,
    nightwalker_foundation_feature TEXT,
    nightwalker_specialization_feature TEXT,
    nightwalker_mastery_feature TEXT
);
INSERT INTO Nightwalker (id, nightwalker_trait, nightwalker_trait_type, nightwalker_foundation_feature, nightwalker_specialization_feature, nightwalker_mastery_feature) VALUES
(1, 1, 'Finesse', 'Shadow Stepper: You can move from shadow to shadow. When you move into an area of darkness or a shadow cast by another creature or object, you can mark a Stress to disappear from where you are and reappear inside another shadow within Far range. When you reappear, you are Cloaked.', 'Dark Cloud: Make a Spellcast Roll (15). On a success, create a temporary dark cloud that covers any area within Close range. Anyone in this cloud can''t see outside of it, and anyone outside of it can''t see in. You''re considered Cloaked from any adversary for whom the cloud blocks line of sight.

Adrenaline: While you''re Vulnerable, add your level to your damage rolls.', 'Fleeting Shadow: Gain a permanent +1 bonus to your Evasion. You can use your "Shadow Stepper" feature to move within Very Far range.

Vanishing Act: Mark a Stress to become Cloaked at any time. When Cloaked from this feature, you automatically clear the Restrained condition if you have it. You remain Cloaked in this way until you roll with Fear or until your next rest.');

-- Full SRD content for Syndicate
DROP TABLE IF EXISTS Syndicate;
CREATE TABLE Syndicate (
    id INTEGER PRIMARY KEY,
    syndicate_trait INTEGER,
    syndicate_trait_type TEXT,
    syndicate_foundation_feature TEXT,
    syndicate_specialization_feature TEXT,
    syndicate_mastery_feature TEXT
);
INSERT INTO Syndicate (id, syndicate_trait, syndicate_trait_type, syndicate_foundation_feature, syndicate_specialization_feature, syndicate_mastery_feature) VALUES
(1, 1, 'Finesse', 'Well-Connected: When you arrive in a prominent town or environment, you know somebody who calls this place home. Give them a name, note how you think they could be useful, and choose one fact from the following list:

- They owe me a favor, but they''ll be hard to find.
- They''re going to ask for something in exchange.
- They''re always in a great deal of trouble.
- We used to be together. It''s a long story.
- We didn''t part on great terms.', 'Contacts Everywhere: Once per session, you can briefly call on a shady contact. Choose one of the following benefits and describe what brought them here to help you in this moment:

- They provide 1 handful of gold, a unique tool, or a mundane object that the situation requires.
- On your next action roll, their help provides a +3 bonus to the result of your Hope or Fear Die.
- The next time you deal damage, they snipe from the shadows, adding 2d8 to your damage roll.', 'Reliable Backup: You can use your "Contacts Everywhere" feature three times per session. The following options are added to the list of benefits you can choose from when you use that feature:

- When you mark 1 or more Hit Points, they can rush out to shield you, reducing the Hit Points marked by 1.
- When you make a Presence Roll in conversation, they back you up. You can roll a d20 as your Hope Die.');

-- Full SRD content for Seraph
DROP TABLE IF EXISTS Seraph;
CREATE TABLE Seraph (
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
INSERT INTO Seraph (id, seraph_domain1, seraph_domain2, seraph_evasion, seraph_starting_hit_points, seraph_item1, seraph_item2, seraph_hope_feature, seraph_class_feature) VALUES
(1, 'Splendor', 'Valor', 9, 7, 'A bundle of offerings', 'a sigil of your god', 'Life Support: Spend 3 Hope to clear a Hit Point on an ally within Close range.', 'Prayer Dice: At the beginning of each session, roll a number of d4s equal to your subclass''s Spellcast trait and place them on your character sheet in the space provided. These are your Prayer Dice. You can spend any number of Prayer Dice to aid yourself or an ally within Far range. You can use a spent die''s value to reduce incoming damage, add to a roll''s result after the roll is made, or gain Hope equal to the result. At the end of each session, clear all unspent Prayer Dice.');

-- Full SRD content for Winged_Sentinel
DROP TABLE IF EXISTS Winged_Sentinel;
CREATE TABLE Winged_Sentinel (
    id INTEGER PRIMARY KEY,
    winged_sentinel_trait INTEGER,
    winged_sentinel_trait_type TEXT,
    winged_sentinel_foundation_feature TEXT,
    winged_sentinel_specialization_feature TEXT,
    winged_sentinel_mastery_feature TEXT
);
INSERT INTO Winged_Sentinel (id, winged_sentinel_trait, winged_sentinel_trait_type, winged_sentinel_foundation_feature, winged_sentinel_specialization_feature, winged_sentinel_mastery_feature) VALUES
(1, 1, 'Strength', 'Wings of Light: You can fly. While flying, you can do the following:

- Mark a Stress to pick up and carry another willing creature approximately your size or smaller.
- Spend a Hope to deal an extra 1d8 damage on a successful attack.', 'Ethereal Visage: Your supernatural visage strikes awe and fear. While flying, you have advantage on Presence Rolls. When you succeed with Hope on a Presence Roll, you can remove a Fear from the GM''s Fear pool instead of gaining Hope.', 'Ascendant: Gain a permanent +4 bonus to your Severe damage threshold.

Power of the Gods: While flying, you deal an extra 1d12 damage instead of 1d8 from your "Wings of Light" feature.');

-- Full SRD content for Divine_Wielder
DROP TABLE IF EXISTS Divine_Wielder;
CREATE TABLE Divine_Wielder (
    id INTEGER PRIMARY KEY,
    divine_wielder_trait INTEGER,
    divine_wielder_trait_type TEXT,
    divine_wielder_foundation_feature TEXT,
    divine_wielder_specialization_feature TEXT,
    divine_wielder_mastery_feature TEXT
);
INSERT INTO Divine_Wielder (id, divine_wielder_trait, divine_wielder_trait_type, divine_wielder_foundation_feature, divine_wielder_specialization_feature, divine_wielder_mastery_feature) VALUES
(1, 1, 'Strength', 'Spirit Weapon: When you have an equipped weapon with a range of Melee or Very Close, it can fly from your hand to attack an adversary within Close range and then return to you. You can mark a Stress to target an additional adversary within range with the same attack roll.

Sparing Touch: Once per long rest, touch a creature and clear 2 Hit Points or 2 Stress from them.', 'Devout: When you roll your Prayer Dice, you can roll an additional die and discard the lowest result. Additionally, you can use your "Sparing Touch" feature twice instead of once per long rest.', 'Sacred Resonance: When you roll damage for your "Spirit Weapon" feature, if any of the die results match, double the value of each matching die. For example, if you roll two 5s, they count as two 10s.');

-- Full SRD content for Sorcerer
DROP TABLE IF EXISTS Sorcerer;
CREATE TABLE Sorcerer (
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
INSERT INTO Sorcerer (id, sorcerer_domain1, sorcerer_domain2, sorcerer_evasion, sorcerer_starting_hit_points, sorcerer_item1, sorcerer_item2, sorcerer_hope_feature, sorcerer_class_feature) VALUES
(1, 'Arcana', 'Midnight', 10, 6, 'A whispering orb', 'a family heirloom', 'Volatile Magic: Spend 3 Hope to reroll any number of your damage dice on an attack that deals magic damage.', 'Arcane Sense: You can sense the presence of magical people and objects within Close range.

Minor Illusion: Make a Spellcast Roll (10). On a success, you create a minor visual illusion no larger than yourself within Close range. This illusion is convincing to anyone at Close range or farther.

Channel Raw Power: Once per long rest, you can place a domain card from your loadout into your vault and choose to either:

- Gain Hope equal to the level of the card.
- Enhance a spell that deals damage, gaining a bonus to your damage roll equal to twice the level of the card.');

-- Full SRD content for Elemental_Origin
DROP TABLE IF EXISTS Elemental_Origin;
CREATE TABLE Elemental_Origin (
    id INTEGER PRIMARY KEY,
    elemental_origin_trait INTEGER,
    elemental_origin_trait_type TEXT,
    elemental_origin_foundation_feature TEXT,
    elemental_origin_specialization_feature TEXT,
    elemental_origin_mastery_feature TEXT
);
INSERT INTO Elemental_Origin (id, elemental_origin_trait, elemental_origin_trait_type, elemental_origin_foundation_feature, elemental_origin_specialization_feature, elemental_origin_mastery_feature) VALUES
(1, 1, 'Instinct', 'Elementalist: Choose one of the following elements at character creation: air, earth, fire, lightning, water.

You can shape this element into harmless effects. Additionally, spend a Hope and describe how your control over this element helps an action roll you''re about to make, then either gain a +2 bonus to the roll or a +3 bonus to the roll''s damage.', 'Natural Evasion: You can call forth your element to protect you from harm. When an attack roll against you succeeds, you can mark a Stress and describe how you use your element to defend you. When you do, roll a d6 and add its result to your Evasion against the attack.', 'Transcendence: Once per long rest, you can transform into a physical manifestation of your element. When you do, describe your transformation and choose two of the following benefits to gain until your next rest:

- +4 bonus to your Severe threshold
- +1 bonus to a character trait of your choice
- +1 bonus to your Proficiency
- +2 bonus to your Evasion');

-- Full SRD content for Primal_Origin
DROP TABLE IF EXISTS Primal_Origin;
CREATE TABLE Primal_Origin (
    id INTEGER PRIMARY KEY,
    primal_origin_trait INTEGER,
    primal_origin_trait_type TEXT,
    primal_origin_foundation_feature TEXT,
    primal_origin_specialization_feature TEXT,
    primal_origin_mastery_feature TEXT
);
INSERT INTO Primal_Origin (id, primal_origin_trait, primal_origin_trait_type, primal_origin_foundation_feature, primal_origin_specialization_feature, primal_origin_mastery_feature) VALUES
(1, 1, 'Instinct', 'Manipulate Magic: Your primal origin allows you to modify the essence of magic itself. After you cast a spell or make an attack using a weapon that deals magic damage, you can mark a Stress to do one of the following:

- Extend the spell or attack''s reach by one range
- Gain a +2 bonus to the action roll''s result
- Double a damage die of your choice
- Hit an additional target within range', 'Enchanted Aid: You can enhance the magic of others with your essence. When you Help an Ally with a Spellcast Roll, you can roll a d8 as your advantage die. Once per long rest, after an ally has made a Spellcast Roll with your help, you can swap the results of their Duality Dice.', 'Arcane Charge: You can gather magical energy to enhance your capabilities. When you take magic damage, you become Charged . Alternatively, you can spend 2 Hope to become Charged . When you successfully make an attack that deals magic damage while Charged , you can clear your Charge to either gain a +10 bonus to the damage roll or gain a +3 bonus to the Difficulty of a reaction roll the spell causes the target to make. You stop being Charged at your next long rest.');

-- Full SRD content for Warrior
DROP TABLE IF EXISTS Warrior;
CREATE TABLE Warrior (
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
INSERT INTO Warrior (id, warrior_domain1, warrior_domain2, warrior_evasion, warrior_starting_hit_points, warrior_item1, warrior_item2, warrior_hope_feature, warrior_class_feature) VALUES
(1, 'Blade', 'Bone', 11, 6, 'The drawing of a lover', 'a sharpening stone', 'No Mercy: Spend 3 Hope to gain a +1 bonus to your attack rolls until your next rest.', 'Attack of Opportunity: If an adversary within Melee range attempts to leave that range, make a reaction roll using a trait of your choice against their Difficulty. Choose one effect on a success, or two if you critically succeed:

- They can''t move from where they are.
- You deal damage to them equal to your primary weapon''s damage.
- You move with them.

Combat Training: You ignore burden when equipping weapons. When you deal physical damage, you gain a bonus to your damage roll equal to your level.');

-- Full SRD content for Call_of_the_Brave
DROP TABLE IF EXISTS Call_of_the_Brave;
CREATE TABLE Call_of_the_Brave (
    id INTEGER PRIMARY KEY,
    call_brave_trait INTEGER,
    call_brave_trait_type TEXT,
    call_brave_foundation_feature TEXT,
    call_brave_specialization_feature TEXT,
    call_brave_mastery_feature TEXT
);
INSERT INTO Call_of_the_Brave (id, call_brave_trait, call_brave_trait_type, call_brave_foundation_feature, call_brave_specialization_feature, call_brave_mastery_feature) VALUES
(1, 0, 'Does not have a spellcasting trait', 'Courage: When you fail a roll with Fear, you gain a Hope.

Battle Ritual: Once per long rest, before you attempt something incredibly dangerous or face off against a foe who clearly outmatches you, describe what ritual you perform or preparations you make. When you do, clear 2 Stress and gain 2 Hope.', 'Rise to the Challenge: You are vigilant in the face of mounting danger. While you have 2 or fewer Hit Points unmarked, you can roll a d20 as your Hope Die.', 'Camaraderie: Your unwavering bravery is a rallying point for your allies. You can initiate a Tag Team Roll once per additional time per session. Additionally, when an ally initiates a Tag Team Roll with you, they only need to spend 2 Hope to do so.');

-- Full SRD content for Call_of_the_Slayer
DROP TABLE IF EXISTS Call_of_the_Slayer;
CREATE TABLE Call_of_the_Slayer (
    id INTEGER PRIMARY KEY,
    call_slayer_trait INTEGER,
    call_slayer_trait_type TEXT,
    call_slayer_foundation_feature TEXT,
    call_slayer_specialization_feature TEXT,
    call_slayer_mastery_feature TEXT
);
INSERT INTO Call_of_the_Slayer (id, call_slayer_trait, call_slayer_trait_type, call_slayer_foundation_feature, call_slayer_specialization_feature, call_slayer_mastery_feature) VALUES
(1, 0, 'Does not have a spellcasting trait', 'Slayer: You gain a pool of dice called Slayer Dice. On a roll with Hope, you can place a d6 on this card instead of gaining a Hope, adding the die to the pool. You can store a number of Slayer Dice equal to your Proficiency. When you make an attack roll or damage roll, you can spend any number of these Slayer Dice, rolling them and adding their result to the roll. At the end of each session, clear any unspent Slayer Dice on this card and gain a Hope per die cleared.', 'Weapon Specialist: You can wield multiple weapons with dangerous ease. When you succeed on an attack, you can spend a Hope to add one of the damage dice from your secondary weapon to the damage roll. Additionally, once per long rest when you roll your Slayer Dice, reroll any 1s.', 'Martial Preparation: You''re an inspirational warrior to all who travel with you. Your party gains access to the Martial Preparation downtime move. To use this move during a rest, describe how you instruct and train with your party. You and each ally who chooses this downtime move gain a d6 Slayer Die. A PC with a Slayer Die can spend it to roll the die and add the result to an attack or damage roll of their choice.');

-- Full SRD content for Wizard
DROP TABLE IF EXISTS Wizard;
CREATE TABLE Wizard (
    id INTEGER PRIMARY KEY,
    wizard_domain1 TEXT,
    wizard_domain2 TEXT,
    wizard_evasion INTEGER,
    wizard_starting_hit_points INTEGER,
    wizard_item1 TEXT,
    wizard_item2 TEXT,
    wizard_hope_feature TEXT,
    wizard_class_feature TEXT
);
INSERT INTO Wizard (id, wizard_domain1, wizard_domain2, wizard_evasion, wizard_starting_hit_points, wizard_item1, wizard_item2, wizard_hope_feature, wizard_class_feature) VALUES
(1, 'Codex', 'Splendor', 11, 5, 'A book you''re trying to translate', 'a tiny, harmless elemental pet', 'Not This Time: Spend 3 Hope to force an adversary within Far range to reroll an attack or damage roll.', 'Prestidigitation: You can perform harmless, subtle magical effects at will. For example, you can change an object''s color, create a smell, light a candle, cause a tiny object to float, illuminate a room, or repair a small object.

Strange Patterns: Choose a number between 1 and 12. When you roll that number on a Duality Die, gain a Hope or clear a Stress.

You can change this number when you take a long rest.');

-- Full SRD content for School_of_Knowledge
DROP TABLE IF EXISTS School_of_Knowledge;
CREATE TABLE School_of_Knowledge (
    id INTEGER PRIMARY KEY,
    school_knowledge_trait INTEGER,
    school_knowledge_trait_type TEXT,
    school_knowledge_foundation_feature TEXT,
    school_knowledge_specialization_feature TEXT,
    school_knowledge_mastery_feature TEXT
);
INSERT INTO School_of_Knowledge (id, school_knowledge_trait, school_knowledge_trait_type, school_knowledge_foundation_feature, school_knowledge_specialization_feature, school_knowledge_mastery_feature) VALUES
(1, 1, 'Knowledge', 'Prepared: Take an additional domain card of your level or lower from a domain you have access to.

Adept: When you Utilize an Experience, you can mark a Stress instead of spending a Hope. If you do, double your Experience modifier for that roll.', 'Accomplished: Take an additional domain card of your level or lower from a domain you have access to.

Perfect Recall: Once per rest, when you recall a domain card in your vault, you can reduce its Recall Cost by 1.', 'Brilliant: Take an additional domain card of your level or lower from a domain you have access to.

Honed Expertise: When you use an Experience, roll a d6. On a result of 5 or higher, you can use it without spending Hope.');

-- Full SRD content for School_of_War
DROP TABLE IF EXISTS School_of_War;
CREATE TABLE School_of_War (
    id INTEGER PRIMARY KEY,
    school_war_trait INTEGER,
    school_war_trait_type TEXT,
    school_war_foundation_feature TEXT,
    school_war_specialization_feature TEXT,
    school_war_mastery_feature TEXT
);
INSERT INTO School_of_War (id, school_war_trait, school_war_trait_type, school_war_foundation_feature, school_war_specialization_feature, school_war_mastery_feature) VALUES
(1, 1, 'Knowledge', 'Battlemage: You''ve focused your studies on becoming an unconquerable force on the battlefield. Gain an additional Hit Point slot.

Face Your Fear: When you succeed with Fear on an attack roll, you deal an extra 1d10 magic damage.', 'Conjure Shield: You can maintain a protective barrier of magic. While you have at least 2 Hope, you add your Proficiency to your Evasion.

Fueled by Fear: The extra magic damage from your "Face Your Fear" feature increases to 2d10 .', 'Thrive in Chaos: When you succeed on an attack, you can mark a Stress after rolling damage to force the target to mark an additional Hit Point.

Have No Fear: The extra magic damage from your "Face Your Fear" feature increases to 3d10.');
