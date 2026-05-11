// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import { useMemo, useState } from "react";

import { updateCharacter } from "../../services/api";
import { getCharacterMaxHitPoints, getCharacterMaxStress } from "../../utils/characterUtils";
import type { Character, CharacterUpsertPayload } from "../../types";
import styles from "./CharacterLevelUpModal.module.css";

type CharacterLevelUpModalProps = {
  character: Character;
  onClose: () => void;
  onSaved: (character: Character) => void;
};

type AdvancementOption =
  | "trait_boost"
  | "hit_point"
  | "stress"
  | "experience"
  | "domain_card"
  | "evasion"
  | "upgraded_subclass"
  | "proficiency"
  | "multiclass";

const TRAIT_OPTIONS = ["Agility", "Strength", "Finesse", "Instinct", "Presence", "Knowledge"] as const;

const ADVANCEMENT_LABELS: Record<AdvancementOption, string> = {
  trait_boost: "Increase two traits",
  hit_point: "Add 1 hit point slot",
  stress: "Add 1 stress slot",
  experience: "Increase two experiences",
  domain_card: "Take an additional domain card",
  evasion: "Increase evasion",
  upgraded_subclass: "Take an upgraded subclass card",
  proficiency: "Increase proficiency (uses both picks)",
  multiclass: "Multiclass (uses both picks)",
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asExperiences(value: unknown) {
  return Array.isArray(value)
    ? value.filter(
        (entry): entry is { name: string; modifier: number } =>
          typeof entry === "object" &&
          entry !== null &&
          typeof (entry as { name?: unknown }).name === "string" &&
          typeof (entry as { modifier?: unknown }).modifier === "number",
      )
    : [];
}

function asDomainCards(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function bumpSignedNumber(value: string, amount: number) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return value;
  }
  const nextValue = numericValue + amount;
  return nextValue > 0 ? `+${nextValue}` : String(nextValue);
}

function tierForLevel(level: number) {
  if (level >= 8) {
    return 4;
  }
  if (level >= 5) {
    return 3;
  }
  if (level >= 2) {
    return 2;
  }
  return 1;
}

export function CharacterLevelUpModal({ character, onClose, onSaved }: CharacterLevelUpModalProps) {
  const payload = character.data_json ?? {};
  const currentLevel = character.level;
  const nextLevel = Math.min(10, currentLevel + 1);
  const experiences = useMemo(() => asExperiences(payload.experiences), [payload.experiences]);
  const domainCards = useMemo(() => asDomainCards(payload.domain_cards), [payload.domain_cards]);
  const [advancementOne, setAdvancementOne] = useState<AdvancementOption>("hit_point");
  const [advancementTwo, setAdvancementTwo] = useState<AdvancementOption>("stress");
  const [newTierExperience, setNewTierExperience] = useState("");
  const [traitBoostOne, setTraitBoostOne] = useState<(typeof TRAIT_OPTIONS)[number]>("Agility");
  const [traitBoostTwo, setTraitBoostTwo] = useState<(typeof TRAIT_OPTIONS)[number]>("Strength");
  const [experienceBoostOne, setExperienceBoostOne] = useState(experiences[0]?.name ?? "");
  const [experienceBoostTwo, setExperienceBoostTwo] = useState(experiences[1]?.name ?? "");
  const [newDomainCard, setNewDomainCard] = useState("");
  const [advancementNotes, setAdvancementNotes] = useState("");
  const [status, setStatus] = useState("");

  const milestoneLevel = nextLevel === 2 || nextLevel === 5 || nextLevel === 8;
  const usesBothAdvancements = advancementOne === "proficiency" || advancementOne === "multiclass";
  const canLevelUp = currentLevel < 10;

  async function handleConfirm() {
    if (!canLevelUp) {
      setStatus("This character is already at level 10.");
      return;
    }

    if (milestoneLevel && !newTierExperience.trim()) {
      setStatus("Add the tier achievement experience before confirming.");
      return;
    }

    const nextTraits = { ...(payload.traits as Record<string, string> | undefined) };
    const nextExperiences = experiences.map((entry) => ({ ...entry }));
    const nextDomainCards = [...domainCards];
    const nextAdvancementLog = Array.isArray(payload.level_up_log)
      ? payload.level_up_log.filter((entry): entry is string => typeof entry === "string")
      : [];

    let nextProficiency = asNumber(payload.proficiency, 1) + (milestoneLevel ? 1 : 0);
    let nextMaxHitPoints = getCharacterMaxHitPoints(character);
    let nextMaxStress = getCharacterMaxStress(character);
    let nextEvasion = character.evasion ?? 0;

    const pickedAdvancements = usesBothAdvancements ? [advancementOne] : [advancementOne, advancementTwo];

    for (const advancement of pickedAdvancements) {
      if (advancement === "trait_boost") {
        nextTraits[traitBoostOne] = bumpSignedNumber(nextTraits[traitBoostOne] ?? "0", 1);
        nextTraits[traitBoostTwo] = bumpSignedNumber(nextTraits[traitBoostTwo] ?? "0", 1);
      }

      if (advancement === "hit_point") {
        nextMaxHitPoints += 1;
      }

      if (advancement === "stress") {
        nextMaxStress += 1;
      }

      if (advancement === "experience") {
        nextExperiences.forEach((entry) => {
          if (entry.name === experienceBoostOne || entry.name === experienceBoostTwo) {
            entry.modifier += 1;
          }
        });
      }

      if (advancement === "domain_card" && newDomainCard.trim()) {
        nextDomainCards.push(newDomainCard.trim());
      }

      if (advancement === "evasion") {
        nextEvasion += 1;
      }

      if (advancement === "proficiency") {
        nextProficiency += 1;
      }
    }

    if (milestoneLevel) {
      nextExperiences.push({ name: newTierExperience.trim(), modifier: 2 });
      if (nextLevel === 5 || nextLevel === 8) {
        nextAdvancementLog.push(`Level ${nextLevel}: cleared marked traits for the new tier.`);
      }
    }

    if (pickedAdvancements.includes("upgraded_subclass")) {
      nextAdvancementLog.push(`Level ${nextLevel}: took an upgraded subclass card.`);
    }

    if (pickedAdvancements.includes("multiclass")) {
      nextAdvancementLog.push(`Level ${nextLevel}: multiclassed. ${advancementNotes.trim()}`.trim());
    } else if (advancementNotes.trim()) {
      nextAdvancementLog.push(`Level ${nextLevel}: ${advancementNotes.trim()}`);
    }

    const requestPayload: CharacterUpsertPayload = {
      name: character.name,
      class_name: character.class_name,
      subclass_name: character.subclass_name,
      ancestry: character.ancestry,
      community: character.community,
      level: nextLevel,
      evasion: nextEvasion,
      armor: character.armor,
      hit_points: Math.min(character.hit_points ?? 0, nextMaxHitPoints),
      stress: Math.min(character.stress ?? 0, nextMaxStress),
      hope: character.hope,
      notes: character.notes,
      data_json: {
        ...payload,
        traits: nextTraits,
        proficiency: nextProficiency,
        max_hit_points: nextMaxHitPoints,
        max_stress: nextMaxStress,
        experiences: nextExperiences,
        domain_cards: nextDomainCards,
        level_up_log: nextAdvancementLog,
      },
    };

    try {
      const updatedCharacter = await updateCharacter(character.id, requestPayload);
      onSaved(updatedCharacter);
    } catch {
      setStatus("Level-up save failed.");
    }
  }

  return (
    <div className={styles.levelUpBackdrop} role="presentation">
      <section aria-modal="true" className={styles.levelUpModal} role="dialog">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Level Up</p>
            <h2>
              {character.name}: Level {currentLevel} to {nextLevel}
            </h2>
          </div>
          <button className="secondary-button" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className={styles.levelUpGrid}>
          <article className={styles.levelUpCard}>
            <h3>Rules Summary</h3>
            <div className={styles.levelUpSummary}>
              <p>Each level-up raises all damage thresholds by 1 through the new character level.</p>
              <p>Levels 2, 5, and 8 also grant a new +2 experience and +1 proficiency.</p>
              <p>Choose two advancements unless you take `Increase proficiency` or `Multiclass`, which spend both picks.</p>
            </div>
          </article>

          {milestoneLevel ? (
            <article className={styles.levelUpCard}>
              <h3>Tier Achievement</h3>
              <p>Level {nextLevel} adds one new experience at +2 and increases proficiency by 1.</p>
              <label>
                New Experience Name
                <input value={newTierExperience} onChange={(event) => setNewTierExperience(event.target.value)} />
              </label>
            </article>
          ) : null}

          <article className={styles.levelUpCard}>
            <h3>Advancements</h3>
            <div className={styles.levelUpTwoColumn}>
              <label>
                Advancement One
                <select value={advancementOne} onChange={(event) => setAdvancementOne(event.target.value as AdvancementOption)}>
                  {Object.entries(ADVANCEMENT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Advancement Two
                <select
                  disabled={usesBothAdvancements}
                  value={advancementTwo}
                  onChange={(event) => setAdvancementTwo(event.target.value as AdvancementOption)}
                >
                  {Object.entries(ADVANCEMENT_LABELS)
                    .filter(([value]) => value !== "proficiency" && value !== "multiclass")
                    .map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                </select>
              </label>
            </div>

            {pickedAdvancementsNeedTraitInputs(advancementOne, advancementTwo, usesBothAdvancements) ? (
              <div className={styles.levelUpTwoColumn}>
                <label>
                  Trait Boost One
                  <select value={traitBoostOne} onChange={(event) => setTraitBoostOne(event.target.value as (typeof TRAIT_OPTIONS)[number])}>
                    {TRAIT_OPTIONS.map((trait) => (
                      <option key={trait} value={trait}>
                        {trait}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Trait Boost Two
                  <select value={traitBoostTwo} onChange={(event) => setTraitBoostTwo(event.target.value as (typeof TRAIT_OPTIONS)[number])}>
                    {TRAIT_OPTIONS.map((trait) => (
                      <option key={trait} value={trait}>
                        {trait}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}

            {pickedAdvancementsNeedExperienceInputs(advancementOne, advancementTwo, usesBothAdvancements) ? (
              <div className={styles.levelUpTwoColumn}>
                <label>
                  Experience One
                  <select value={experienceBoostOne} onChange={(event) => setExperienceBoostOne(event.target.value)}>
                    {experiences.map((entry) => (
                      <option key={entry.name} value={entry.name}>
                        {entry.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Experience Two
                  <select value={experienceBoostTwo} onChange={(event) => setExperienceBoostTwo(event.target.value)}>
                    {experiences.map((entry) => (
                      <option key={entry.name} value={entry.name}>
                        {entry.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}

            {pickedAdvancementsNeedDomainCard(advancementOne, advancementTwo, usesBothAdvancements) ? (
              <label>
                Domain Card Gained
                <input
                  placeholder="Enter the new domain card name"
                  value={newDomainCard}
                  onChange={(event) => setNewDomainCard(event.target.value)}
                />
              </label>
            ) : null}

            <label>
              Advancement Notes
              <textarea
                rows={4}
                placeholder="Use this for subclass upgrades, multiclass details, vault/loadout swaps, or any table notes."
                value={advancementNotes}
                onChange={(event) => setAdvancementNotes(event.target.value)}
              />
            </label>
          </article>

          <article className={styles.levelUpCard}>
            <h3>Projected Sheet</h3>
            <div className={styles.levelUpSummary}>
              <p>Level: {currentLevel} to {nextLevel}</p>
              <p>Max HP: {getCharacterMaxHitPoints(character)}</p>
              <p>Max Stress: {getCharacterMaxStress(character)}</p>
              <p>Proficiency: {asNumber(payload.proficiency, 1)}{milestoneLevel ? " + 1 tier bonus" : ""}</p>
            </div>
          </article>
        </div>

        {status ? <p className="status">{status}</p> : null}

        <div className={styles.levelUpActions}>
          <button className="secondary-button" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="primary-button" disabled={!canLevelUp} onClick={() => void handleConfirm()} type="button">
            Confirm Level Up
          </button>
        </div>
      </section>
    </div>
  );
}

function pickedAdvancementsNeedTraitInputs(
  advancementOne: AdvancementOption,
  advancementTwo: AdvancementOption,
  usesBothAdvancements: boolean,
) {
  return advancementOne === "trait_boost" || (!usesBothAdvancements && advancementTwo === "trait_boost");
}

function pickedAdvancementsNeedExperienceInputs(
  advancementOne: AdvancementOption,
  advancementTwo: AdvancementOption,
  usesBothAdvancements: boolean,
) {
  return advancementOne === "experience" || (!usesBothAdvancements && advancementTwo === "experience");
}

function pickedAdvancementsNeedDomainCard(
  advancementOne: AdvancementOption,
  advancementTwo: AdvancementOption,
  usesBothAdvancements: boolean,
) {
  return advancementOne === "domain_card" || (!usesBothAdvancements && advancementTwo === "domain_card");
}
