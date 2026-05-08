import { FormEvent, useMemo, useState } from "react";

import { createNpc } from "../../services/api";
import type { NPC, NPCUpsertPayload } from "../../types";
import formStyles from "../../styles/forms.module.css";
import adversaryStyles from "../AdversaryForm/AdversaryForm.module.css";

type NpcFormProps = {
  onSaved: (npc: NPC) => void;
};

type ExperienceEntry = {
  name: string;
  modifier: number;
};

type FeatureEntry = {
  id: string;
  text: string;
};

type FeatureGroupState = Record<string, FeatureEntry[]>;

const FEATURE_GROUP_LABELS: Record<string, string> = {
  passive: "Passive",
  action: "Action",
  reaction: "Reaction",
  fear: "Fear",
};

const INITIAL_FORM_STATE = {
  name: "",
  tier: "",
  role: "",
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

function createFeatureEntry(): FeatureEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: "",
  };
}

function createInitialFeatures(): FeatureGroupState {
  return {
    passive: [createFeatureEntry()],
    action: [createFeatureEntry()],
    reaction: [createFeatureEntry()],
    fear: [createFeatureEntry()],
  };
}

function getNumber(value: string): number | null {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function buildPayload(
  formState: typeof INITIAL_FORM_STATE,
  experiences: ExperienceEntry[],
  featureGroups: FeatureGroupState,
): NPCUpsertPayload {
  const normalizedFeatureGroups = Object.fromEntries(
    Object.entries(featureGroups).map(([group, entries]) => [
      group,
      entries.map((entry) => entry.text.trim()).filter(Boolean),
    ]),
  ) as Record<string, string[]>;
  const joinGroup = (group: string) => normalizedFeatureGroups[group]?.join("\n\n") || null;
  const cleanExperiences = experiences.filter((entry) => entry.name.trim());

  return {
    name: formState.name.trim() || "Unnamed NPC",
    tier: getNumber(formState.tier),
    role: formState.role.trim() || null,
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
    attack_standard:
      [formState.attack_name, formState.attack_range, formState.attack_damage]
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
    experiences_list: cleanExperiences,
    experiences:
      cleanExperiences.length > 0
        ? cleanExperiences.map((entry) => `${entry.name.trim()} ${entry.modifier >= 0 ? "+" : ""}${entry.modifier}`).join(", ")
        : null,
    notes: formState.notes.trim() || null,
    data_json: {
      feature_groups: normalizedFeatureGroups,
    },
  };
}

function NpcPreview({ npc }: { npc: NPCUpsertPayload }) {
  return (
    <article className={adversaryStyles.adversaryPreviewCard}>
      <p className="eyebrow">Preview</p>
      <h3 className={adversaryStyles.adversaryPreviewName}>{npc.name || "Unnamed NPC"}</h3>
      <p className={adversaryStyles.adversaryPreviewTier}>
        {[npc.tier ? `Tier ${npc.tier}` : null, npc.role].filter(Boolean).join(" / ") || "No role set"}
      </p>
      <p className={adversaryStyles.adversaryPreviewDescription}>{npc.description || "No description added."}</p>
      <p>
        <strong>HP:</strong> {npc.hit_points ?? "-"} | <strong>Stress:</strong> {npc.stress ?? "-"}
      </p>
      <p>
        <strong>ATK:</strong> {npc.attack_modifier ?? "-"} | {npc.attack_name ?? "Attack"}: {npc.attack_range ?? "-"} |{" "}
        {npc.attack_damage ?? "-"}
      </p>
      <p>
        <strong>Experience:</strong>{" "}
        {npc.experiences_list.length > 0
          ? npc.experiences_list.map((entry) => `${entry.name} ${entry.modifier >= 0 ? "+" : ""}${entry.modifier}`).join(", ")
          : "None"}
      </p>
      {npc.notes ? (
        <p className={adversaryStyles.adversaryPreviewNotes}>
          <strong>Notes:</strong> {npc.notes}
        </p>
      ) : null}
    </article>
  );
}

export function NpcForm({ onSaved }: NpcFormProps) {
  const [status, setStatus] = useState("Ready to create a new NPC.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([{ name: "", modifier: 2 }]);
  const [featureGroups, setFeatureGroups] = useState<FeatureGroupState>(() => createInitialFeatures());
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);

  const previewPayload = useMemo(() => buildPayload(formState, experiences, featureGroups), [formState, experiences, featureGroups]);

  function updateField<K extends keyof typeof INITIAL_FORM_STATE>(field: K, value: (typeof INITIAL_FORM_STATE)[K]) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function updateExperience(index: number, nextValue: Partial<ExperienceEntry>) {
    setExperiences((current) =>
      current.map((entry, currentIndex) => (currentIndex === index ? { ...entry, ...nextValue } : entry)),
    );
  }

  function addExperience() {
    setExperiences((current) => [...current, { name: "", modifier: 2 }]);
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
      const nextEntries = (current[group] ?? []).filter((entry) => entry.id !== entryId);
      return {
        ...current,
        [group]: nextEntries.length ? nextEntries : [createFeatureEntry()],
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setStatus("Saving...");

    try {
      const saved = await createNpc(buildPayload(formState, experiences, featureGroups));
      setStatus(`Saved ${saved.name}.`);
      setFormState(INITIAL_FORM_STATE);
      setExperiences([{ name: "", modifier: 2 }]);
      setFeatureGroups(createInitialFeatures());
      onSaved(saved);
    } catch {
      setStatus("NPC save failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">NPC Builder</p>
          <h2>Sketch a supporting character</h2>
        </div>
        <p className="status" aria-live="polite">
          {status}
        </p>
      </div>

      <div className={adversaryStyles.adversaryBuilderLayout}>
        <form className={formStyles.formGrid} onSubmit={handleSubmit}>
          <label>
            Name
            <input name="name" placeholder="Mira of the Lantern Road" value={formState.name} onChange={(event) => updateField("name", event.target.value)} />
          </label>

          <label>
            Tier
            <input name="tier" type="number" min="1" max="4" value={formState.tier} onChange={(event) => updateField("tier", event.target.value)} />
          </label>

          <label>
            Role
            <input name="role" placeholder="Guide, merchant, rival" value={formState.role} onChange={(event) => updateField("role", event.target.value)} />
          </label>

          <label>
            Difficulty
            <input name="difficulty" type="number" value={formState.difficulty} onChange={(event) => updateField("difficulty", event.target.value)} />
          </label>

          <label className={formStyles.wide}>
            Description
            <textarea rows={2} value={formState.description} onChange={(event) => updateField("description", event.target.value)} />
          </label>

          <label>
            Motives
            <input value={formState.motives} onChange={(event) => updateField("motives", event.target.value)} />
          </label>

          <label>
            Tactics
            <input value={formState.tactics} onChange={(event) => updateField("tactics", event.target.value)} />
          </label>

          <label>
            Major Threshold
            <input type="number" min="0" value={formState.thresholds_major} onChange={(event) => updateField("thresholds_major", event.target.value)} />
          </label>

          <label>
            Severe Threshold
            <input type="number" min="0" value={formState.thresholds_severe} onChange={(event) => updateField("thresholds_severe", event.target.value)} />
          </label>

          <label>
            Hit Points
            <input type="number" min="0" value={formState.hit_points} onChange={(event) => updateField("hit_points", event.target.value)} />
          </label>

          <label>
            Stress
            <input type="number" min="0" value={formState.stress} onChange={(event) => updateField("stress", event.target.value)} />
          </label>

          <label>
            Attack Name
            <input value={formState.attack_name} onChange={(event) => updateField("attack_name", event.target.value)} />
          </label>

          <label>
            Attack Range
            <input value={formState.attack_range} onChange={(event) => updateField("attack_range", event.target.value)} />
          </label>

          <label>
            Attack Damage
            <input value={formState.attack_damage} onChange={(event) => updateField("attack_damage", event.target.value)} />
          </label>

          <label>
            Attack Modifier
            <input type="number" value={formState.attack_modifier} onChange={(event) => updateField("attack_modifier", event.target.value)} />
          </label>

          <div className={`${formStyles.wide} ${adversaryStyles.structuredGroup}`}>
            <div className={adversaryStyles.structuredHeader}>
              <div>
                <p className="eyebrow">Experiences</p>
                <h3>Optional List</h3>
              </div>
              <button className="secondary-button" type="button" onClick={addExperience}>
                Add Experience
              </button>
            </div>
            <div className={adversaryStyles.experienceList}>
              {experiences.map((experience, index) => (
                <div key={`npc-experience-${index}`} className={adversaryStyles.experienceRow}>
                  <input placeholder="Court Gossip" value={experience.name} onChange={(event) => updateExperience(index, { name: event.target.value })} />
                  <input type="number" value={experience.modifier} onChange={(event) => updateExperience(index, { modifier: Number(event.target.value) || 0 })} />
                  <button className="secondary-button" type="button" onClick={() => removeExperience(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {Object.entries(FEATURE_GROUP_LABELS).map(([groupKey, label]) => (
            <div key={groupKey} className={`${formStyles.wide} ${adversaryStyles.structuredGroup}`}>
              <div className={adversaryStyles.structuredHeader}>
                <div>
                  <p className="eyebrow">Features</p>
                  <h3>{label}</h3>
                </div>
                <button className="secondary-button" type="button" onClick={() => addFeatureEntry(groupKey)}>
                  Add {label}
                </button>
              </div>
              <div className={adversaryStyles.featureEntryList}>
                {(featureGroups[groupKey] ?? []).map((entry, index) => (
                  <div key={entry.id} className={adversaryStyles.featureEntryCard}>
                    <label>
                      {label} {index + 1}
                      <textarea rows={3} value={entry.text} onChange={(event) => updateFeatureEntry(groupKey, entry.id, event.target.value)} />
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
            <textarea rows={3} value={formState.notes} onChange={(event) => updateField("notes", event.target.value)} />
          </label>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save NPC"}
          </button>
        </form>

        <NpcPreview npc={previewPayload} />
      </div>
    </section>
  );
}
