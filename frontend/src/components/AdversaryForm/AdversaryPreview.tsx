// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import type { Adversary } from "../../types";
import styles from "./AdversaryForm.module.css";

type AdversaryPreviewProps = {
  adversary: Omit<Adversary, "id" | "created_at" | "updated_at">;
};

function renderFeatureBlock(label: string, values: string[]) {
  if (values.length === 0) {
    return null;
  }

  return (
    <div>
      <strong>{label}</strong>
      {values.map((value, index) => (
        <p key={`${label}-${index}`}>{value}</p>
      ))}
    </div>
  );
}

export function AdversaryPreview({ adversary }: AdversaryPreviewProps) {
  const featureGroups = adversary.feature_groups ?? {};
  const passiveFeatures = featureGroups.passive ?? (adversary.passive_features ? adversary.passive_features.split(/\n{2,}/) : []);
  const actionFeatures = featureGroups.action ?? (adversary.action_features ? adversary.action_features.split(/\n{2,}/) : []);
  const reactionFeatures = featureGroups.reaction ?? (adversary.reaction_features ? adversary.reaction_features.split(/\n{2,}/) : []);
  const fearFeatures = featureGroups.fear ?? (adversary.fear_features ? adversary.fear_features.split(/\n{2,}/) : []);

  return (
    <article className={styles.adversaryPreviewCard}>
      <p className="eyebrow">Preview</p>
      <h3 className={styles.adversaryPreviewName}>{adversary.name || "Unnamed Adversary"}</h3>
      <p className={styles.adversaryPreviewTier}>
        Tier {adversary.tier} {adversary.role ?? "Standard"}
      </p>
      <p className={styles.adversaryPreviewDescription}>
        {adversary.description?.trim() || "No description added."}
      </p>
      <p>
        <strong>Motives & Tactics:</strong>{" "}
        {[adversary.motives, adversary.tactics].filter(Boolean).join(", ") || "Not set"}
      </p>
      <p>
        <strong>Difficulty:</strong> {adversary.difficulty ?? "-"} | <strong>Thresholds:</strong>{" "}
        {adversary.thresholds_major ?? "-"} / {adversary.thresholds_severe ?? "-"} | <strong>HP:</strong>{" "}
        {adversary.hit_points ?? "-"} | <strong>Stress:</strong> {adversary.stress ?? "-"}
      </p>
      <p>
        <strong>ATK:</strong> {adversary.attack_modifier ?? "-"} | {adversary.attack_name ?? "Attack"}:{" "}
        {adversary.attack_range ?? "-"} | {adversary.attack_damage ?? "-"}
      </p>
      <p>
        <strong>Experience:</strong>{" "}
        {adversary.experiences_list.length > 0
          ? adversary.experiences_list.map((entry) => `${entry.name} ${entry.modifier >= 0 ? "+" : ""}${entry.modifier}`).join(", ")
          : "None"}
      </p>
      <div className={styles.adversaryPreviewFeatures}>
        <p className={styles.adversaryPreviewSectionTitle}>FEATURES</p>
        {renderFeatureBlock("Passive", passiveFeatures)}
        {renderFeatureBlock("Action", actionFeatures)}
        {renderFeatureBlock("Reaction", reactionFeatures)}
        {renderFeatureBlock("Fear", fearFeatures)}
        {Object.values(featureGroups).every((entries) => entries.length === 0) &&
        passiveFeatures.length === 0 &&
        actionFeatures.length === 0 &&
        reactionFeatures.length === 0 &&
        fearFeatures.length === 0 ? (
          <p>No features added yet.</p>
        ) : null}
      </div>
      {adversary.notes?.trim() ? (
        <p className={styles.adversaryPreviewNotes}>
          <strong>Notes:</strong> {adversary.notes}
        </p>
      ) : null}
    </article>
  );
}
