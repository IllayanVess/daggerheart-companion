-- Generated from daggerheart.db after SRD import.

CREATE TABLE IF NOT EXISTS srd_classes (
    class_id BIGSERIAL PRIMARY KEY,

    domain1 TEXT,
    domain2 TEXT,

    class_name TEXT,
    class_description TEXT,

    class_item1 TEXT,
    class_item2 TEXT,

    evasion INTEGER,
    starting_hit_points INTEGER,

    hope_feature TEXT,
    class_feature TEXT,

    source_id TEXT REFERENCES srd_sources(id)
);

INSERT INTO srd_classes(domain1, domain2, class_name, class_description, class_item1, class_item2, evasion, starting_hit_points, hope_feature, class_feature, source_id) VALUES
('Grace', 'Codex', 'Bard', 'BLABLABLA', 'A romance novel', 'a letter never opened', 10, 5, 'Make a Scene: Spend 3 Hope to temporarily Distract a target within Close range, giving them a -2 penalty to their Difficulty.', 'Rally: Once per session, describe how you rally the party and give yourself and each of your allies a Rally Die. At level 1, your Rally Die is a d6 . A PC can spend their Rally Die to roll it, adding the result to their action roll, reaction roll, damage roll, or to clear a number of Stress equal to the result. At the end of each session, clear all unspent Rally Dice. At level 5, your Rally Die increases to a d8 .', 'source_id');

CREATE TABLE IF NOT EXISTS srd_subclass (
    subclass_id BIGSERIAL PRIMARY KEY,

    class_id BIGINT NOT NULL REFERENCES srd_classes(class_id),

    subclass_name TEXT,
    subclass_description TEXT,
    spellcast_trait_type TEXT,
    spellcast_trait TEXT,

    foundation_feature TEXT,
    specialization_feature TEXT,
    mastery_feature TEXT,

    source_id TEXT REFERENCES srd_sources(id)   
);

INSERT INTO srd_subclass(class_id, spell_cast_trait, spell_cast_feature, subclass_name, subclass_description, foundation_feature, specialization_feature, mastery_feature, source_id) VALUES
('BARD', 1, 'Presence', 'Troubadour', 'Play the Troubadour if you want to play music to bolster your allies' , 'Gifted Performer: You can play three different types of songs, once each per long rest; describe how you perform for others to gain the listed benefit: - Relaxing Song: You and all allies within Close range clear a Hit Point. - Epic Song: Make a target within Close range temporarily Vulnerable. - Heartbreaking Song: You and all allies within Close range gain a Hope.', 'Maestro: Your rallying songs steel the courage of those who listen. When you give a Rally Die to an ally, they can gain a Hope or clear a Stress.', 'Virtuoso: You are among the greatest of your craft and your skill is boundless. You can perform each of your "Gifted Performer" feature''s songs twice per long rest.');
('BARD', 1, 'Presence', 'Wordsmith', 'Play the Wordsmith if you want to use clever wordplay and captivate crowds', 'Rousing Speech: Once per long rest, you can give a heartfelt, inspiring speech. All allies within Far range clear 2 Stress. Heart of a Poet: After you make an action roll to impress, persuade, or offend someone, you can spend a Hope to add a d4 to the roll.', 'Eloquent: Your moving words boost morale. Once per session, when you encourage an ally, you can do one of the following: - Allow them to find a mundane object or tool they need. - Help an Ally without spending Hope. - Give them an additional downtime move during their next rest.', 'Epic Poetry: Your Rally Die increases to a d10. Additionally, when you Help an Ally, you can narrate the moment as if you were writing the tale of their heroism in a memoir. When you do, roll a d10 as your advantage die.')
