import { Suspense, lazy, useEffect, useState } from "react";

import { APP_ROUTES } from "../app/routes";
import { PageHero } from "../components/Layout/PageHero";
import { fetchNpcs } from "../services/api";
import type { NPC } from "../types";

const NpcForm = lazy(() => import("../components/NpcForm/NpcForm").then((module) => ({ default: module.NpcForm })));

export default function GMNPCsPage() {
  const [npcs, setNpcs] = useState<NPC[]>([]);

  useEffect(() => {
    fetchNpcs().then(setNpcs).catch(() => undefined);
  }, []);

  return (
    <main className="app-shell">
      <PageHero
        eyebrow="GM Tools"
        title="NPCs"
        description="Build optional non-adversary characters for scenes and the encounter board."
        breadcrumbs={[
          { label: "Home", route: APP_ROUTES.home },
          { label: "GM Tools", route: APP_ROUTES.gmHub },
          { label: "NPCs" },
        ]}
      />

      <section className="content-grid">
        <Suspense fallback={<section className="panel loading-panel">Loading NPC builder...</section>}>
          <NpcForm onSaved={(npc) => setNpcs((current) => [npc, ...current])} />
        </Suspense>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Saved NPCs</p>
              <h2>People Library</h2>
            </div>
            <span className="pill">{npcs.length}</span>
          </div>

          <div className="card-list">
            {npcs.map((npc) => (
              <article key={npc.id} className="detail-card">
                <h3>{npc.name}</h3>
                <p className="muted">{[npc.tier ? `Tier ${npc.tier}` : null, npc.role].filter(Boolean).join(" / ") || "No role set"}</p>
                {npc.description ? <p>{npc.description}</p> : null}
                <p className="muted">
                  HP {npc.hit_points ?? "-"} / Stress {npc.stress ?? "-"}
                </p>
              </article>
            ))}
            {npcs.length === 0 ? <p className="empty-state">No saved NPCs yet.</p> : null}
          </div>
        </section>
      </section>
    </main>
  );
}
