// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import { useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";

import type { AdhocTokenDraft, BoardTokenType, PaletteCategory, PaletteToken } from "./EncounterBoard.types";
import styles from "./EncounterBoard.module.css";

const CATEGORIES: Array<{ id: PaletteCategory; label: string }> = [
  { id: "pcs", label: "PCs" },
  { id: "adversaries", label: "Adversaries" },
  { id: "npcs", label: "NPCs" },
  { id: "objects", label: "Objects" },
  { id: "adhoc", label: "Ad-hoc" },
];

const TOKEN_TYPE_OPTIONS: Array<{ value: BoardTokenType; label: string }> = [
  { value: "pc", label: "PC" },
  { value: "adversary", label: "Adversary" },
  { value: "npc", label: "NPC" },
  { value: "object", label: "Object" },
];

type TokenPaletteProps = {
  palette: {
    pcs: PaletteToken[];
    adversaries: PaletteToken[];
    npcs: PaletteToken[];
    objects: PaletteToken[];
  };
  compact?: boolean;
  libraryStatus?: string;
  isReloading?: boolean;
  onReloadLibraries?: () => void;
  onTokenClick?: (token: PaletteToken) => void;
  onAdhocCreate?: (draft: AdhocTokenDraft) => void;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function getTokensForCategory(category: PaletteCategory, palette: TokenPaletteProps["palette"]) {
  switch (category) {
    case "pcs":
      return palette.pcs;
    case "adversaries":
      return palette.adversaries;
    case "npcs":
      return palette.npcs;
    case "objects":
      return palette.objects;
    case "adhoc":
      return [];
  }
}

function createDragPayload(category: PaletteCategory, token: PaletteToken) {
  return JSON.stringify({ category, id: token.id });
}

export function TokenPalette({
  palette,
  compact = false,
  libraryStatus,
  isReloading = false,
  onReloadLibraries,
  onTokenClick,
  onAdhocCreate,
}: TokenPaletteProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<PaletteCategory>("pcs");
  const [search, setSearch] = useState("");
  const [adhocDraft, setAdhocDraft] = useState<AdhocTokenDraft>({
    name: "",
    type: "npc",
    portraitUrl: null,
    description: "",
    maxHp: 0,
    maxStress: 0,
  });

  const tokens = getTokensForCategory(activeCategory, palette).filter((token) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return `${token.name} ${token.subtitle}`.toLowerCase().includes(query);
  });

  function handleDragStart(event: DragEvent<HTMLButtonElement>, token: PaletteToken) {
    event.dataTransfer.setData("application/x-encounter-token", createDragPayload(activeCategory, token));
    event.dataTransfer.effectAllowed = "copy";
  }

  async function handlePortraitChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (file.size > 500_000) {
      window.alert("Portrait files must be 500 KB or smaller.");
      return;
    }

    const portraitUrl = await readFileAsDataUrl(file);
    setAdhocDraft((current) => ({ ...current, portraitUrl }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adhocDraft.name.trim()) {
      return;
    }

    onAdhocCreate?.(adhocDraft);
    setAdhocDraft({
      name: "",
      type: "npc",
      portraitUrl: null,
      description: "",
      maxHp: 0,
      maxStress: 0,
    });
  }

  return (
    <section className={`${styles.palette} ${compact ? styles.paletteCompact : ""}`}>
      {!compact ? (
          <div className={styles.paletteHeader}>
            <div>
              <p className="eyebrow">Token Palette</p>
              <h3>Place combatants and props</h3>
            </div>
            <div className={styles.paletteHeaderActions}>
              {onReloadLibraries ? (
                <button className="secondary-button" disabled={isReloading} onClick={onReloadLibraries} type="button">
                  {isReloading ? "Loading..." : "Reload"}
                </button>
              ) : null}
              <button className="secondary-button" onClick={() => setIsCollapsed((current) => !current)} type="button">
                {isCollapsed ? "Show" : "Hide"}
              </button>
            </div>
          {libraryStatus ? <p className={styles.paletteStatus}>{libraryStatus}</p> : null}
        </div>
      ) : null}

      {!isCollapsed || compact ? (
        <>
          <div className={styles.paletteTabs} role="tablist" aria-label="Token categories">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                className={activeCategory === category.id ? styles.activeTab : ""}
                type="button"
                onClick={() => {
                  setActiveCategory(category.id);
                  setSearch("");
                }}
              >
                {category.label}
              </button>
            ))}
          </div>

          {activeCategory === "adhoc" ? (
            <form className={styles.adhocForm} onSubmit={handleSubmit}>
              <input
                className={`${styles.inputBase} ${styles.fieldControl}`}
                aria-label="Ad-hoc token name"
                placeholder="Token name"
                value={adhocDraft.name}
                onChange={(event) => setAdhocDraft((current) => ({ ...current, name: event.target.value }))}
              />
              <select
                className={`${styles.inputBase} ${styles.fieldControl}`}
                aria-label="Ad-hoc token type"
                value={adhocDraft.type}
                onChange={(event) =>
                  setAdhocDraft((current) => ({ ...current, type: event.target.value as BoardTokenType }))
                }
              >
                {TOKEN_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <textarea
                className={`${styles.inputBase} ${styles.fieldControl} ${styles.textAreaControl}`}
                aria-label="Ad-hoc token description"
                placeholder="Description"
                value={adhocDraft.description}
                onChange={(event) => setAdhocDraft((current) => ({ ...current, description: event.target.value }))}
              />
              {adhocDraft.type !== "object" ? (
                <div className={styles.adhocNumbers}>
                  <label>
                    Max HP
                    <input
                      min="0"
                      className={`${styles.inputBase} ${styles.fieldControl}`}
                      type="number"
                      value={adhocDraft.maxHp}
                      onChange={(event) => setAdhocDraft((current) => ({ ...current, maxHp: Number(event.target.value) }))}
                    />
                  </label>
                  <label>
                    Max Stress
                    <input
                      min="0"
                      className={`${styles.inputBase} ${styles.fieldControl}`}
                      type="number"
                      value={adhocDraft.maxStress}
                      onChange={(event) =>
                        setAdhocDraft((current) => ({ ...current, maxStress: Number(event.target.value) }))
                      }
                    />
                  </label>
                </div>
              ) : null}
              <input className={`${styles.inputBase} ${styles.fieldControl}`} aria-label="Ad-hoc portrait" accept="image/*" type="file" onChange={handlePortraitChange} />
              <button className="primary-button" type="submit">
                Create Token
              </button>
            </form>
          ) : (
            <>
              <input
                className={`${styles.inputBase} ${styles.paletteSearch}`}
                placeholder={`Search ${CATEGORIES.find((category) => category.id === activeCategory)?.label ?? "tokens"}`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div className={styles.paletteList}>
                {tokens.map((token) => {
                  const dragProps = compact ? {} : { onDragStart: (event: DragEvent<HTMLButtonElement>) => handleDragStart(event, token) };
                  return (
                    <button
                      key={token.id}
                      className={styles.paletteItem}
                      draggable={!compact}
                      type="button"
                      onClick={() => onTokenClick?.(token)}
                      {...dragProps}
                    >
                      <strong>{token.name}</strong>
                      <span>{token.subtitle}</span>
                      <em>{compact ? "Place token" : "Drag to board"}</em>
                    </button>
                  );
                })}
                {tokens.length === 0 ? (
                  <div className={styles.paletteEmpty}>
                    <p>No entries found for this category.</p>
                    {onReloadLibraries ? (
                      <button className="secondary-button" disabled={isReloading} onClick={onReloadLibraries} type="button">
                        {isReloading ? "Loading..." : "Reload libraries"}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </>
          )}
        </>
      ) : null}
    </section>
  );
}
