// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import { APP_ROUTES } from "../app/routes";
import { PageHero } from "../components/Layout/PageHero";

export default function LegalPage() {
  return (
    <main className="app-shell legal-page">
      <PageHero
        eyebrow="Legal"
        title="License and Attribution"
        description="Required DPCGL notices for the Daggerheart SRD material referenced by this app."
        breadcrumbs={[{ label: "Home", route: APP_ROUTES.home }, { label: "Legal" }]}
      />

      {/* DPCGL compliance: required attribution statement displayed in-app. */}
      <section className="panel legal-section" aria-labelledby="required-attribution">
        <h2 id="required-attribution">Required Attribution</h2>
        <p>
          This product includes materials from the Daggerheart System Reference Document 1.0, © Critical Role,
          LLC., used under the Darrington Press Community Gaming License. This app is not affiliated with
          Darrington Press or Critical Role.
        </p>
      </section>

      {/* DPCGL compliance: visible trademark notice for compatibility-only usage. */}
      <section className="panel legal-section" aria-labelledby="trademark-notice">
        <h2 id="trademark-notice">Trademark Notice</h2>
        <p>
          &quot;Daggerheart&quot; is a trademark of Darrington Press LLC. This app&apos;s name is used solely to
          indicate compatibility with the Daggerheart system and does not imply any affiliation or endorsement.
        </p>
      </section>

      {/* DPCGL compliance: user-facing summary plus links to the full license and SRD source. */}
      <section className="panel legal-section" aria-labelledby="license-summary">
        <h2 id="license-summary">License Summary</h2>
        <ul className="legal-list">
          <li>You may use this app freely for personal or group tabletop play.</li>
          <li>You may share session notes, characters, and homebrew created with this app.</li>
          <li>You may not republish the SRD rules contained here as your own original work.</li>
          <li>You may not use this app to distribute official Daggerheart artwork, maps, or lore.</li>
          <li>
            Full license: <a href="https://darringtonpress.com/license/">https://darringtonpress.com/license/</a>
          </li>
          <li>
            SRD source: <a href="https://daggerheartsrd.com/">https://daggerheartsrd.com/</a>
          </li>
        </ul>
      </section>
    </main>
  );
}
