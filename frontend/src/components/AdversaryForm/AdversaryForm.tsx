// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import { FormEvent, useMemo, useState } from "react";

import { createAdversary } from "../../services/api";
import type { Adversary } from "../../types";
import type { AdversaryFormProps, AdversaryCreatePayload } from "./AdversaryForm.types";
import { AdversaryPreview } from "./AdversaryPreview";
import formStyles from "../../styles/forms.module.css";
import styles from "./AdversaryForm.module.css";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ADVERSARY_TYPES = [
  "Standard",
  "Bruiser",
  "Horde",
  "Leader",
  "Minion",
  "Ranged",
  "Skulk",
  "Social",
  "Solo",
  "Support",
] as const;

const FEATURE_GROUP_LABELS: Record<string, string> = {
  passive: "Passive",
  action: "Action",
  reaction: "Reaction",
  fear: "Fear",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ExperienceEntry = {
  id: string;
  name: string;
  modifier: number;
};

type FeatureEntry = {
  id: string;
  text: string;
};

type FeatureGroupState = Record<string, FeatureEntry[]>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createExperienceEntry(): ExperienceEntry {
  return { id: uid(), name: "", modifier: 2 };
}

function createFeatureEntry(): FeatureEntry {
  return { id: uid(), text: "" };
}

function createInitialFeatureGroups(): FeatureGroupState {
  return {
    passive: [createFeatureEntry()],
    action: [createFeatureEntry()],
    reaction: [createFeatureEntry()],
    fear: [createFeatureEntry()],
  };
}

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

const INITIAL_FORM_STATE = {
  name: "",
  tier: 1,
  role: "Standard",
  description: "",
  motives: "",
  tactics: "",
  difficulty: "",
  thresholds_major: "",
  thresholds_severe: "",
  hit_points: "",
  stress: "",
  attack_name: "",
  attack_range: "",
  attack_damage: "",
  attack_modifier: "",
  notes: "",
};

type FormState = typeof INITIAL_FORM_STATE;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateForm(formState: FormState): string | null {
  if (!formState.name.trim()) {
    return "Name is required.";
  }
  if (!formState.attack_name.trim() || !formState.attack_range.trim() || !formState.attack_damage.trim()) {
    return "Complete the standard attack name, range, and damage.";
  }
  const tier = formState.tier;
  if (!Number.isInteger(tier) || tier < 1 || tier > 4) {
    return "Tier must be between 1 and 4.";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Payload builder — pure function, single source of truth
// ---------------------------------------------------------------------------

function buildPayload(
  formState: FormState,
  experiences: ExperienceEntry[],
  featureGroups: FeatureGroupState,
): AdversaryCreatePayload {
  const toNumber = (value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const normalizedFeatureGroups = Object.fromEntries(
    Object.entries(featureGroups).map(([group, entries]) => [
      group,
      entries.map((e) => e.text.trim()).filter(Boolean),
    ]),
  ) as Record<string, string[]>;

  const joinGroup = (group: string): string | null =>
    normalizedFeatureGroups[group]?.join("\n\n") || null;

  // NOTE: attack_standard is a denormalized field derived from three stored columns.
  // Consider computing this on the backend instead to avoid stale values on edits.
  const attackParts = [formState.attack_name, formState.attack_range, formState.attack_damage]
    .map((v) => v.trim())
    .filter(Boolean);

  const formattedExperiences = experiences.map(
    (e) => `${e.name.trim()} ${e.modifier >= 0 ? "+" : ""}${e.modifier}`,
  );

  return {
    name: formState.name.trim(),
    tier: formState.tier,
    role: formState.role,
    description: formState.description.trim() || null,
    motives: formState.motives.trim() || null,
    tactics: formState.tactics.trim() || null,
    difficulty: toNumber(formState.difficulty),
    thresholds_major: toNumber(formState.thresholds_major),
    thresholds_severe: toNumber(formState.thresholds_severe),
    hit_points: toNumber(formState.hit_points),
    stress: toNumber(formState.stress),
    attack_name: formState.attack_name.trim() || null,
    attack_range: formState.attack_range.trim() || null,
    attack_damage: formState.attack_damage.trim() || null,
    attack_standard: attackParts.length > 0 ? attackParts.join(" | ") : null,
    attack_modifier: toNumber(formState.attack_modifier),
    passive_features: joinGroup("passive"),
    action_features: joinGroup("action"),
    reaction_features: joinGroup("reaction"),
    fear_features: joinGroup("fear"),
    feature_groups: normalizedFeatureGroups,
    experiences_list: experiences,
    experiences: formattedExperiences.length > 0 ? formattedExperiences.join(", ") : null,
    notes: formState.notes.trim() || null,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdversaryForm({ onSaved }: AdversaryFormProps) {
  const [status, setStatus] = useState("Ready to create a new adversary.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([createExperienceEntry()]);
  const [featureGroups, setFeatureGroups] = useState<FeatureGroupState>(createInitialFeatureGroups);

  // Clean experiences (non-empty names) are shared between preview and submit
  // to guarantee they always see the same filtered data.
  const cleanExperiences = useMemo(
    () => experiences.filter((e) => e.name.trim()),
    [experiences],
  );

  const previewPayload = useMemo<Omit<Adversary, "id" | "created_at" | "updated_at">>(
    () => buildPayload(formState, cleanExperiences, featureGroups),
    [formState, cleanExperiences, featureGroups],
  );

  // ---------------------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------------------

  function resetForm(): void {
    setFormState(INITIAL_FORM_STATE);
    setExperiences([createExperienceEntry()]);
    setFeatureGroups(createInitialFeatureGroups());
    setStatus("Ready to create a new adversary.");
  }

  // ---------------------------------------------------------------------------
  // Field updaters
  // ---------------------------------------------------------------------------

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]): void {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  // ---------------------------------------------------------------------------
  // Experience updaters
  // ---------------------------------------------------------------------------

  function addExperience(): void {
    setExperiences((current) => [...current, createExperienceEntry()]);
  }

  function updateExperience(id: string, next: Partial<Omit<ExperienceEntry, "id">>): void {
    setExperiences((current) =>
      current.map((e) => (e.id === id ? { ...e, ...next } : e)),
    );
  }

  function removeExperience(id: string): void {
    setExperiences((current) => {
      if (current.length === 1) return current;
      return current.filter((e) => e.id !== id);
    });
  }

  // ---------------------------------------------------------------------------
  // Feature updaters
  // ---------------------------------------------------------------------------

  function addFeatureEntry(group: string): void {
    setFeatureGroups((current) => ({
      ...current,
      [group]: [...(current[group] ?? []), createFeatureEntry()],
    }));
  }

  function updateFeatureEntry(group: string, entryId: string, text: string): void {
    setFeatureGroups((current) => ({
      ...current,
      [group]: (current[group] ?? []).map((e) =>
        e.id === entryId ? { ...e, text } : e,
      ),
    }));
  }

  function removeFeatureEntry(group: string, entryId: string): void {
    setFeatureGroups((current) => {
      const next = (current[group] ?? []).filter((e) => e.id !== entryId);
      return {
        ...current,
        [group]: next.length > 0 ? next : [createFeatureEntry()],
      };
    });
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isSubmitting) return;

    const validationError = validateForm(formState);
    if (validationError) {
      setStatus(validationError);
      return;
    }

    setIsSubmitting(true);
    setStatus("Saving...");

    try {
      // Reuse the same cleanExperiences already computed for the preview —
      // preview and saved data are guaranteed to match.
      const payload = buildPayload(formState, cleanExperiences, featureGroups);
      const saved = await createAdversary(payload);
      onSaved(saved);
      resetForm();
      setStatus(`Saved ${saved.name}.`);
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("Adversary save failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Adversary Builder</p>
          <h2>Build an encounter</h2>
        </div>
        <p className="status" aria-live="polite">
          {status}
        </p>
      </div>

      <div className={styles.adversaryBuilderLayout}>
        <form className={formStyles.formGrid} onSubmit={handleSubmit}>

          {/* ── Core identity ── */}
          <label>
            Name
            <input
              name="name"
              placeholder="Ashen Warden"
              required
              value={formState.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </label>

          <label>
            Tier
            <input
              name="tier"
              type="number"
              min="1"
              max="4"
              value={formState.tier}
              onChange={(e) => updateField("tier", Number(e.target.value) || 1)}
            />
          </label>

          <label>
            Type
            <select
              name="role"
              value={formState.role}
              onChange={(e) => updateField("role", e.target.value)}
            >
              {ADVERSARY_TYPES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          {/* ── Description ── */}
          <label className={formStyles.wide}>
            Description
            <textarea
              name="description"
              rows={2}
              placeholder="Physical description and appearance..."
              value={formState.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </label>

          <label>
            Motives
            <input
              name="motives"
              placeholder="Escape, profit, steal"
              value={formState.motives}
              onChange={(e) => updateField("motives", e.target.value)}
            />
          </label>

          <label>
            Tactics
            <input
              name="tactics"
              placeholder="Throw smoke, ambush"
              value={formState.tactics}
              onChange={(e) => updateField("tactics", e.target.value)}
            />
          </label>

          {/* ── Combat stats ── */}
          <label>
            Difficulty
            <input
              name="difficulty"
              type="number"
              min="0"
              placeholder="12"
              value={formState.difficulty}
              onChange={(e) => updateField("difficulty", e.target.value)}
            />
          </label>

          <label>
            Major Threshold
            <input
              name="thresholds_major"
              type="number"
              min="0"
              placeholder="8"
              value={formState.thresholds_major}
              onChange={(e) => updateField("thresholds_major", e.target.value)}
            />
          </label>

          <label>
            Severe Threshold
            <input
              name="thresholds_severe"
              type="number"
              min="0"
              placeholder="14"
              value={formState.thresholds_severe}
              onChange={(e) => updateField("thresholds_severe", e.target.value)}
            />
          </label>

          <label>
            Hit Points
            <input
              name="hit_points"
              type="number"
              min="0"
              value={formState.hit_points}
              onChange={(e) => updateField("hit_points", e.target.value)}
            />
          </label>

          <label>
            Stress
            <input
              name="stress"
              type="number"
              min="0"
              value={formState.stress}
              onChange={(e) => updateField("stress", e.target.value)}
            />
          </label>

          {/* ── Attack ── */}
          <label>
            Attack Name
            <input
              name="attack_name"
              placeholder="Daggers"
              value={formState.attack_name}
              onChange={(e) => updateField("attack_name", e.target.value)}
            />
          </label>

          <label>
            Attack Range
            <input
              name="attack_range"
              placeholder="Melee"
              value={formState.attack_range}
              onChange={(e) => updateField("attack_range", e.target.value)}
            />
          </label>

          <label>
            Attack Damage
            <input
              name="attack_damage"
              placeholder="1d8+1 phy"
              value={formState.attack_damage}
              onChange={(e) => updateField("attack_damage", e.target.value)}
            />
          </label>

          <label>
            Attack Modifier
            <input
              name="attack_modifier"
              type="number"
              placeholder="1"
              value={formState.attack_modifier}
              onChange={(e) => updateField("attack_modifier", e.target.value)}
            />
          </label>

          {/* ── Experiences ── */}
          <div className={`${formStyles.wide} ${styles.structuredGroup}`}>
            <div className={styles.structuredHeader}>
              <div>
                <p className="eyebrow">Experiences</p>
                <h3>Repeatable List</h3>
              </div>
              <button className="secondary-button" type="button" onClick={addExperience}>
                Add Experience
              </button>
            </div>

            <div className={styles.experienceList}>
              {experiences.map((experience) => (
                <div key={experience.id} className={styles.experienceRow}>
                  <input
                    placeholder="Thief"
                    value={experience.name}
                    onChange={(e) => updateExperience(experience.id, { name: e.target.value })}
                  />
                  <input
                    type="number"
                    value={experience.modifier}
                    onChange={(e) =>
                      updateExperience(experience.id, { modifier: Number(e.target.value) || 0 })
                    }
                  />
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => removeExperience(experience.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Feature groups ── */}
          {Object.entries(FEATURE_GROUP_LABELS).map(([groupKey, label]) => (
            <div key={groupKey} className={`${formStyles.wide} ${styles.structuredGroup}`}>
              <div className={styles.structuredHeader}>
                <div>
                  <p className="eyebrow">Features</p>
                  <h3>{label}</h3>
                </div>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => addFeatureEntry(groupKey)}
                >
                  Add {label}
                </button>
              </div>

              <div className={styles.featureEntryList}>
                {(featureGroups[groupKey] ?? []).map((entry, index) => (
                  <div key={entry.id} className={styles.featureEntryCard}>
                    <label>
                      {label} {index + 1}
                      <textarea
                        rows={3}
                        placeholder={`${label} feature text`}
                        value={entry.text}
                        onChange={(e) => updateFeatureEntry(groupKey, entry.id, e.target.value)}
                      />
                    </label>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => removeFeatureEntry(groupKey, entry.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* ── Notes ── */}
          <label className={formStyles.wide}>
            Notes
            <textarea
              name="notes"
              rows={3}
              placeholder="Encounter notes, fear triggers, countdowns, or summoning reminders."
              value={formState.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </label>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Adversary"}
          </button>
        </form>

        <AdversaryPreview adversary={previewPayload} />
      </div>
    </section>
  );
}