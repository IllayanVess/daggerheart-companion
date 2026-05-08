import { Suspense, lazy, useEffect, useState } from "react";

import { APP_ROUTES } from "../app/routes";
import { AdversaryPreview } from "../components/AdversaryForm/AdversaryPreview";
import { PageHero } from "../components/Layout/PageHero";
import { fetchAdversaries } from "../services/api";
import type { Adversary } from "../types";

const AdversaryForm = lazy(() =>
  import("../components/AdversaryForm/AdversaryForm").then((module) => ({ default: module.AdversaryForm })),
);

export default function GMAdversariesPage() {
  const [adversaries, setAdversaries] = useState<Adversary[]>([]);

  useEffect(() => {
    fetchAdversaries().then(setAdversaries).catch(() => undefined);
  }, []);

  return (
    <main className="app-shell">
      <PageHero
        eyebrow="GM Tools"
        title="Adversaries"
        description="Build threats here, then browse the saved library without the dice roller and environments crowding the same screen."
        breadcrumbs={[
          { label: "Home", route: APP_ROUTES.home },
          { label: "GM Tools", route: APP_ROUTES.gmHub },
          { label: "Adversaries" },
        ]}
      />

      <section className="content-grid">
        <Suspense fallback={<section className="panel loading-panel">Loading adversary builder...</section>}>
          <AdversaryForm onSaved={(adversary) => setAdversaries((current) => [adversary, ...current])} />
        </Suspense>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Saved Adversaries</p>
              <h2>Threat Library</h2>
            </div>
            <span className="pill">{adversaries.length}</span>
          </div>

          <div className="card-list">
            {adversaries.map((adversary) => (
              <AdversaryPreview key={adversary.id} adversary={adversary} />
            ))}
            {adversaries.length === 0 ? <p className="empty-state">No saved adversaries yet.</p> : null}
          </div>
        </section>
      </section>
    </main>
  );
}
