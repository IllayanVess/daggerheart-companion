# Daggerheart Character Creation Rules

This file is the builder-facing markdown version of the character creation flow we want the app to follow.

## Overview

Unless the table uses pre-generated characters, each player creates their own PC through a guided set of choices. Some choices are narrative and mainly matter in roleplay, while others are mechanical and change what the PC can do and how likely they are to succeed.

Note:

- name
- pronouns
- character description

can be filled in at any point during character creation.

## Step 1: Choose a Class and Subclass

Classes are role-based archetypes that determine:

- class features
- class hope feature
- starting evasion
- starting hit points
- starting items
- domain access

There are nine classes in this SRD:

- Bard
- Druid
- Guardian
- Ranger
- Rogue
- Seraph
- Sorcerer
- Warrior
- Wizard

Class rules:

- select a class and use its character sheet and character guide
- every class begins with one or more class features
- if a class feature asks the player to make a choice, do that now

Then choose a subclass.

Subclass rules:

- each class has two subclasses
- the subclass further defines the class identity
- the chosen subclass grants access to its foundation feature

## Step 2: Choose Your Heritage

Heritage combines:

- ancestry
- community

### Ancestry

Ancestry reflects lineage, affects physicality, and grants two ancestry features.

Available ancestries:

- Clank
- Drakona
- Dwarf
- Elf
- Faerie
- Faun
- Firbolg
- Fungril
- Galapa
- Giant
- Goblin
- Halfling
- Human
- Infernis
- Katari
- Orc
- Ribbet
- Simiah

Mixed Ancestry rule:

- take the top feature from one ancestry
- take the bottom feature from another ancestry

### Community

Community reflects culture or place of origin and grants one community feature.

Available communities:

- Highborne
- Loreborne
- Orderborne
- Ridgeborne
- Seaborne
- Skyborne
- Underborne
- Wanderborne
- Wildborne

## Step 3: Assign Character Traits

Every character has six traits:

- Agility
- Strength
- Finesse
- Instinct
- Presence
- Knowledge

Trait summaries:

- `Agility`: sprint, leap, maneuver, react quickly
- `Strength`: lift, smash, grapple, endure force
- `Finesse`: control, hide, tinker, act precisely
- `Instinct`: perceive, sense, navigate, track
- `Presence`: charm, perform, deceive, influence
- `Knowledge`: recall, analyze, comprehend, infer

When a character rolls with a trait, that modifier is added to the roll total.

Assign these modifiers in any order:

- `+2`
- `+1`
- `+1`
- `+0`
- `+0`
- `-1`

## Step 4: Record Additional Character Information

Starting values:

- level starts at `1`
- evasion comes from class
- hit points come from class
- stress starts at `6`
- hope starts at `2`

Notes:

- HP can eventually grow to a maximum of `12`
- Stress can eventually grow to a maximum of `12`

## Step 5: Choose Your Starting Equipment

### Weapons

Choose from the Tier 1 weapon tables:

- either one two-handed primary weapon
- or one one-handed primary weapon plus one one-handed secondary weapon

Then:

- record the equipped weapon in the Active Weapon field
- at level `1`, proficiency is `1`
- record proficiency
- calculate the damage roll from proficiency plus the weapon damage dice

Damage rule reminder:

- proficiency changes the number of damage dice rolled
- proficiency does not change flat damage modifiers

### Armor

Choose one set of armor from the Tier 1 armor table.

Then:

- record it in the Active Armor field
- add character level to the armor’s base thresholds
- at creation, level is `1`
- record armor score as base score plus any permanent bonuses

### Starting Inventory

Add:

- a torch
- 50 feet of rope
- basic supplies
- a handful of gold
- either a Minor Health Potion or a Minor Stamina Potion
- one class-specific item from the class guide
- a spell-carrying item if the class uses one
- any other GM-approved starting items

## Step 6: Create Your Background

Build the character’s background by answering the background questions in the class guide.

The player can:

- keep those questions as written
- modify them
- replace them

Important note:

- background has no direct mechanical bonus
- it strongly affects roleplay, prep, and character identity
- earlier choices can be adjusted if the background changes how the character should feel

## Step 7: Create Your Experiences

An Experience is a word or phrase that represents a skill set, personality trait, or aptitude the character gained through life.

Experience rule:

- spend a Hope to add a relevant Experience modifier to an action or reaction roll

Starting Experiences:

- choose `2`
- each starts at `+2`

Experience restrictions:

- cannot be too broad
- cannot grant direct special powers or broken mechanical abilities

Example experience categories:

- backgrounds
- characteristics
- specialties
- skills
- phrases

## Step 8: Choose Domain Cards

Each class has access to two of the nine domains in the core set.

At character creation:

- choose `2` domain cards
- either one from each domain
- or both from one of the class’s two domains

## Step 9: Create Your Connections

Connections are the relationships between the PCs.

Suggested process:

1. each player describes their character
2. the table discusses possible connections
3. each player suggests at least one connection with every other PC
4. suggested connections can be accepted or rejected

Important note:

- players can reject any suggested connection
- not every pair of PCs must begin with a defined relationship
- connections can be discovered later through play

## Builder Implementation Notes

The app’s character creator should follow this order:

1. class and subclass
2. heritage
3. traits
4. core stats and trackers
5. starting equipment
6. background
7. experiences
8. domain cards
9. connections

The builder should also allow:

- saving partial progress as a draft
- editing earlier steps before final save
- filling in name, pronouns, and description at any point
