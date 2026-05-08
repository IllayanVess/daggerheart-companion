import styles from "./HomePage.module.css";

import { APP_ROUTES } from "../app/routes";
import { ActionCardGrid } from "../components/Navigation/ActionCardGrid";

const HOME_CARDS = [
  {
    eyebrow: "Roster",
    title: "My Characters",
    description: "Browse saved heroes, then open the full interactive sheet on its own page.",
    route: APP_ROUTES.characters,
  },
  {
    eyebrow: "Builder",
    title: "Create Character",
    description: "Step through the official creation flow without the rest of the app competing for space.",
    route: APP_ROUTES.builder,
  },
  {
    eyebrow: "GM",
    title: "GM Tools",
    description: "Open adversaries, environments, dice, and the new session tracker as separate tools.",
    route: APP_ROUTES.gmHub,
  },
] as const;

export default function HomePage() {
  return (
    <main className="app-shell">
      <section className={styles.homeHero}>
        <div className={styles.homeHeroCopy}>
          <p className="eyebrow">Daggerheart Companion</p>
          <h1>Choose the next page, not the next panel.</h1>
          <p className={styles.homeHeroLead}>
            The app is now organized around route-based pages so the builder, roster, and GM tools
            each load when you need them and stay focused once opened.
          </p>
        </div>
        <ActionCardGrid cards={[...HOME_CARDS]} />
      </section>
    </main>
  );
}
