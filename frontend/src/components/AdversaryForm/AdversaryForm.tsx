import { FormEvent, useMemo, useState } from "react";

import { createAdversary } from "../../services/api";
import type { Adversary } from "../../types";
import type { AdversaryFormProps, AdversaryCreatePayload } from "./AdversaryForm.types";
import { AdversaryPreview } from "./AdversaryPreview";
import formStyles from "../../styles/forms.module.css";
import styles from "./AdversaryForm.module.css";

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

type ExperienceEntry = {
  name: string;
  modifier: number;
};

type FeatureEntry = {
  id: string;
  text: string;
};

type FeatureGroupState = Record<string, FeatureEntry[]>;

const DEFAULT_EXPERIENCE: ExperienceEntry = { name: "", modifier: 2 };
const FEATURE_GROUP_LABELS: Record<string, string> = {
  passive: "Passive",
  action: "Action",
  reaction: "Reaction",
  fear: "Fear",
};

function createFeatureEntry(): FeatureEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: "",
  };
}

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

export function AdversaryForm({ onSaved }: AdversaryFormProps) {
  const [status, setStatus] = useState("Ready to create a new adversary.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([
    { name: "", modifier: 2 },
  ]);
  const [featureGroups, setFeatureGroups] = useState<FeatureGroupState>({
    passive: [createFeatureEntry()],
    action: [createFeatureEntry()],
    reaction: [createFeatureEntry()],
    fear: [createFeatureEntry()],
  });
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);

  const previewPayload = useMemo<Omit<Adversary, "id" | "created_at" | "updated_at">>(() => {
    const cleanExperiences = experiences.filter((entry) => entry.name.trim());
    return buildPayload(formState, cleanExperiences, featureGroups);
  }, [formState, experiences, featureGroups]);

  function updateField<K extends keyof typeof INITIAL_FORM_STATE>(field: K, value: (typeof INITIAL_FORM_STATE)[K]) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function updateExperience(index: number, nextValue: Partial<ExperienceEntry>) {
    setExperiences((current) =>
      current.map((entry, currentIndex) => (currentIndex === index ? { ...entry, ...nextValue } : entry)),
    );
  }

  function addExperience() {
    setExperiences((current) => [...current, { ...DEFAULT_EXPERIENCE }]);
  }

  function removeExperience(index: number) {
    setExperiences((current) => (current.length === 1 ? current : current.filter((_, currentIndex) => currentIndex !== index)));
  }

  function addFeatureEntry(group: string) {
    setFeatureGroups((current) => ({
      ...current,
      [group]: [...(current[group] ?? []), createFeatureEntry()],
    }));
  }

  function updateFeatureEntry(group: string, entryId: string, text: string) {
    setFeatureGroups((current) => ({
      ...current,
      [group]: (current[group] ?? []).map((entry) => (entry.id === entryId ? { ...entry, text } : entry)),
    }));
  }

  function removeFeatureEntry(group: string, entryId: string) {
    setFeatureGroups((current) => {
      const currentEntries = current[group] ?? [];
      const nextEntries = currentEntries.filter((entry) => entry.id !== entryId);
      return {
        ...current,
        [group]: nextEntries.length > 0 ? nextEntries : [createFeatureEntry()],
      };
    });
  }

  const validateForm = (): string | null => {
    if (!formState.name.trim()) {
      return "Name is required";
    }
    if (!formState.attack_name.trim() || !formState.attack_range.trim() || !formState.attack_damage.trim()) {
      return "Complete the standard attack name, range, and damage.";
    }
    return null;
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isSubmitting) return;

    const validationError = validateForm();
    if (validationError) {
      setStatus(validationError);
      return;
    }

    setIsSubmitting(true);
    setStatus("Saving...");

    try {
      const payload = buildPayload(formState, experiences.filter((entry) => entry.name.trim()), featureGroups);
      const saved = await createAdversary(payload);
      setStatus(`Saved ${saved.name}.`);
      setFormState(INITIAL_FORM_STATE);
      setExperiences([{ ...DEFAULT_EXPERIENCE }]);
      setFeatureGroups({
        passive: [createFeatureEntry()],
        action: [createFeatureEntry()],
        reaction: [createFeatureEntry()],
        fear: [createFeatureEntry()],
      });
      onSaved(saved);
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("Adversary save failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
          <label>
            Name
            <input
              name="name"
              placeholder="Ashen Warden"
              required
              value={formState.name}
              onChange={(event) => updateField("name", event.target.value)}
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
              onChange={(event) => updateField("tier", Number(event.target.value) || 1)}
            />
          </label>

          <label>
            Type
            <select name="role" value={formState.role} onChange={(event) => updateField("role", event.target.value)}>
              {ADVERSARY_TYPES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className={formStyles.wide}>
            Description
            <textarea
              name="description"
              rows={2}
              placeholder="Physical description and appearance..."
              value={formState.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
          </label>

          <label>
            Motives
            <input
              name="motives"
              placeholder="Escape, profit, steal"
              value={formState.motives}
              onChange={(event) => updateField("motives", event.target.value)}
            />
          </label>

          <label>
            Tactics
            <input
              name="tactics"
              placeholder="Throw smoke, ambush"
              value={formState.tactics}
              onChange={(event) => updateField("tactics", event.target.value)}
            />
          </label>

          <label>
            Difficulty
            <input
              name="difficulty"
              type="number"
              placeholder="12"
              value={formState.difficulty}
              onChange={(event) => updateField("difficulty", event.target.value)}
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
              onChange={(event) => updateField("thresholds_major", event.target.value)}
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
              onChange={(event) => updateField("thresholds_severe", event.target.value)}
            />
          </label>

          <label>
            Hit Points
            <input
              name="hit_points"
              type="number"
              min="0"
              value={formState.hit_points}
              onChange={(event) => updateField("hit_points", event.target.value)}
            />
          </label>

          <label>
            Stress
            <input
              name="stress"
              type="number"
              min="0"
              value={formState.stress}
              onChange={(event) => updateField("stress", event.target.value)}
            />
          </label>

          <label>
            Attack Name
            <input
              name="attack_name"
              placeholder="Daggers"
              value={formState.attack_name}
              onChange={(event) => updateField("attack_name", event.target.value)}
            />
          </label>

          <label>
            Attack Range
            <input
              name="attack_range"
              placeholder="Melee"
              value={formState.attack_range}
              onChange={(event) => updateField("attack_range", event.target.value)}
            />
          </label>

          <label>
            Attack Damage
            <input
              name="attack_damage"
              placeholder="1d8+1 phy"
              value={formState.attack_damage}
              onChange={(event) => updateField("attack_damage", event.target.value)}
            />
          </label>

          <label>
            Attack Modifier
            <input
              name="attack_modifier"
              type="number"
              placeholder="1"
              value={formState.attack_modifier}
              onChange={(event) => updateField("attack_modifier", event.target.value)}
            />
          </label>

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
              {experiences.map((experience, index) => (
                <div key={`experience-${index}`} className={styles.experienceRow}>
                  <input
                    placeholder="Thief"
                    value={experience.name}
                    onChange={(event) => updateExperience(index, { name: event.target.value })}
                  />
                  <input
                    type="number"
                    value={experience.modifier}
                    onChange={(event) => updateExperience(index, { modifier: Number(event.target.value) || 0 })}
                  />
                  <button className="secondary-button" type="button" onClick={() => removeExperience(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {Object.entries(FEATURE_GROUP_LABELS).map(([groupKey, label]) => (
            <div key={groupKey} className={`${formStyles.wide} ${styles.structuredGroup}`}>
              <div className={styles.structuredHeader}>
                <div>
                  <p className="eyebrow">Features</p>
                  <h3>{label}</h3>
                </div>
                <button className="secondary-button" type="button" onClick={() => addFeatureEntry(groupKey)}>
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
                        onChange={(event) => updateFeatureEntry(groupKey, entry.id, event.target.value)}
                      />
                    </label>
                    <button className="secondary-button" type="button" onClick={() => removeFeatureEntry(groupKey, entry.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <label className={formStyles.wide}>
            Notes
            <textarea
              name="notes"
              rows={3}
              placeholder="Encounter notes, fear triggers, countdowns, or summoning reminders."
              value={formState.notes}
              onChange={(event) => updateField("notes", event.target.value)}
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

function buildPayload(
  formState: typeof INITIAL_FORM_STATE,
  experiences: ExperienceEntry[],
  featureGroups: FeatureGroupState,
): AdversaryCreatePayload {
  const getNumber = (value: string): number | null => {
    if (!value.trim()) {
      return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const normalizedFeatureGroups = Object.fromEntries(
    Object.entries(featureGroups).map(([group, entries]) => [
      group,
      entries.map((entry) => entry.text.trim()).filter(Boolean),
    ]),
  ) as Record<string, string[]>;
  const joinGroup = (group: string) => normalizedFeatureGroups[group]?.join("\n\n") || null;

  return {
    name: formState.name.trim(),
    tier: formState.tier,
    role: formState.role,
    description: formState.description.trim() || null,
    motives: formState.motives.trim() || null,
    tactics: formState.tactics.trim() || null,
    difficulty: getNumber(formState.difficulty),
    thresholds_major: getNumber(formState.thresholds_major),
    thresholds_severe: getNumber(formState.thresholds_severe),
    hit_points: getNumber(formState.hit_points),
    stress: getNumber(formState.stress),
    attack_name: formState.attack_name.trim() || null,
    attack_range: formState.attack_range.trim() || null,
    attack_damage: formState.attack_damage.trim() || null,
    attack_standard: [formState.attack_name, formState.attack_range, formState.attack_damage]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(" | ") || null,
    attack_modifier: getNumber(formState.attack_modifier),
    passive_features: joinGroup("passive"),
    action_features: joinGroup("action"),
    reaction_features: joinGroup("reaction"),
    fear_features: joinGroup("fear"),
    feature_groups: normalizedFeatureGroups,
    features: null,
    experiences_list: experiences,
    experiences:
      experiences.length > 0
        ? experiences.map((entry) => `${entry.name.trim()} ${entry.modifier >= 0 ? "+" : ""}${entry.modifier}`).join(", ")
        : null,
    notes: formState.notes.trim() || null,
    data_json: {
      feature_groups: normalizedFeatureGroups,
    },
  };
}
