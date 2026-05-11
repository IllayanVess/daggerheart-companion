// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import { navigateTo, type AppRoute } from "../../app/routes";
import styles from "./ActionCardGrid.module.css";

type ActionCard = {
  eyebrow: string;
  title: string;
  description: string;
  route: AppRoute;
};

type ActionCardGridProps = {
  cards: ActionCard[];
};

export function ActionCardGrid({ cards }: ActionCardGridProps) {
  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <button key={card.route} className={styles.card} onClick={() => navigateTo(card.route)} type="button">
          <span className="eyebrow">{card.eyebrow}</span>
          <strong>{card.title}</strong>
          <span className={styles.meta}>{card.description}</span>
        </button>
      ))}
    </div>
  );
}
