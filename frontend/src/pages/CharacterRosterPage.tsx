// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import { Suspense, lazy, useEffect, useRef, useState } from "react";

import { APP_ROUTES, navigateTo } from "../app/routes";
import { CharacterRosterCard } from "../components/Characters/CharacterRosterCard";
import { PageHero } from "../components/Layout/PageHero";
import { fetchCharacters } from "../services/api";
import type { Character } from "../types";

const CharacterSheet = lazy(() =>
  import("../components/CharacterSheet/CharacterSheet").then((module) => ({ default: module.CharacterSheet })),
);

export default function CharacterRosterPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
  const sheetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    fetchCharacters().then(setCharacters).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (selectedCharacterId && sheetRef.current) {
      sheetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedCharacterId]);

  const selectedCharacter = characters.find((character) => character.id === selectedCharacterId) ?? null;

  return (
    <main className="app-shell">
      <PageHero
        eyebrow="Character Roster"
        title={selectedCharacter ? selectedCharacter.name : "My Characters"}
        description={
          selectedCharacter
            ? "The full sheet is lazy-loaded only when you open a hero."
            : "Review saved heroes, then jump into a sheet when you want the deeper management tools."
        }
        breadcrumbs={[
          { label: "Home", route: APP_ROUTES.home },
          { label: "My Characters" },
        ]}
        actions={
          selectedCharacter ? (
            <button className="secondary-button" onClick={() => setSelectedCharacterId(null)} type="button">
              Return To Roster
            </button>
          ) : (
            <button className="secondary-button" onClick={() => navigateTo(APP_ROUTES.builder)} type="button">
              Create Character
            </button>
          )
        }
      />

      {selectedCharacter ? (
        <section className="sheet-view-page">
          <Suspense fallback={<section className="panel loading-panel">Loading sheet...</section>}>
            <CharacterSheet
              character={selectedCharacter}
              sheetRef={sheetRef}
              onUpdated={(updatedCharacter) =>
                setCharacters((current) =>
                  current.map((character) => (character.id === updatedCharacter.id ? updatedCharacter : character)),
                )
              }
            />
          </Suspense>
        </section>
      ) : (
        <section className="panel roster-page">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Saved Characters</p>
              <h2>Roster</h2>
            </div>
            <span className="pill">{characters.length}</span>
          </div>
          <div className="card-list">
            {characters.map((character) => (
              <CharacterRosterCard key={character.id} character={character} onOpen={setSelectedCharacterId} />
            ))}
            {characters.length === 0 ? <p className="empty-state">No saved characters yet.</p> : null}
          </div>
        </section>
      )}
    </main>
  );
}
