// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import { useEffect, useState } from "react";

import { APP_ROUTES } from "../app/routes";
import { SessionTrackerBoard, type SessionTrackerState } from "../components/GM/SessionTrackerBoard";
import { getCharacterArmorSlots, getCharacterMaxHitPoints, getCharacterMaxStress } from "../utils/characterUtils";
import { PageHero } from "../components/Layout/PageHero";
import { fetchAdversaries, fetchCharacters, fetchEnvironments } from "../services/api";
import type { Adversary, Character, Environment } from "../types";

const INITIAL_SESSION: SessionTrackerState = {
  fear: 0,
  pcs: [],
  adversaries: [],
  environments: [],
};

export default function GMSessionTrackerPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [adversaries, setAdversaries] = useState<Adversary[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [session, setSession] = useState<SessionTrackerState>(INITIAL_SESSION);

  useEffect(() => {
    fetchCharacters().then(setCharacters).catch(() => undefined);
    fetchAdversaries().then(setAdversaries).catch(() => undefined);
    fetchEnvironments().then(setEnvironments).catch(() => undefined);
  }, []);

  function addCharacter(character: Character) {
    setSession((current) => {
      if (current.pcs.some((entry) => entry.id === `pc-${character.id}`)) {
        return current;
      }

      return {
        ...current,
        pcs: [
          ...current.pcs,
          {
            id: `pc-${character.id}`,
            type: "pc",
            name: character.name,
            subtitle: `${character.class_name}${character.subclass_name ? ` / ${character.subclass_name}` : ""}`,
            hp: character.hit_points ?? 0,
            maxHp: getCharacterMaxHitPoints(character),
            stress: character.stress ?? 0,
            maxStress: getCharacterMaxStress(character),
            armorSlots: getCharacterArmorSlots(character),
          },
        ],
      };
    });
  }

  function addAdversary(adversary: Adversary) {
    setSession((current) => {
      if (current.adversaries.some((entry) => entry.id === `adversary-${adversary.id}`)) {
        return current;
      }

      return {
        ...current,
        adversaries: [
          ...current.adversaries,
          {
            id: `adversary-${adversary.id}`,
            type: "adversary",
            name: adversary.name,
            subtitle: `Tier ${adversary.tier} ${adversary.role ?? "Standard"}`,
            hp: adversary.hit_points ?? 0,
            stress: adversary.stress ?? 0,
          },
        ],
      };
    });
  }

function addEnvironment(environment: Environment) {
    const environmentImage =
      typeof environment.data_json?.environment_image === "string" ? environment.data_json.environment_image : "";
    setSession((current) => {
      if (current.environments.some((entry) => entry.id === `environment-${environment.id}`)) {
        return current;
      }

      return {
        ...current,
        environments: [
          ...current.environments,
          {
            id: `environment-${environment.id}`,
            type: "environment",
            name: environment.name,
            description: environment.description ?? "",
            imageUrl: environmentImage,
          },
        ],
      };
    });
  }

  return (
    <main className="app-shell">
      <PageHero
        eyebrow="GM Tools"
        title="Session Tracker"
        description="Track live scenes with fear at the top, PCs in the primary lane, and adversaries beside environments underneath."
        breadcrumbs={[
          { label: "Home", route: APP_ROUTES.home },
          { label: "GM Tools", route: APP_ROUTES.gmHub },
          { label: "Session Tracker" },
        ]}
        actions={
          <button className="secondary-button" onClick={() => setSession(INITIAL_SESSION)} type="button">
            Clear Session
          </button>
        }
      />

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Live Board</p>
            <h2>Run The Scene</h2>
          </div>
          <p className="status">Add saved records from the right-hand library to build the current session state.</p>
        </div>

        <SessionTrackerBoard
          adversaries={adversaries}
          characters={characters}
          environments={environments}
          session={session}
          onAddAdversary={addAdversary}
          onAddCharacter={addCharacter}
          onAddEnvironment={addEnvironment}
          onRemove={(type, id) =>
            setSession((current) => ({
              ...current,
              [type]: current[type].filter((entry) => entry.id !== id),
            }))
          }
          onUpdateFear={(fear) =>
            setSession((current) => ({
              ...current,
              fear,
            }))
          }
          onUpdateAdversary={(id, updates) =>
            setSession((current) => ({
              ...current,
              adversaries: current.adversaries.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)),
            }))
          }
          onUpdateCharacter={(id, updates) =>
            setSession((current) => ({
              ...current,
              pcs: current.pcs.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)),
            }))
          }
        />
      </section>
    </main>
  );
}
