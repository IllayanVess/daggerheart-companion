# Daggerheart Rules and Domain Reference

This file is a condensed markdown reference for the rules content the app needs in order to support character creation and future character management.

Sources:

- https://daggerheartsrd.com/rules/
- https://daggerheartsrd.com/rules/#domain

## Core Materials Relevant to the App

For the current app scope, the most important rule areas are:

- character creation
- domains
- classes
- subclasses
- ancestries
- communities
- weapons
- armor
- consumables

## Domains

The core set includes nine domain decks. Each domain is a themed set of cards that grants abilities, spells, or other features.

### Domain List

- `Arcana`: instinctive and elemental magic; used by Druid and Sorcerer
- `Blade`: weapon mastery and lethal combat skill; used by Guardian and Warrior
- `Bone`: tactics, bodies, and combat control; used by Ranger and Warrior
- `Codex`: studied magic and magical knowledge; used by Bard and Wizard
- `Grace`: charisma, language, influence, and deception; used by Bard and Rogue
- `Midnight`: shadows, secrecy, tricks, and hidden power; used by Rogue and Sorcerer
- `Sage`: nature, beasts, and primal power; used by Druid and Ranger
- `Splendor`: life, healing, and death-touched magic; used by Seraph and Wizard
- `Valor`: protection, defense, and martial support; used by Guardian and Seraph

## Class Domains

Each class grants access to two domains:

- `Bard`: Codex and Grace
- `Druid`: Arcana and Sage
- `Guardian`: Blade and Valor
- `Ranger`: Bone and Sage
- `Rogue`: Grace and Midnight
- `Seraph`: Splendor and Valor
- `Sorcerer`: Arcana and Midnight
- `Warrior`: Blade and Bone
- `Wizard`: Codex and Splendor

At character creation:

- PCs gain two level 1 domain cards

At level-up:

- PCs gain one additional domain card at or below their level

## Domain Card Basics

Each domain card has six core parts:

- level
- domain
- recall cost
- title
- type
- feature text

### Card Types

- `Ability`: usually non-magical
- `Spell`: magical
- `Grimoire`: special Codex card type that grants a set of smaller spells

## Loadout and Vault

The app should support two domain-card states:

- `loadout`
- `vault`

Rules:

- a character can have up to `5` domain cards in their loadout
- extra acquired cards go into the vault
- vault cards are inactive
- subclass, ancestry, and community cards are always active and do not count toward the loadout limit

Swapping rules:

- during rest, cards can move between loadout and vault freely
- outside rest, moving a vaulted card into the loadout costs Stress equal to that card’s recall cost
- if loadout is full, one card must be moved out to make room

## Classes and Subclasses

Classes determine:

- domain access
- starting evasion
- starting hit points
- starting items
- class feature(s)
- class hope feature

Subclasses determine:

- spellcast trait
- foundation feature
- specialization feature
- mastery feature

Current class and subclass pairs:

- `Bard`: Troubadour, Wordsmith
- `Druid`: Warden of the Elements, Warden of Renewal
- `Guardian`: Stalwart, Vengeance
- `Ranger`: Beastbound, Wayfinder
- `Rogue`: Nightwalker, Syndicate
- `Seraph`: Divine Wielder, Winged Sentinel
- `Sorcerer`: Elemental Origin, Primal Origin
- `Warrior`: Call of the Brave, Call of the Slayer
- `Wizard`: School of Knowledge, School of War

## Character-Creation Rules the App Must Respect

The builder should enforce or support:

- class selection before subclass selection
- ancestry and community together as heritage
- trait assignment using exactly `+2, +1, +1, +0, +0, -1`
- level `1` at creation
- hope `2` at creation
- stress `6` at creation
- class-based evasion and hit points
- tier 1 weapon and armor selection
- two starting experiences at `+2`
- two starting domain cards from the class domains
- connections created after the rest of the sheet is mostly known

## Suggested App Data Areas

To support the rules above, the app will need structured data for:

- classes
- subclasses
- ancestries
- communities
- domain cards
- weapons
- armor
- consumables
- class items

It will also need saved character fields for:

- identity
- heritage
- trait assignment
- stats
- equipment
- inventory
- experiences
- selected domain cards
- connections

## Useful Future Rules Sections

After the basic builder is done, the next rules sections worth modeling are:

- equipment
- weapons
- armor
- leveling up
- multiclassing
- downtime
- stress
- attacking
