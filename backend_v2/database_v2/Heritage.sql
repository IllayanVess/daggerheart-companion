-- Contains 'Ancestry' and 'Community' tables to build out the 'Heritage' section of a character sheet


CREATE TABLE IF NOT EXISTS Ancestry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ancestry_name TEXT NOT NULL UNIQUE,
    ancestry_feature1 TEXT,
    ancestry_feature2 TEXT
);

CREATE TABLE IF NOT EXISTS Community (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    community_name TEXT NOT NULL UNIQUE,
    community_feature TEXT
);

INSERT OR IGNORE INTO Ancestry (ancestry_name, ancestry_feature1, ancestry_feature2) VALUES
('Clank', 'Purposeful Design: Decide who made you and for what purpose. At character creation, choose one of your Experiences that best aligns with this purpose and gain a permanent +1 bonus to it', 'Efficient: When you take a short rest, you can choose a long rest move instead of a short rest move'),
('Drakona', 'Scales: Your scales act as a natural protection. When you would take Severe damage, you can mark a Stress to mark 1 fewer Hit Points', 'Elemental Breath: Choose an element for your breath (such as electricity, fire, or ice). You can use this breath against a target or a group of targets within very Close Range, treating it as an Instinct weapon that deals d8 magic damage using your proficiency'),
('Dwarf', 'Thick Skin: When you take minor damage, you can mark 2 stress instead of marking a Hit Point', 'Increased Fortitude: Spend 3 hope to halve incoming physical damage'),
('Elf', 'Quick reactions: Mark a Stress to gain advantage on a reaction roll', 'Celestial Trance: During a rest, you can drop into a trance to choose an additional downtime move'),
('Faerie', 'Luckbender: Once per session, after you or a willing ally within close range makes an action roll, you can spend 3 hope to reroll the duality dice', ''),
('Faun', 'Caprine leap: You can leap anywhere within Close range as though you were using normal movement, allowing you to vault obstacles, jump across gaps, or scale barriers with ease', 'Kick: When you succeed on an attack against a target within melee range, you can mark a stress to kick yourself off them, dealing an extra 2d6 damage and knocking back either yourself or the target to Very Close range '),
('Firebolg', 'Charge: When you succeed on an Agility Roll to move from Far or Very Far range into Melee range with one or more targets, you can mark a Stress to deal 1d12 physical damage to all targets within Melee range', 'Unshakable: When you would mark a Stress, roll a d6. On a result of 6, do not mark it'),
('Fungril', 'Fungril Network: Make an Instinct Roll (12) to use your mycelial array to speak with others of your ancestry. On a success, you can communicate across any distance','Death Connection: While touching a corpse that died recently, you can mark a Stress to extract one memory from the corpse related to a specific emotion or sensation of your choice'),
('Galapa', 'Shell: Gain a bonus to your damage thresholds equal to your Proficiency', 'Retract: Mark a Stress to retract into your shell. While in your shell, you have resistance to physical damage, you have disadvantage on action rolls, and you cannot move'),
('Giant', 'Endurance: Gain an additional Hit Point slot at character creation', 'Reach: Treat any weapon, ability, spell, or other feature that has a Melee range as though it has a Very Close range instead'),
('Goblin', 'Surefooted: You ignore disadvantage on Agility Rolls', 'Danger Sense: Once per rest, mark a Stress to force an adversary to reroll an attack against you or an ally within Very Close range'),
('Halfling', 'Luckbringer: At the start of each session, everyone in your party gains a Hope', 'Internal Compass: When you roll a 1 on your Hope Die, you can reroll it'),
('Human', 'High Stamina: Gain an additional Stress slot at character creation', 'Adaptability: When you fail a roll that utilized one of your Experiences, you can mark a Stress to reroll'),
('Infernis', 'Fearless: When you roll with Fear, you can mark 2 Stress to change it into a roll with Hope instead', 'Dread Visage: You have advantage on rolls to intimidate hostile creatures'),
('Katari', 'Feline Instincts: When you make an Agility Roll, you can spend 2 Hope to reroll your Hope Die', 'Retracting Claws: Make an Agility Roll to scratch a target within Melee range. On a success, they become temporarily Vulnerable'),
('Orc', 'Sturdy: When you have 1 Hit Point remaining, attacks against you have disadvantage', 'Tusks: When you succeed on an attack against a target within Melee range, you can spend a Hope to gore the target with your tusks, dealing an extra 1d6 damage'),
('Ribbet', 'Amphibious: You can breathe and move naturally underwater', 'Long Tongue: You can use your long tongue to grab onto things within Close range. Mark a Stress to use your tongue as a Finesse Close weapon that deals d12 physical damage using your Proficiency'),
('Simiah', 'Natural Climber: You have advantage on Agility Rolls that involve balancing and climbing', 'Nimble: Gain a permanent +1 bonus to your Evasion at character creation');

INSERT OR IGNORE INTO Community (community_name, community_feature) VALUES
('HIGHBORNE', 'Privilege: You have advantage on rolls to consort with nobles, negotiate prices, or leverage your reputation to get what you want'),
('LOREBORNE', 'Well-Read: You have advantage on rolls that involve the history, culture, or politics of a prominent person or place'),
('ORDERBORNE', 'Dedicated: Record three sayings or values your upbringing instilled in you. Once per rest, when you describe how you are embodying one of these principles through your current action, you can roll a d20 as your Hope Die'),
('RIDGEBORNE ', 'Steady: You have advantage on rolls to traverse dangerous cliffs and ledges, navigate harsh environments, and use your survival knowledge'),
('SEABORNE', 'Know the Tide: You can sense the ebb and flow of life. When you roll with Fear, place a token on your community card. You can hold a number of tokens equal to your level. Before you make an action roll, you can spend any number of these tokens to gain a +1 bonus to the roll for each token spent. At the end of each session, clear all unspent tokens'),
('SLYBORNE', 'Scoundrel: You have advantage on rolls to negotiate with criminals, detect lies, or find a safe place to hide'),
('UNDERBORNE', 'Low-Light Living: When you''re in an area with low light or heavy shadow, you have advantage on rolls to hide, investigate, or perceive details within that area'),
('WANDERBORNE', 'Nomadic Pack: Add a Nomadic Pack to your inventory. Once per session, you can spend a Hope to reach into this pack and pull out a mundane item that is useful to your situation. Work with the GM to figure out what item you take out'),
('WILDBORNE', 'Lightfoot: Your movement is naturally silent. You have advantage on rolls to move without being heard');
