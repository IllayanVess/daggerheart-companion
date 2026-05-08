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
