-- Wizard table for Daggerheart character creator

CREATE TABLE IF NOT EXISTS Wizard (
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
INSERT OR REPLACE INTO Wizard (id, wizard_domain1, wizard_domain2, wizard_evasion, wizard_starting_hit_points, wizard_item1, wizard_item2, wizard_hope_feature, wizard_class_feature) VALUES
(1, 'Codex', 'Splendor', 11, 5, 'A book you''re trying to translate', 'a tiny, harmless elemental pet', 'Not This Time: Spend 3 Hope to force an adversary within Far range to reroll an attack or damage roll.', 'Prestidigitation: You can perform harmless, subtle magical effects at will. For example, you can change an object''s color, create a smell, light a candle, cause a tiny object to float, illuminate a room, or repair a small object.

Strange Patterns: Choose a number between 1 and 12. When you roll that number on a Duality Die, gain a Hope or clear a Stress.

You can change this number when you take a long rest.');

CREATE TABLE IF NOT EXISTS School_of_Knowledge (
    id INTEGER PRIMARY KEY,
    school_knowledge_trait INTEGER,
    school_knowledge_trait_type TEXT,
    school_knowledge_foundation_feature TEXT,
    school_knowledge_specialization_feature TEXT,
    school_knowledge_mastery_feature TEXT
);
INSERT OR REPLACE INTO School_of_Knowledge (id, school_knowledge_trait, school_knowledge_trait_type, school_knowledge_foundation_feature, school_knowledge_specialization_feature, school_knowledge_mastery_feature) VALUES
(1, 1, 'Knowledge', 'Prepared: Take an additional domain card of your level or lower from a domain you have access to.

Adept: When you Utilize an Experience, you can mark a Stress instead of spending a Hope. If you do, double your Experience modifier for that roll.', 'Accomplished: Take an additional domain card of your level or lower from a domain you have access to.

Perfect Recall: Once per rest, when you recall a domain card in your vault, you can reduce its Recall Cost by 1.', 'Brilliant: Take an additional domain card of your level or lower from a domain you have access to.

Honed Expertise: When you use an Experience, roll a d6. On a result of 5 or higher, you can use it without spending Hope.');

CREATE TABLE IF NOT EXISTS School_of_War (
    id INTEGER PRIMARY KEY,
    school_war_trait INTEGER,
    school_war_trait_type TEXT,
    school_war_foundation_feature TEXT,
    school_war_specialization_feature TEXT,
    school_war_mastery_feature TEXT
);
INSERT OR REPLACE INTO School_of_War (id, school_war_trait, school_war_trait_type, school_war_foundation_feature, school_war_specialization_feature, school_war_mastery_feature) VALUES
(1, 1, 'Knowledge', 'Battlemage: You''ve focused your studies on becoming an unconquerable force on the battlefield. Gain an additional Hit Point slot.

Face Your Fear: When you succeed with Fear on an attack roll, you deal an extra 1d10 magic damage.', 'Conjure Shield: You can maintain a protective barrier of magic. While you have at least 2 Hope, you add your Proficiency to your Evasion.

Fueled by Fear: The extra magic damage from your "Face Your Fear" feature increases to 2d10 .', 'Thrive in Chaos: When you succeed on an attack, you can mark a Stress after rolling damage to force the target to mark an additional Hit Point.

Have No Fear: The extra magic damage from your "Face Your Fear" feature increases to 3d10.');
