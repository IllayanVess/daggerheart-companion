-- Guardian table for Daggerheart character creator

CREATE TABLE IF NOT EXISTS Guardian (
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
INSERT OR REPLACE INTO Guardian (id, guardian_domain1, guardian_domain2, guardian_evasion, guardian_starting_hit_points, guardian_item1, guardian_item2, guardian_hope_feature, guardian_class_feature) VALUES
(1, 'Valor', 'Blade', 9, 7, 'A totem from your mentor', 'a secret key', 'Frontline Tank: Spend 3 Hope to clear 2 Armor Slots.', 'Unstoppable: Once per long rest, you can become Unstoppable. You gain an Unstoppable Die. At level 1, your Unstoppable Die is a d4. Place it on your character sheet in the space provided, starting with the 1 value facing up. After you make a damage roll that deals 1 or more Hit Points to a target, increase the Unstoppable Die value by one. When the die''s value would exceed its maximum value or when the scene ends, remove the die and drop out of Unstoppable. At level 5, your Unstoppable Die increases to a d6.

While Unstoppable, you gain the following benefits:

- You reduce the severity of physical damage by one threshold (Severe to Major, Major to Minor, Minor to None).
- You add the current value of the Unstoppable Die to your damage roll.
- You can''t be Restrained or Vulnerable.

Tip: If your Unstoppable Die is a d4 and the 4 is currently facing up, you remove the die the next time you would increase it. However, if your Unstoppable Die has increased to a d6 and the 4 is currently facing up, you''ll turn it to 5 the next time you would increase it. In this case, you''ll remove the die after you would need to increase it higher than 6.');

CREATE TABLE IF NOT EXISTS Stalwart (
    id INTEGER PRIMARY KEY,
    stalwart_trait INTEGER,
    stalwart_trait_type TEXT,
    stalwart_foundation_feature TEXT,
    stalwart_specialization_feature TEXT,
    stalwart_mastery_feature TEXT
);
INSERT OR REPLACE INTO Stalwart (id, stalwart_trait, stalwart_trait_type, stalwart_foundation_feature, stalwart_specialization_feature, stalwart_mastery_feature) VALUES
(1, 0, 'Does not have a spellcasting trait', 'Unwavering: Gain a permanent +1 bonus to your damage thresholds.

Iron Will: When you take physical damage, you can mark an additional Armor Slot to reduce the severity.', 'Unrelenting: Gain a permanent +2 bonus to your damage thresholds.

Partners-in-Arms: When an ally within Very Close range takes damage, you can mark an Armor Slot to reduce the severity by one threshold.', 'Undaunted: Gain a permanent +3 bonus to your damage thresholds.

Loyal Protector: When an ally within Close range has 2 or fewer Hit Points and would take damage, you can mark a Stress to sprint to their side and take the damage instead.');

CREATE TABLE IF NOT EXISTS Vengeance (
    id INTEGER PRIMARY KEY,
    vengeance_trait INTEGER,
    vengeance_trait_type TEXT,
    vengeance_foundation_feature TEXT,
    vengeance_specialization_feature TEXT,
    vengeance_mastery_feature TEXT
);
INSERT OR REPLACE INTO Vengeance (id, vengeance_trait, vengeance_trait_type, vengeance_foundation_feature, vengeance_specialization_feature, vengeance_mastery_feature) VALUES
(1, 0, 'Does not have a spellcasting trait', 'At Ease: Gain an additional Stress slot.

Revenge: When an adversary within Melee range succeeds on an attack against you, you can mark 2 Stress to force the attacker to mark a Hit Point.', 'Act of Reprisal: When an adversary damages an ally within Melee range, you gain a +1 bonus to your Proficiency for the next successful attack you make against that adversary.', 'Nemesis: Spend 2 Hope to Prioritize an adversary until your next rest. When you make an attack against your Prioritized adversary, you can swap the results of your Hope and Fear Dice. You can only Prioritize one adversary at a time.');
