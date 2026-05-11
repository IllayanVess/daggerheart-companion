// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import { ChangeEvent, FormEvent, useState } from "react";

import { createEnvironment } from "../../services/api";
import type { Environment, EnvironmentUpsertPayload } from "../../types";
import formStyles from "../../styles/forms.module.css";
import styles from "./EnvironmentForm.module.css";

type EnvironmentFormProps = {
  onSaved: (environment: Environment) => void;
};

export function EnvironmentForm({ onSaved }: EnvironmentFormProps) {
  const [status, setStatus] = useState("Ready to create a new environment.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  const buildPayload = (formData: FormData): EnvironmentUpsertPayload => {
    const getString = (key: string): string => String(formData.get(key) ?? "");
    const getNumber = (key: string): number | null => {
      const rawValue = String(formData.get(key) ?? "").trim();
      if (!rawValue) {
        return null;
      }
      const value = Number(rawValue);
      return Number.isNaN(value) ? null : value;
    };

    return {
      name: getString("name").trim(),
      tier: getNumber("tier") ?? 1,
      environment_type: getString("environment_type").trim() || "Traversal",
      description: getString("description").trim() || null,
      impulses: getString("impulses").trim() || null,
      difficulty: getNumber("difficulty"),
      potential_adversaries: getString("potential_adversaries").trim() || null,
      features: getString("features").trim() || null,
      notes: getString("notes").trim() || null,
      data_json: imageDataUrl ? { environment_image: imageDataUrl } : {},
    };
  };

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setImageDataUrl(dataUrl);
    setStatus(`Loaded image "${file.name}". Save the environment to keep it.`);
    event.target.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    if (!name) {
      setStatus("Environment name is required.");
      return;
    }

    setIsSubmitting(true);
    setStatus("Saving...");

    try {
      const saved = await createEnvironment(buildPayload(formData));
      setStatus(`Saved ${saved.name}.`);
      event.currentTarget.reset();
      setImageDataUrl(null);
      onSaved(saved);
    } catch (error) {
      console.error("Environment submission error:", error);
      setStatus("Environment save failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Environment Builder</p>
          <h2>Build a scene</h2>
        </div>
        <p className="status" aria-live="polite">
          {status}
        </p>
      </div>

      <form className={formStyles.formGrid} onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" placeholder="Raging River" required />
        </label>

        <label>
          Tier
          <input name="tier" type="number" min="1" defaultValue="1" />
        </label>

        <label>
          Type
          <input name="environment_type" defaultValue="Traversal" placeholder="Traversal, Exploration, Social, Event" />
        </label>

        <label>
          Difficulty
          <input name="difficulty" type="number" min="0" placeholder="10" />
        </label>

        <label className={formStyles.wide}>
          Description
          <textarea name="description" rows={2} placeholder="One-line summary of the environment." />
        </label>

        <label className={formStyles.wide}>
          Environment Image
          <input accept="image/*" type="file" onChange={handleImageChange} />
          <span className={`muted ${styles.imageNote}`}>
            {imageDataUrl ? "Image ready to save with this environment." : "Optional: pick an image to store on the environment record."}
          </span>
        </label>

        <label className={formStyles.wide}>
          Impulses
          <input name="impulses" placeholder="Bar crossing, carry away the unready, divide the land" />
        </label>

        <label className={formStyles.wide}>
          Potential Adversaries
          <textarea name="potential_adversaries" rows={2} placeholder="Glass Snake, Jagged Knife Bandits..." />
        </label>

        <label className={formStyles.wide}>
          Features
          <textarea
            name="features"
            rows={4}
            placeholder="Dangerous Crossing - Passive: ...&#10;Undertow - Action: ..."
          />
        </label>

        <label className={formStyles.wide}>
          Notes
          <textarea name="notes" rows={3} placeholder="Scene prompts, countdown ideas, or campaign notes." />
        </label>

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Environment"}
        </button>
      </form>
    </section>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}
