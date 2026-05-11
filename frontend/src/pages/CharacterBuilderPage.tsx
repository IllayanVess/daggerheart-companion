// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import { Suspense, lazy } from "react";

import { APP_ROUTES, navigateTo } from "../app/routes";
import { PageHero } from "../components/Layout/PageHero";

const CharacterForm = lazy(() =>
  import("../components/CharacterForm/CharacterForm").then((module) => ({ default: module.CharacterForm })),
);

export default function CharacterBuilderPage() {
  return (
    <main className="app-shell">
      <PageHero
        eyebrow="Character Builder"
        title="Build one hero at a time."
        description="This route loads the full builder only when you need it, keeping the creation flow isolated and easier to use on smaller screens."
        breadcrumbs={[
          { label: "Home", route: APP_ROUTES.home },
          { label: "Create Character" },
        ]}
      />

      <section className="builder-page">
        <Suspense fallback={<section className="panel loading-panel">Loading builder...</section>}>
          <CharacterForm focusMode onSaved={() => navigateTo(APP_ROUTES.characters)} />
        </Suspense>
      </section>
    </main>
  );
}
