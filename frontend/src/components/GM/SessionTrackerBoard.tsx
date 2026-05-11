// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import { useState } from "react";

import { clampTracker } from "../../utils/characterUtils";
import type { Adversary, Character, Environment } from "../../types";
import styles from "./SessionTrackerBoard.module.css";

type TrackerCardBase = {
  id: string;
  name: string;
};

type SessionCharacter = TrackerCardBase & {
  type: "pc";
  subtitle: string;
  hp: number;
  maxHp: number;
  stress: number;
  maxStress: number;
  armorSlots: number;
};

type SessionAdversary = TrackerCardBase & {
  type: "adversary";
  subtitle: string;
  hp: number;
  stress: number;
};

type SessionEnvironment = TrackerCardBase & {
  type: "environment";
  description: string;
  imageUrl: string;
};

export type SessionTrackerState = {
  fear: number;
  pcs: SessionCharacter[];
  adversaries: SessionAdversary[];
  environments: SessionEnvironment[];
};

type SessionTrackerBoardProps = {
  session: SessionTrackerState;
  characters: Character[];
  adversaries: Adversary[];
  environments: Environment[];
  onAddCharacter: (character: Character) => void;
  onAddAdversary: (adversary: Adversary) => void;
  onAddEnvironment: (environment: Environment) => void;
  onRemove: (type: "pcs" | "adversaries" | "environments", id: string) => void;
  onUpdateFear: (fear: number) => void;
  onUpdateCharacter: (id: string, updates: Partial<SessionCharacter>) => void;
  onUpdateAdversary: (id: string, updates: Partial<SessionAdversary>) => void;
};

function renderTracker(max: number, current: number, onToggle: (index: number) => void) {
  return (
    <div className={styles.trackerRow}>
      {Array.from({ length: max }, (_, index) => {
        return (
          <button
            key={`${max}-${index}`}
            className={`${styles.trackerDot} ${index < current ? styles.trackerDotActive : ""}`}
            onClick={() => onToggle(index)}
            type="button"
          />
        );
      })}
    </div>
  );
}

function getNextMarkedValue(currentValue: number, index: number) {
  return index < currentValue ? index : index + 1;
}

function truncateAtColon(name: string): { short: string; full: string } {
  const colonIndex = name.indexOf(":");
  if (colonIndex === -1) return { short: name, full: name };
  return { short: name.slice(0, colonIndex).trim(), full: name };
}

export function SessionTrackerBoard({
  session,
  characters,
  adversaries,
  environments,
  onAddCharacter,
  onAddAdversary,
  onAddEnvironment,
  onRemove,
  onUpdateFear,
  onUpdateCharacter,
  onUpdateAdversary,
}: SessionTrackerBoardProps) {
  const [pcSearch, setPcSearch] = useState("");
  const [adversarySearch, setAdversarySearch] = useState("");
  const [environmentSearch, setEnvironmentSearch] = useState("");

  const filteredCharacters = characters
    .filter((c) => c.name.toLowerCase().includes(pcSearch.toLowerCase()))
    .slice(0, 3);

  const filteredAdversaries = adversaries
    .filter((a) => a.name.toLowerCase().includes(adversarySearch.toLowerCase()))
    .slice(0, 3);

  const filteredEnvironments = environments
    .filter((e) => e.name.toLowerCase().includes(environmentSearch.toLowerCase()))
    .slice(0, 3);

  return (
    <div className={styles.layout}>
      <div className={styles.board}>
        <section className={styles.fearSection}>
          <div className={styles.fearHeader}>
            <div>
              <p className="eyebrow">Session</p>
              <h3>Fear Tracker</h3>
            </div>
            <span className={styles.fearValue}>{session.fear}/12</span>
          </div>
          <p className="muted">Manual GM tracker. Fear climbs from 0 to 12.</p>
          {renderTracker(12, session.fear, (index) => onUpdateFear(getNextMarkedValue(session.fear, index)))}
        </section>

        <section className={`${styles.column} ${styles.pcColumn}`}>
          <div className={styles.columnHeader}>
            <div>
              <p className="eyebrow">Session</p>
              <h3>Player Characters</h3>
            </div>
            <span className="pill">{session.pcs.length}</span>
          </div>
          {session.pcs.length ? (
            session.pcs.map((pc) => (
              <article key={pc.id} className={styles.stackCard}>
                <div className={styles.stackCardHeader}>
                  <div>
                    <h3>{pc.name}</h3>
                    <p className="muted">{pc.subtitle}</p>
                  </div>
                  <button className={styles.removeButton} onClick={() => onRemove("pcs", pc.id)} type="button">
                    X
                  </button>
                </div>
                <div className={styles.trackerGroup}>
                  <label>
                    HP {pc.hp}/{pc.maxHp}
                  </label>
                  {renderTracker(pc.maxHp, clampTracker(pc.hp, pc.maxHp), (index) =>
                    onUpdateCharacter(pc.id, { hp: getNextMarkedValue(pc.hp, index) })
                  )}
                </div>
                <div className={styles.trackerGroup}>
                  <label>
                    Stress {pc.stress}/{pc.maxStress}
                  </label>
                  {renderTracker(pc.maxStress, clampTracker(pc.stress, pc.maxStress), (index) =>
                    onUpdateCharacter(pc.id, { stress: getNextMarkedValue(pc.stress, index) })
                  )}
                </div>
                <div className={styles.trackerGroup}>
                  <label>Armor Slots</label>
                  {renderTracker(6, pc.armorSlots, (index) =>
                    onUpdateCharacter(pc.id, { armorSlots: getNextMarkedValue(pc.armorSlots, index) })
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className={styles.emptyState}>Add saved PCs from the library to start tracking the party.</div>
          )}
        </section>

        <div className={styles.secondaryColumns}>
          <section className={styles.column}>
            <div className={styles.columnHeader}>
              <div>
                <p className="eyebrow">Session</p>
                <h3>Adversaries</h3>
              </div>
              <span className="pill">{session.adversaries.length}</span>
            </div>
            {session.adversaries.length ? (
              session.adversaries.map((adversary) => (
                <article key={adversary.id} className={styles.stackCard}>
                  <div className={styles.stackCardHeader}>
                    <div>
                      <h3>{adversary.name}</h3>
                      <p className="muted">{adversary.subtitle}</p>
                    </div>
                    <button
                      className={styles.removeButton}
                      onClick={() => onRemove("adversaries", adversary.id)}
                      type="button"
                    >
                      X
                    </button>
                  </div>
                  <div className={styles.trackerGroup}>
                    <label>HP</label>
                    {renderTracker(12, adversary.hp, (index) =>
                      onUpdateAdversary(adversary.id, { hp: getNextMarkedValue(adversary.hp, index) })
                    )}
                  </div>
                  <div className={styles.trackerGroup}>
                    <label>Stress</label>
                    {renderTracker(12, adversary.stress, (index) =>
                      onUpdateAdversary(adversary.id, { stress: getNextMarkedValue(adversary.stress, index) })
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className={styles.emptyState}>Drop in your active threats here for quick combat pacing.</div>
            )}
          </section>

          <section className={styles.column}>
            <div className={styles.columnHeader}>
              <div>
                <p className="eyebrow">Session</p>
                <h3>Environments</h3>
              </div>
              <span className="pill">{session.environments.length}</span>
            </div>
            {session.environments.length ? (
              session.environments.map((environment) => (
                <article key={environment.id} className={styles.stackCard}>
                  <div className={styles.stackCardHeader}>
                    <div>
                      <h3>{environment.name}</h3>
                    </div>
                    <button
                      className={styles.removeButton}
                      onClick={() => onRemove("environments", environment.id)}
                      type="button"
                    >
                      X
                    </button>
                  </div>
                  <p>{environment.description || "No description yet."}</p>
                  {environment.imageUrl ? (
                    <img alt={`${environment.name} scene art`} className={styles.environmentImage} src={environment.imageUrl} />
                  ) : (
                    <div className={styles.environmentArt}>Art Placeholder</div>
                  )}
                </article>
              ))
            ) : (
              <div className={styles.emptyState}>Pin scene cards here so the table always has the current location in view.</div>
            )}
          </section>
        </div>
      </div>

      <aside className={styles.library}>
        <section className={styles.librarySection}>
          <p className="eyebrow">Library</p>
          <h3>Saved PCs</h3>
          <input
            className={styles.librarySearch}
            placeholder="Search PCs…"
            type="text"
            value={pcSearch}
            onChange={(e) => setPcSearch(e.target.value)}
          />
          <div className={styles.libraryList}>
            {filteredCharacters.map((character) => (
              <div key={character.id} className={styles.libraryCard}>
                <div>
                  <strong>{character.name}</strong>
                  <p>
                    {character.class_name}
                    {character.subclass_name ? ` / ${character.subclass_name}` : ""}
                  </p>
                </div>
                <button className="secondary-button" onClick={() => onAddCharacter(character)} type="button">
                  Add
                </button>
              </div>
            ))}
            {filteredCharacters.length === 0 ? <div className={styles.emptyState}>No saved PCs yet.</div> : null}
          </div>
        </section>

        <section className={styles.librarySection}>
          <p className="eyebrow">Library</p>
          <h3>Saved Adversaries</h3>
          <input
            className={styles.librarySearch}
            placeholder="Search adversaries…"
            type="text"
            value={adversarySearch}
            onChange={(e) => setAdversarySearch(e.target.value)}
          />
          <div className={styles.libraryList}>
            {filteredAdversaries.map((adversary) => {
              const { short, full } = truncateAtColon(adversary.name);
              return (
                <div key={adversary.id} className={styles.libraryCard}>
                  <div>
                    <strong title={full}>{short}</strong>
                    <p>
                      Tier {adversary.tier} {adversary.role ?? "Standard"}
                    </p>
                  </div>
                  <button className="secondary-button" onClick={() => onAddAdversary(adversary)} type="button">
                    Add
                  </button>
                </div>
              );
            })}
            {filteredAdversaries.length === 0 ? <div className={styles.emptyState}>No saved adversaries yet.</div> : null}
          </div>
        </section>

        <section className={styles.librarySection}>
          <p className="eyebrow">Library</p>
          <h3>Saved Environments</h3>
          <input
            className={styles.librarySearch}
            placeholder="Search environments…"
            type="text"
            value={environmentSearch}
            onChange={(e) => setEnvironmentSearch(e.target.value)}
          />
          <div className={styles.libraryList}>
            {filteredEnvironments.map((environment) => (
              <div key={environment.id} className={styles.libraryCard}>
                <div>
                  <strong>{environment.name}</strong>
                  <p>{environment.description ?? "No description yet."}</p>
                </div>
                <button className="secondary-button" onClick={() => onAddEnvironment(environment)} type="button">
                  Add
                </button>
              </div>
            ))}
            {filteredEnvironments.length === 0 ? <div className={styles.emptyState}>No saved environments yet.</div> : null}
          </div>
        </section>
      </aside>
    </div>
  );
}
