import { Suspense, lazy, useEffect, useState } from "react";

import { APP_ROUTES } from "../app/routes";
import { EnvironmentLibraryCard } from "../components/GM/EnvironmentLibraryCard";
import { PageHero } from "../components/Layout/PageHero";
import { fetchEnvironments, updateEnvironment } from "../services/api";
import type { Environment, EnvironmentUpsertPayload } from "../types";

const EnvironmentForm = lazy(() =>
  import("../components/EnvironmentForm/EnvironmentForm").then((module) => ({ default: module.EnvironmentForm })),
);

export default function GMEnvironmentsPage() {
  const [environments, setEnvironments] = useState<Environment[]>([]);

  useEffect(() => {
    fetchEnvironments().then(setEnvironments).catch(() => undefined);
  }, []);

  async function handleEnvironmentImageUpload(environment: Environment, file: File) {
    const environmentImage = await readFileAsDataUrl(file);
    const payload: EnvironmentUpsertPayload = {
      name: environment.name,
      tier: environment.tier,
      environment_type: environment.environment_type,
      description: environment.description,
      impulses: environment.impulses,
      difficulty: environment.difficulty,
      potential_adversaries: environment.potential_adversaries,
      features: environment.features,
      notes: environment.notes,
      data_json: {
        ...environment.data_json,
        environment_image: environmentImage,
      },
    };
    const updatedEnvironment = await updateEnvironment(environment.id, payload);
    setEnvironments((current) =>
      current.map((entry) => (entry.id === updatedEnvironment.id ? updatedEnvironment : entry)),
    );
  }

  return (
    <main className="app-shell">
      <PageHero
        eyebrow="GM Tools"
        title="Environments"
        description="Saved environments now stay compact: name, description, and an art placeholder for the rest."
        breadcrumbs={[
          { label: "Home", route: APP_ROUTES.home },
          { label: "GM Tools", route: APP_ROUTES.gmHub },
          { label: "Environments" },
        ]}
      />

      <section className="content-grid">
        <Suspense fallback={<section className="panel loading-panel">Loading environment builder...</section>}>
          <EnvironmentForm onSaved={(environment) => setEnvironments((current) => [environment, ...current])} />
        </Suspense>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Saved Environments</p>
              <h2>Scene Library</h2>
            </div>
            <span className="pill">{environments.length}</span>
          </div>

          <div className="card-list">
            {environments.map((environment) => (
              <EnvironmentLibraryCard
                key={environment.id}
                environment={environment}
                onUploadImage={handleEnvironmentImageUpload}
              />
            ))}
            {environments.length === 0 ? <p className="empty-state">No saved environments yet.</p> : null}
          </div>
        </section>
      </section>
    </main>
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
