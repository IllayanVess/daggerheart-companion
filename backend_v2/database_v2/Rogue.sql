-- Rogue table for Daggerheart character creator

CREATE TABLE IF NOT EXISTS Rogue (
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
INSERT OR REPLACE INTO Rogue (id, rogue_domain1, rogue_domain2, rogue_evasion, rogue_starting_hit_points, rogue_item1, rogue_item2, rogue_hope_feature, rogue_class_feature) VALUES
(1, 'Midnight', 'Grace', 12, 6, 'A set of forgery tools', 'a grappling hook', 'Rogue''s Dodge: Spend 3 Hope to gain a +2 bonus to your Evasion until the next time an attack succeeds against you. Otherwise, this bonus lasts until your next rest.', 'Cloaked: Any time you would be Hidden , you are instead Cloaked . In addition to the benefits of the Hidden condition, while Cloaked you remain unseen if you are stationary when an adversary moves to where they would normally see you. After you make an attack or end a move within line of sight of an adversary, you are no longer Cloaked .

Sneak Attack: When you succeed on an attack while Cloaked or while an ally is within Melee range of your target, add a number of d6s equal to your tier to your damage roll.

- Level 1 -> Tier 1
- Levels 2-4 -> Tier 2
- Levels 5-7 -> Tier 3
- Levels 8-10 -> Tier 4');

CREATE TABLE IF NOT EXISTS Nightwalker (
    id INTEGER PRIMARY KEY,
    nightwalker_trait INTEGER,
    nightwalker_trait_type TEXT,
    nightwalker_foundation_feature TEXT,
    nightwalker_specialization_feature TEXT,
    nightwalker_mastery_feature TEXT
);
INSERT OR REPLACE INTO Nightwalker (id, nightwalker_trait, nightwalker_trait_type, nightwalker_foundation_feature, nightwalker_specialization_feature, nightwalker_mastery_feature) VALUES
(1, 1, 'Finesse', 'Shadow Stepper: You can move from shadow to shadow. When you move into an area of darkness or a shadow cast by another creature or object, you can mark a Stress to disappear from where you are and reappear inside another shadow within Far range. When you reappear, you are Cloaked.', 'Dark Cloud: Make a Spellcast Roll (15). On a success, create a temporary dark cloud that covers any area within Close range. Anyone in this cloud can''t see outside of it, and anyone outside of it can''t see in. You''re considered Cloaked from any adversary for whom the cloud blocks line of sight.

Adrenaline: While you''re Vulnerable, add your level to your damage rolls.', 'Fleeting Shadow: Gain a permanent +1 bonus to your Evasion. You can use your "Shadow Stepper" feature to move within Very Far range.

Vanishing Act: Mark a Stress to become Cloaked at any time. When Cloaked from this feature, you automatically clear the Restrained condition if you have it. You remain Cloaked in this way until you roll with Fear or until your next rest.');

CREATE TABLE IF NOT EXISTS Syndicate (
    id INTEGER PRIMARY KEY,
    syndicate_trait INTEGER,
    syndicate_trait_type TEXT,
    syndicate_foundation_feature TEXT,
    syndicate_specialization_feature TEXT,
    syndicate_mastery_feature TEXT
);
INSERT OR REPLACE INTO Syndicate (id, syndicate_trait, syndicate_trait_type, syndicate_foundation_feature, syndicate_specialization_feature, syndicate_mastery_feature) VALUES
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
