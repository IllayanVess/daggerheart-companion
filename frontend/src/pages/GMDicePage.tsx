import { Suspense, lazy } from "react";

import { APP_ROUTES } from "../app/routes";
import { PageHero } from "../components/Layout/PageHero";

const DiceRoller = lazy(() =>
  import("../components/DiceRoller/DiceRoller").then((module) => ({ default: module.DiceRoller })),
);

export default function GMDicePage() {
  return (
    <main className="app-shell">
      <PageHero
        eyebrow="GM Tools"
        title="Dice Roller"
        description="The roller is isolated on its own route so the quick formulas, results, and history all stay visible together."
        breadcrumbs={[
          { label: "Home", route: APP_ROUTES.home },
          { label: "GM Tools", route: APP_ROUTES.gmHub },
          { label: "Dice Roller" },
        ]}
      />

      <section className="single-tool-page">
        <Suspense fallback={<section className="panel loading-panel">Loading roller...</section>}>
          <DiceRoller />
        </Suspense>
      </section>
    </main>
  );
}
