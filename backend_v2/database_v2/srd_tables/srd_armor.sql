-- Generated from daggerheart.db after equipment import.

DROP TABLE IF EXISTS srd_armor;

CREATE TABLE IF NOT EXISTS srd_armor (
    armor_id BIGSERIAL PRIMARY KEY,

    item_name TEXT,
    category TEXT, -- weapon, armor

    tier INTEGER,

    thresholds_major TEXT,
    thresholds_severe TEXT,
    base_score INTEGER,

    feature_text TEXT,
    description_text TEXT,

    source_id TEXT REFERENCES srd_sources(id)
);

INSERT INTO srd_equipement (item_name, category, tier, thresholds_major, thresholds_severe, base_score, feature_text, description_text, source_url) VALUES

('CHAINMAIL ARMOR', 'Armor',1, 7, 15, 4, 'Heavy: -1 to Evasion', 'CHAINMAIL ARMOR Armor - Tier 1 Thresholds 7 / 15 Base Score 4 Heavy: -1 to Evasion', 'https://daggerheartsrd.com/armor/chainmail-armor/'),
('FULL PLATE ARMOR', 'Armor',1, 8, 17, 4, 'Very Heavy: -2 to Evasion; -1 to Agility', 'FULL PLATE ARMOR Armor - Tier 1 Thresholds 8 / 17 Base Score 4 Very Heavy: -2 to Evasion; -1 to Agility', 'https://daggerheartsrd.com/armor/full-plate-armor/'),
('GAMBESON ARMOR', 'Armor',1, 5, 11, 3, 'Flexible: +1 to Evasion', 'GAMBESON ARMOR Armor - Tier 1 Thresholds 5 / 11 Base Score 3 Flexible: +1 to Evasion', 'https://daggerheartsrd.com/armor/gambeson-armor/'),
('LEATHER ARMOR', 'Armor',1, 6, 13, 3, NULL, 'LEATHER ARMOR Armor - Tier 1 Thresholds 6 / 13 Base Score 3', 'https://daggerheartsrd.com/armor/leather-armor/'),
('ELUNDRIAN CHAIN ARMOR', 'Armor',2, 9, 21, 4, 'Warded: You reduce incoming magic damage by your Armor Score before applying it to your damage thresholds.', 'ELUNDRIAN CHAIN ARMOR Armor - Tier 2 Thresholds 9 / 21 Base Score 4 Warded: You reduce incoming magic damage by your Armor Score before applying it to your damage thresholds.', 'https://daggerheartsrd.com/armor/elundrian-chain-armor/'),
('HARROWBONE ARMOR', 'Armor',2, 9, 21, 4, 'Resilient: Before you mark your last Armor Slot, roll a d6. On a result of 6, reduce the severity by one threshold without marking an Armor Slot.', 'HARROWBONE ARMOR Armor - Tier 2 Thresholds 9 / 21 Base Score 4 Resilient: Before you mark your last Armor Slot, roll a d6. On a result of 6, reduce the severity by one threshold without marking an Armor Slot.', 'https://daggerheartsrd.com/armor/harrowbone-armor/'),
('IMPROVED CHAINMAIL ARMOR', 'Armor',2, 11, 24, 5, 'Heavy: -1 to Evasion', 'IMPROVED CHAINMAIL ARMOR Armor - Tier 2 Thresholds 11 / 24 Base Score 5 Heavy: -1 to Evasion', 'https://daggerheartsrd.com/armor/improved-chainmail-armor/'),
('IMPROVED FULL PLATE ARMOR', 'Armor',2, 13, 28, 5, 'Very Heavy: -2 to Evasion; -1 to Agility', 'IMPROVED FULL PLATE ARMOR Armor - Tier 2 Thresholds 13 / 28 Base Score 5 Very Heavy: -2 to Evasion; -1 to Agility', 'https://daggerheartsrd.com/armor/improved-full-plate-armor/'),
('IMPROVED GAMBESON ARMOR', 'Armor',2, 7, 16, 4, 'Flexible: +1 to Evasion', 'IMPROVED GAMBESON ARMOR Armor - Tier 2 Thresholds 7 / 16 Base Score 4 Flexible: +1 to Evasion', 'https://daggerheartsrd.com/armor/improved-gambeson-armor/'),
('IMPROVED LEATHER ARMOR', 'Armor',2, 9, 20, 4, NULL, 'IMPROVED LEATHER ARMOR Armor - Tier 2 Thresholds 9 / 20 Base Score 4', 'https://daggerheartsrd.com/armor/improved-leather-armor/'),
('IRONTREE BREASTPLATE ARMOR', 'Armor',2, 9, 20, 4, 'Reinforced: When you mark your last Armor Slot, increase your damage thresholds by +2 until you clear at least 1 Armor Slot.', 'IRONTREE BREASTPLATE ARMOR Armor - Tier 2 Thresholds 9 / 20 Base Score 4 Reinforced: When you mark your last Armor Slot, increase your damage thresholds by +2 until you clear at least 1 Armor Slot.', 'https://daggerheartsrd.com/armor/irontree-breastplate-armor/'),
('ROSEWILD ARMOR', 'Armor',2, 11, 23, 5, 'Hopeful: When you would spend a Hope, you can mark an Armor Slot instead.', 'ROSEWILD ARMOR Armor - Tier 2 Thresholds 11 / 23 Base Score 5 Hopeful: When you would spend a Hope, you can mark an Armor Slot instead.', 'https://daggerheartsrd.com/armor/rosewild-armor/'),
('RUNETAN FLOATING ARMOR', 'Armor',2, 9, 20, 4, 'Shifting: When you are targeted for an attack, you can mark an Armor Slot to give the attack roll against you disadvantage.', 'RUNETAN FLOATING ARMOR Armor - Tier 2 Thresholds 9 / 20 Base Score 4 Shifting: When you are targeted for an attack, you can mark an Armor Slot to give the attack roll against you disadvantage.', 'https://daggerheartsrd.com/armor/runetan-floating-armor/'),
('TYRIS SOFT ARMOR', 'Armor',2, 8, 18, 5, 'Quiet: You gain a +2 bonus to rolls you make to move silently.', 'TYRIS SOFT ARMOR Armor - Tier 2 Thresholds 8 / 18 Base Score 5 Quiet: You gain a +2 bonus to rolls you make to move silently.', 'https://daggerheartsrd.com/armor/tyris-soft-armor/'),
('ADVANCED CHAINMAIL ARMOR', 'Armor',3, 13, 31, 6, 'Heavy: -1 to Evasion', 'ADVANCED CHAINMAIL ARMOR Armor - Tier 3 Thresholds 13 / 31 Base Score 6 Heavy: -1 to Evasion', 'https://daggerheartsrd.com/armor/advanced-chainmail-armor/'),
('ADVANCED FULL PLATE ARMOR', 'Armor',3, 15, 35, 6, 'Very Heavy: -2 to Evasion; -1 to Agility', 'ADVANCED FULL PLATE ARMOR Armor - Tier 3 Thresholds 15 / 35 Base Score 6 Very Heavy: -2 to Evasion; -1 to Agility', 'https://daggerheartsrd.com/armor/advanced-full-plate-armor/'),
('ADVANCED GAMBESON ARMOR', 'Armor',3, 9, 23, 5, 'Flexible: +1 to Evasion', 'ADVANCED GAMBESON ARMOR Armor - Tier 3 Thresholds 9 / 23 Base Score 5 Flexible: +1 to Evasion', 'https://daggerheartsrd.com/armor/advanced-gambeson-armor/'),
('ADVANCED LEATHER ARMOR', 'Armor',3, 11, 27, 5, NULL, 'ADVANCED LEATHER ARMOR Armor - Tier 3 Thresholds 11 / 27 Base Score 5', 'https://daggerheartsrd.com/armor/advanced-leather-armor/'),
('BLADEFARE ARMOR', 'Armor',3, 16, 39, 6, 'Physical: You can''t mark an Armor Slot to reduce magic damage.', 'BLADEFARE ARMOR Armor - Tier 3 Thresholds 16 / 39 Base Score 6 Physical: You can''t mark an Armor Slot to reduce magic damage.', 'https://daggerheartsrd.com/armor/bladefare-armor/'),
('Bellamoi FINE ARMOR', 'Armor',3, 11, 27, 5, 'Gilded: +1 to Presence', 'Bellamoi FINE ARMOR Armor - Tier 3 Thresholds 11 / 27 Base Score 5 Gilded: +1 to Presence', 'https://daggerheartsrd.com/armor/bellamoi-fine-armor/'),
('DRAGONSCALE ARMOR', 'Armor',3, 11, 27, 5, 'Impenetrable: Once per short rest, when you would mark your last Hit Point, you can instead mark a Stress.', 'DRAGONSCALE ARMOR Armor - Tier 3 Thresholds 11 / 27 Base Score 5 Impenetrable: Once per short rest, when you would mark your last Hit Point, you can instead mark a Stress.', 'https://daggerheartsrd.com/armor/dragonscale-armor/'),
('MONETT''S CLOAK', 'Armor',3, 16, 39, 6, 'Magic: You can''t mark an Armor Slot to reduce physical damage.', 'MONETT''S CLOAK Armor - Tier 3 Thresholds 16 / 39 Base Score 6 Magic: You can''t mark an Armor Slot to reduce physical damage.', 'https://daggerheartsrd.com/armor/monetts-cloak/'),
('RUNES OF FORTIFICATION', 'Armor',3, 17, 43, 6, 'Painful: Each time you mark an Armor Slot, you must mark a Stress.', 'RUNES OF FORTIFICATION Armor - Tier 3 Thresholds 17 / 43 Base Score 6 Painful: Each time you mark an Armor Slot, you must mark a Stress.', 'https://daggerheartsrd.com/armor/runes-of-fortification/'),
('SPIKED PLATE ARMOR', 'Armor',3, 10, 25, 5, 'Sharp: On a successful attack against a target within Melee range, add a d4 to the damage roll.', 'SPIKED PLATE ARMOR Armor - Tier 3 Thresholds 10 / 25 Base Score 5 Sharp: On a successful attack against a target within Melee range, add a d4 to the damage roll.', 'https://daggerheartsrd.com/armor/spiked-plate-armor/'),
('CHANNELING ARMOR', 'Armor',4, 13, 36, 5, 'Channeling: +1 to Spellcast Rolls', 'CHANNELING ARMOR Armor - Tier 4 Thresholds 13 / 36 Base Score 5 Channeling: +1 to Spellcast Rolls', 'https://daggerheartsrd.com/armor/channeling-armor/'),
('DUNAMIS SILKCHAIN', 'Armor',4, 13, 36, 7, 'Timeslowing: Mark an Armor Slot to roll a d4 and add its result as a bonus to your Evasion against an incoming attack.', 'DUNAMIS SILKCHAIN Armor - Tier 4 Thresholds 13 / 36 Base Score 7 Timeslowing: Mark an Armor Slot to roll a d4 and add its result as a bonus to your Evasion against an incoming attack.', 'https://daggerheartsrd.com/armor/dunamis-silkchain/'),
('EMBERWOVEN ARMOR', 'Armor',4, 13, 36, 6, 'Burning: When an adversary attacks you within Melee range, they mark a Stress.', 'EMBERWOVEN ARMOR Armor - Tier 4 Thresholds 13 / 36 Base Score 6 Burning: When an adversary attacks you within Melee range, they mark a Stress.', 'https://daggerheartsrd.com/armor/emberwoven-armor/'),
('FULL FORTIFIED ARMOR', 'Armor',4, 15, 40, 4, 'Fortified: When you mark an Armor Slot, you reduce the severity of an attack by two thresholds instead of one.', 'FULL FORTIFIED ARMOR Armor - Tier 4 Thresholds 15 / 40 Base Score 4 Fortified: When you mark an Armor Slot, you reduce the severity of an attack by two thresholds instead of one.', 'https://daggerheartsrd.com/armor/full-fortified-armor/'),
('LEGENDARY CHAINMAIL ARMOR', 'Armor',4, 15, 40, 7, 'Heavy: -1 to Evasion', 'LEGENDARY CHAINMAIL ARMOR Armor - Tier 4 Thresholds 15 / 40 Base Score 7 Heavy: -1 to Evasion', 'https://daggerheartsrd.com/armor/legendary-chainmail-armor/'),
('LEGENDARY FULL PLATE ARMOR', 'Armor',4, 17, 44, 7, 'Very Heavy: -2 to Evasion; -1 to Agility', 'LEGENDARY FULL PLATE ARMOR Armor - Tier 4 Thresholds 17 / 44 Base Score 7 Very Heavy: -2 to Evasion; -1 to Agility', 'https://daggerheartsrd.com/armor/legendary-full-plate-armor/'),
('LEGENDARY GAMBESON ARMOR', 'Armor',4, 11, 32, 6, 'Flexible: +1 to Evasion', 'LEGENDARY GAMBESON ARMOR Armor - Tier 4 Thresholds 11 / 32 Base Score 6 Flexible: +1 to Evasion', 'https://daggerheartsrd.com/armor/legendary-gambeson-armor/'),
('LEGENDARY LEATHER ARMOR', 'Armor',4, 13, 36, 6, NULL, 'LEGENDARY LEATHER ARMOR Armor - Tier 4 Thresholds 13 / 36 Base Score 6', 'https://daggerheartsrd.com/armor/legendary-leather-armor/'),
('SAVIOR CHAINMAIL', 'Armor',4, 18, 48, 8, 'Difficult: -1 to all character traits and Evasion', 'SAVIOR CHAINMAIL Armor - Tier 4 Thresholds 18 / 48 Base Score 8 Difficult: -1 to all character traits and Evasion', 'https://daggerheartsrd.com/armor/savior-chainmail/'),
('VERITAS OPAL ARMOR', 'Armor',4, 13, 36, 6, 'Truthseeking: This armor glows when another creature within Close range tells a lie.', 'VERITAS OPAL ARMOR Armor - Tier 4 Thresholds 13 / 36 Base Score 6 Truthseeking: This armor glows when another creature within Close range tells a lie.', 'https://daggerheartsrd.com/armor/veritas-opal-armor/'),
;
