-- Druid table for Daggerheart character creator

CREATE TABLE IF NOT EXISTS Druid (
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
INSERT OR REPLACE INTO Druid (id, druid_domain1, druid_domain2, druid_evasion, druid_starting_hit_points, druid_item1, druid_item2, druid_hope_feature, druid_class_feature) VALUES
(1, 'Sage', 'Arcana', 10, 6, 'A small bag of rocks and bones', 'a strange pendant found in the dirt', 'Evolution: Spend 3 Hope to transform into a Beastform without marking a Stress. When you do, choose one trait to raise by +1 until you drop out of that Beastform.', 'Beastform: Mark a Stress to magically transform into a creature of your tier or lower from the Beastform list. You can drop out of this form at any time. While transformed, you can''t use weapons or cast spells from domain cards, but you can still use other features or abilities you have access to. Spells you cast before you transform stay active and last for their normal duration, and you can talk and communicate as normal. Additionally, you gain the Beastform''s features, add their Evasion bonus to your Evasion, and use the trait specified in their statistics for your attack. While you''re in a Beastform, your armor becomes part of your body and you mark Armor Slots as usual; when you drop out of a Beastform, those marked Armor Slots remain marked. If you mark your last Hit Point, you automatically drop out of this form.

Wildtouch: You can perform harmless, subtle effects that involve nature-such as causing a flower to rapidly grow, summoning a slight gust of wind, or starting a campfire-at will.');

CREATE TABLE IF NOT EXISTS Warden_of_the_Elements (
    id INTEGER PRIMARY KEY,
    warden_elements_spellcast_trait INTEGER,
    warden_elements_spellcast_trait_type TEXT,
    warden_elements_foundation_feature TEXT,
    warden_elements_specialization_feature TEXT,
    warden_elements_mastery_feature TEXT
);
INSERT OR REPLACE INTO Warden_of_the_Elements (id, warden_elements_spellcast_trait, warden_elements_spellcast_trait_type, warden_elements_foundation_feature, warden_elements_specialization_feature, warden_elements_mastery_feature) VALUES
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

CREATE TABLE IF NOT EXISTS Warden_of_Renewal (
    id INTEGER PRIMARY KEY,
    warden_renewal_spellcast_trait INTEGER,
    warden_renewal_spellcast_trait_type TEXT,
    warden_renewal_foundation_feature TEXT,
    warden_renewal_specialization_feature TEXT,
    warden_renewal_mastery_feature TEXT
);
INSERT OR REPLACE INTO Warden_of_Renewal (id, warden_renewal_spellcast_trait, warden_renewal_spellcast_trait_type, warden_renewal_foundation_feature, warden_renewal_specialization_feature, warden_renewal_mastery_feature) VALUES
(1, 1, 'Instinct', 'Clarity of Nature: Once per long rest, you can create a space of natural serenity within Close range. When you spend a few minutes resting within the space, clear Stress equal to your Instinct, distributed as you choose between you and your allies.

Regeneration: Touch a creature and spend 3 Hope. That creature clears 1d4 Hit Points.', 'Regenerative Reach: You can target creatures within Very Close range with your "Regeneration" feature.

Warden''s Protection: Once per long rest, spend 2 Hope to clear 2 Hit Points on 1d4 allies within Close range.', 'Defender: Your animal transformation embodies a healing guardian spirit. When you''re in Beastform and an ally within Close range marks 2 or more Hit Points, you can mark a Stress to reduce the number of Hit Points they mark by 1.');
