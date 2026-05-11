// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import type { ReactNode } from "react";

import { navigateTo, type AppRoute } from "../../app/routes";
import styles from "./PageHero.module.css";

type Breadcrumb = {
  label: string;
  route?: AppRoute;
};

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
};

export function PageHero({ eyebrow, title, description, breadcrumbs = [], actions }: PageHeroProps) {
  return (
    <section className={styles.hero}>
      {breadcrumbs.length ? (
        <div className={styles.breadcrumbs}>
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`}>
              {crumb.route ? (
                <button className={styles.linkButton} onClick={() => navigateTo(crumb.route!)} type="button">
                  {crumb.label}
                </button>
              ) : (
                crumb.label
              )}
              {index < breadcrumbs.length - 1 ? " / " : ""}
            </span>
          ))}
        </div>
      ) : null}

      <div className={styles.heroContent}>
        <div className={styles.heroCopy}>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {actions ? <div className={styles.actionRow}>{actions}</div> : null}
      </div>
    </section>
  );
}
