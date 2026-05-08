import { useState } from "react";

import { APP_ROUTES } from "../app/routes";
import { DiceRoller } from "../components/DiceRoller/DiceRoller";
import { EncounterBoard } from "../components/EncounterBoard/EncounterBoard";
import { PageHero } from "../components/Layout/PageHero";
import styles from "./GMEncounterBoardPage.module.css";

export default function GMEncounterBoardPage() {
  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState(false);

  return (
    <main className={`app-shell ${styles.encounterBoardPage}`}>
      <PageHero
        eyebrow="GM Tools"
        title="Encounter Board"
        description="Place PCs, adversaries, NPCs, objects, and environments on a persistent tactical scene board."
        breadcrumbs={[
          { label: "Home", route: APP_ROUTES.home },
          { label: "GM Tools", route: APP_ROUTES.gmHub },
          { label: "Encounter Board" },
        ]}
        actions={
          <button className="secondary-button" onClick={() => setIsDiceRollerOpen(true)} type="button">
            Open Dice Roller
          </button>
        }
      />

      <EncounterBoard
        headerAction={
          <button className="secondary-button" onClick={() => setIsDiceRollerOpen(true)} type="button">
            Dice Roller
          </button>
        }
      />

      {isDiceRollerOpen ? (
        <div className={styles.dicePopupBackdrop} role="presentation" onMouseDown={() => setIsDiceRollerOpen(false)}>
          <div className={styles.dicePopup} role="dialog" aria-modal="true" aria-label="Dice roller" onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.dicePopupHeader}>
              <strong>Dice Roller</strong>
              <button type="button" onClick={() => setIsDiceRollerOpen(false)}>
                Close
              </button>
            </div>
            <DiceRoller />
          </div>
        </div>
      ) : null}
    </main>
  );
}
