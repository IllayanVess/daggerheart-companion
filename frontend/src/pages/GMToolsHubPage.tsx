// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import { APP_ROUTES } from "../app/routes";
import { PageHero } from "../components/Layout/PageHero";
import { ActionCardGrid } from "../components/Navigation/ActionCardGrid";

const GM_CARDS = [
  {
    eyebrow: "GM",
    title: "Adversaries",
    description: "Create threats and browse the saved library on a page dedicated to encounters.",
    route: APP_ROUTES.gmAdversaries,
  },
  {
    eyebrow: "GM",
    title: "NPCs",
    description: "Sketch optional supporting characters for the encounter board without mixing them into adversaries.",
    route: APP_ROUTES.gmNpcs,
  },
  {
    eyebrow: "GM",
    title: "Environments",
    description: "Build scenes and keep the environment library lightweight and readable.",
    route: APP_ROUTES.gmEnvironments,
  },
  {
    eyebrow: "GM",
    title: "Dice Roller",
    description: "Open the roller by itself so the formula tools and history have room to breathe.",
    route: APP_ROUTES.gmDice,
  },
  {
    eyebrow: "GM",
    title: "Encounter Board",
    description: "Run a persistent tactical scene with creature tokens, object badges, environments, and quick dice.",
    route: APP_ROUTES.gmEncounterBoard,
  },
  {
    eyebrow: "GM",
    title: "Session Tracker",
    description: "Run live sessions with separate stacks for PCs, adversaries, and environments.",
    route: APP_ROUTES.gmSessionTracker,
  },
] as const;

export default function GMToolsHubPage() {
  return (
    <main className="app-shell">
      <PageHero
        eyebrow="GM Tools"
        title="Open the tool you need."
        description="Each GM tool now lives on its own route so the app avoids loading or rendering the full toolkit all at once."
        breadcrumbs={[
          { label: "Home", route: APP_ROUTES.home },
          { label: "GM Tools" },
        ]}
      />
      <ActionCardGrid cards={[...GM_CARDS]} />
    </main>
  );
}
