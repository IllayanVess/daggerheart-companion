// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import { Suspense, lazy } from "react";

import { APP_ROUTES, type AppRoute } from "./app/routes";
import { useHashRoute } from "./app/useHashRoute";

const HomePage = lazy(() => import("./pages/HomePage"));
const CharacterRosterPage = lazy(() => import("./pages/CharacterRosterPage"));
const CharacterBuilderPage = lazy(() => import("./pages/CharacterBuilderPage"));
const GMToolsHubPage = lazy(() => import("./pages/GMToolsHubPage"));
const GMAdversariesPage = lazy(() => import("./pages/GMAdversariesPage"));
const GMNPCsPage = lazy(() => import("./pages/GMNPCsPage"));
const GMEnvironmentsPage = lazy(() => import("./pages/GMEnvironmentsPage"));
const GMDicePage = lazy(() => import("./pages/GMDicePage"));
const GMSessionTrackerPage = lazy(() => import("./pages/GMSessionTrackerPage"));
const GMEncounterBoardPage = lazy(() => import("./pages/GMEncounterBoardPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));

function LoadingScreen() {
  return (
    <main className="app-shell">
      <section className="panel loading-panel">
        <p className="eyebrow">Loading</p>
        <h2>Preparing the next page.</h2>
      </section>
    </main>
  );
}

function renderRoute(route: AppRoute) {
  switch (route) {
    case APP_ROUTES.home:
      return <HomePage />;
    case APP_ROUTES.characters:
      return <CharacterRosterPage />;
    case APP_ROUTES.builder:
      return <CharacterBuilderPage />;
    case APP_ROUTES.legal:
      return <LegalPage />;
    case APP_ROUTES.gmHub:
      return <GMToolsHubPage />;
    case APP_ROUTES.gmAdversaries:
      return <GMAdversariesPage />;
    case APP_ROUTES.gmNpcs:
      return <GMNPCsPage />;
    case APP_ROUTES.gmEnvironments:
      return <GMEnvironmentsPage />;
    case APP_ROUTES.gmDice:
      return <GMDicePage />;
    case APP_ROUTES.gmSessionTracker:
      return <GMSessionTrackerPage />;
    case APP_ROUTES.gmEncounterBoard:
      return <GMEncounterBoardPage />;
    default:
      return <HomePage />;
  }
}

function App() {
  const route = useHashRoute();

  return (
    <>
      <Suspense fallback={<LoadingScreen />}>{renderRoute(route)}</Suspense>
      {/* DPCGL compliance: show persistent attribution and a legal-page link on every route. */}
      <footer className="legal-footer" aria-label="DPCGL attribution">
        <span>
          Built using the Daggerheart SRD under the DPCGL. Not affiliated with Darrington Press or Critical Role.
          &apos;Daggerheart&apos; is a trademark of Darrington Press LLC.
        </span>
        <a href={`#${APP_ROUTES.legal}`}>Legal</a>
      </footer>
    </>
  );
}

export default App;
