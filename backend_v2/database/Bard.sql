-- Bard table for Daggerheart character creator

CREATE TABLE IF NOT EXISTS Bard (
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
INSERT OR REPLACE INTO Bard (id, bard_domain1, bard_domain2, bard_evasion, bard_starting_hit_points, bard_item1, bard_item2, bard_hope_feature, bard_class_feature) VALUES
(1, 'Grace', 'Codex', 10, 5, 'A romance novel', 'a letter never opened', 'Make a Scene: Spend 3 Hope to temporarily Distract a target within Close range, giving them a -2 penalty to their Difficulty.', 'Rally: Once per session, describe how you rally the party and give yourself and each of your allies a Rally Die. At level 1, your Rally Die is a d6 . A PC can spend their Rally Die to roll it, adding the result to their action roll, reaction roll, damage roll, or to clear a number of Stress equal to the result. At the end of each session, clear all unspent Rally Dice. At level 5, your Rally Die increases to a d8 .');

CREATE TABLE IF NOT EXISTS Troubadour (
    id INTEGER PRIMARY KEY,
    troubadour_spellcast_trait INTEGER,
    troubadour_spellcast_trait_type TEXT,
    troubadour_foundation_feature TEXT,
    troubadour_specialization_feature TEXT,
    troubadour_mastery_feature TEXT
);
INSERT OR REPLACE INTO Troubadour (id, troubadour_spellcast_trait, troubadour_spellcast_trait_type, troubadour_foundation_feature, troubadour_specialization_feature, troubadour_mastery_feature) VALUES
(1, 1, 'Presence', 'Gifted Performer: You can play three different types of songs, once each per long rest; describe how you perform for others to gain the listed benefit:

- Relaxing Song: You and all allies within Close range clear a Hit Point.
- Epic Song: Make a target within Close range temporarily Vulnerable.
- Heartbreaking Song: You and all allies within Close range gain a Hope.', 'Maestro: Your rallying songs steel the courage of those who listen. When you give a Rally Die to an ally, they can gain a Hope or clear a Stress.', 'Virtuoso: You are among the greatest of your craft and your skill is boundless. You can perform each of your "Gifted Performer" feature''s songs twice per long rest.');

CREATE TABLE IF NOT EXISTS Wordsmith (
    id INTEGER PRIMARY KEY,
    wordsmith_spellcast_trait INTEGER,
    wordsmith_spellcast_trait_type TEXT,
    wordsmith_foundation_feature TEXT,
    wordsmith_specialization_feature TEXT,
    wordsmith_mastery_feature TEXT
);
INSERT OR REPLACE INTO Wordsmith (id, wordsmith_spellcast_trait, wordsmith_spellcast_trait_type, wordsmith_foundation_feature, wordsmith_specialization_feature, wordsmith_mastery_feature) VALUES
(1, 1, 'Presence', 'Rousing Speech: Once per long rest, you can give a heartfelt, inspiring speech. All allies within Far range clear 2 Stress.

Heart of a Poet: After you make an action roll to impress, persuade, or offend someone, you can spend a Hope to add a d4 to the roll.', 'Eloquent: Your moving words boost morale. Once per session, when you encourage an ally, you can do one of the following:

- Allow them to find a mundane object or tool they need.
- Help an Ally without spending Hope.
- Give them an additional downtime move during their next rest.', 'Epic Poetry: Your Rally Die increases to a d10. Additionally, when you Help an Ally, you can narrate the moment as if you were writing the tale of their heroism in a memoir. When you do, roll a d10 as your advantage die.');
