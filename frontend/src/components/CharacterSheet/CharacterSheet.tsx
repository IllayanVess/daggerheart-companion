// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import { RefObject, useEffect, useState } from "react";

import { CharacterForm } from "../CharacterForm/CharacterForm";
import { CharacterLevelUpModal } from "./CharacterLevelUpModal";
import {
  addCharacterInventory,
  deleteCharacterInventory,
  fetchCharacter,
  fetchInventoryCatalog,
  updateCharacterInventory,
  updateCharacterSheetDetails,
  updateCharacterTrackers,
} from "../../services/api";
import { clampTracker, getCharacterArmorSlots, getCharacterMaxHitPoints, getCharacterMaxStress } from "../../utils/characterUtils";
import type { Character, CharacterInventoryEntry, InventoryCatalogOption } from "../../types";
import styles from "./CharacterSheet.module.css";

type CharacterSheetProps = {
  character: Character | null;
  sheetRef?: RefObject<HTMLElement | null>;
  onUpdated?: (character: Character) => void;
};

type TrackerState = {
  hp: number;
  stress: number;
  hope: number;
  armorSlots: number;
  goldHandfuls: number;
  goldBags: number;
  goldChests: number;
};

type FeatureSection = {
  heading: string;
  body: string;
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asTraits(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

function asSourceMap(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entries]) => [
      key,
      Array.isArray(entries)
        ? entries
            .map((entry) =>
              typeof entry === "object" && entry !== null && typeof (entry as { label?: unknown }).label === "string"
                ? (entry as { label: string }).label
                : null,
            )
            .filter((entry): entry is string => Boolean(entry))
        : [],
    ]),
  );
}

function asSourceList(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .map((entry) =>
          typeof entry === "object" && entry !== null && typeof (entry as { label?: unknown }).label === "string"
            ? (entry as { label: string }).label
            : null,
        )
        .filter((entry): entry is string => Boolean(entry))
    : [];
}

function renderBoxes(count: number, activeCount: number, onToggle: (index: number) => void, label = "slot") {
  return (
    <div className={styles.trackerRow}>
      {Array.from({ length: count }, (_, index) => {
        const checked = index < activeCount;
        return (
          <button
            key={index}
            aria-label={`${label} ${index + 1}`}
            aria-pressed={checked}
            className={`${styles.trackerBox} ${checked ? styles.checked : ""}`}
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

function normalizeGold(handfuls: number, bags: number, chests: number) {
  let nextHandfuls = Math.max(0, handfuls);
  let nextBags = Math.max(0, bags);
  let nextChests = Math.max(0, chests);

  while (nextHandfuls >= 10 && nextChests < 1) {
    nextHandfuls -= 10;
    nextBags += 1;
  }

  while (nextBags >= 10 && nextChests < 1) {
    nextBags -= 10;
    nextChests += 1;
  }

  if (nextChests >= 1) {
    nextChests = 1;
    nextBags = Math.min(nextBags, 9);
    nextHandfuls = Math.min(nextHandfuls, 9);
  }

  return {
    goldHandfuls: Math.min(nextHandfuls, 9),
    goldBags: Math.min(nextBags, 9),
    goldChests: nextChests,
  };
}

function splitFeatureSections(text: string): FeatureSection[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const sections: FeatureSection[] = [];
  let currentHeading = "Feature";
  let currentBody: string[] = [];

  for (const line of lines) {
    const looksLikeHeading =
      /^[A-Z0-9'&:,\- ]+$/.test(line) &&
      line.length <= 36 &&
      !line.includes(".") &&
      !line.startsWith("- ");

    if (looksLikeHeading) {
      if (currentBody.length > 0) {
        sections.push({ heading: currentHeading, body: currentBody.join(" ") });
      }
      currentHeading = line;
      currentBody = [];
      continue;
    }

    currentBody.push(line);
  }

  if (currentBody.length > 0) {
    sections.push({ heading: currentHeading, body: currentBody.join(" ") });
  }

  return sections.length ? sections : [{ heading: "Class Feature", body: text }];
}

function renderFeatureBoxes(count: number, activeCount: number, onToggle: (index: number) => void, circle = false, label = "slot") {
  return (
    <div className={`${styles.trackerRow} ${circle ? styles.circleTrackerRow : ""}`}>
      {Array.from({ length: count }, (_, index) => {
        const checked = index < activeCount;
        return (
          <button
            key={index}
            aria-label={`${label} ${index + 1}`}
            aria-pressed={checked}
            className={`${styles.trackerBox} ${checked ? styles.checked : ""} ${circle ? styles.circleBox : ""}`}
            onClick={() => onToggle(index)}
            type="button"
          />
        );
      })}
    </div>
  );
}

export function CharacterSheet({ character, sheetRef, onUpdated }: CharacterSheetProps) {
  const [activeDialog, setActiveDialog] = useState<"edit" | "level-up" | null>(null);
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());
  function toggleCard(id: string) {
    setCollapsedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function CardHeader({ id, label }: { id: string; label: string }) {
    const collapsed = collapsedCards.has(id);
    return (
      <div className={styles.cardHeader} onClick={() => toggleCard(id)}>
        <p className={styles.sheetLabel}>{label}</p>
        <button
          type="button"
          className={styles.cardMinimizer}
          aria-label={collapsed ? `Expand ${label}` : `Collapse ${label}`}
          aria-expanded={!collapsed}
          onClick={(e) => { e.stopPropagation(); toggleCard(id); }}
        >
          {collapsed ? "▸" : "▾"}
        </button>
      </div>
    );
  }

  const [trackerState, setTrackerState] = useState<TrackerState>({
    hp: 0,
    stress: 0,
    hope: 0,
    armorSlots: 0,
    goldHandfuls: 0,
    goldBags: 0,
    goldChests: 0,
  });
  const [prayerDice, setPrayerDice] = useState(0);
  const [unstoppableValue, setUnstoppableValue] = useState(0);
  const [rallyDieValue, setRallyDieValue] = useState("");
  const [rallyNotes, setRallyNotes] = useState("");
  const [warriorNotes, setWarriorNotes] = useState("");
  const [companionName, setCompanionName] = useState("");
  const [companionEvasion, setCompanionEvasion] = useState(10);
  const [companionNotes, setCompanionNotes] = useState("");
  const [inventoryNotes, setInventoryNotes] = useState("");
  const [inventoryEntries, setInventoryEntries] = useState<CharacterInventoryEntry[]>([]);
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryResults, setInventoryResults] = useState<InventoryCatalogOption[]>([]);
  const [editingInventoryEntryId, setEditingInventoryEntryId] = useState<number | null>(null);

  function syncInventoryFromCharacter(nextCharacter: Character) {
    const nextPayload = nextCharacter.data_json ?? {};
    setInventoryEntries(
      Array.isArray(nextPayload.inventory_entries)
        ? nextPayload.inventory_entries.filter(
            (entry): entry is CharacterInventoryEntry =>
              typeof entry === "object" &&
              entry !== null &&
              typeof (entry as { id?: unknown }).id === "number" &&
              typeof (entry as { item_name?: unknown }).item_name === "string",
          )
        : [],
    );
  }

  useEffect(() => {
    if (!character) {
      setTrackerState({ hp: 0, stress: 0, hope: 0, armorSlots: 0, goldHandfuls: 0, goldBags: 0, goldChests: 0 });
      setPrayerDice(0);
      setUnstoppableValue(0);
      setRallyDieValue("");
      setRallyNotes("");
      setWarriorNotes("");
      setCompanionName("");
      setCompanionEvasion(10);
      setCompanionNotes("");
      setInventoryNotes("");
      setInventoryEntries([]);
      setInventorySearch("");
      setInventoryResults([]);
      setEditingInventoryEntryId(null);
      return;
    }

    const payload = character.data_json ?? {};
    setTrackerState({
      hp: character.hit_points ?? 0,
      stress: character.stress ?? 0,
      hope: character.hope ?? 0,
      armorSlots: getCharacterArmorSlots(character),
      goldHandfuls: typeof payload.gold_handfuls === "number" ? payload.gold_handfuls : 1,
      goldBags: typeof payload.gold_bags === "number" ? payload.gold_bags : 0,
      goldChests: typeof payload.gold_chests === "number" ? payload.gold_chests : 0,
    });
    setPrayerDice(typeof payload.prayer_dice === "number" ? payload.prayer_dice : 0);
    setUnstoppableValue(typeof payload.unstoppable_value === "number" ? payload.unstoppable_value : 0);
    setRallyDieValue(typeof payload.rally_die_value === "string" ? payload.rally_die_value : "");
    setRallyNotes(typeof payload.rally_notes === "string" ? payload.rally_notes : "");
    setWarriorNotes(typeof payload.warrior_notes === "string" ? payload.warrior_notes : "");
    setCompanionName(typeof payload.companion_name === "string" ? payload.companion_name : "");
    setCompanionEvasion(typeof payload.companion_evasion === "number" ? payload.companion_evasion : 10);
    setCompanionNotes(typeof payload.companion_notes === "string" ? payload.companion_notes : "");
    setInventoryNotes(typeof payload.inventory_notes === "string" ? payload.inventory_notes : "");
    syncInventoryFromCharacter(character);
  }, [character]);

  useEffect(() => {
    if (!inventorySearch.trim()) {
      setInventoryResults([]);
      return;
    }

    let cancelled = false;
    const query = inventorySearch.trim();

    fetchInventoryCatalog(query)
      .then((results) => {
        if (!cancelled) {
          setInventoryResults(results.slice(0, 12));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInventoryResults([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [inventorySearch]);

  async function persistTrackers(nextState: TrackerState) {
    if (!character) {
      return;
    }

    const clampedState = {
      ...nextState,
      hp: clampTracker(nextState.hp, maxHitPoints),
      stress: clampTracker(nextState.stress, maxStress),
    };

    setTrackerState(clampedState);

    try {
      const updatedCharacter = await updateCharacterTrackers(character.id, {
        hit_points: clampedState.hp,
        stress: clampedState.stress,
        hope: clampedState.hope,
        armor: clampedState.armorSlots,
        gold_handfuls: clampedState.goldHandfuls,
        gold_bags: clampedState.goldBags,
        gold_chests: clampedState.goldChests,
        prayer_dice: prayerDice,
        unstoppable_value: unstoppableValue,
      });
      onUpdated?.(updatedCharacter);
    } catch {}
  }

  async function persistPrayerDice(nextPrayerDice: number) {
    if (!character) {
      return;
    }

    setPrayerDice(nextPrayerDice);

    try {
      const updatedCharacter = await updateCharacterTrackers(character.id, {
        hit_points: trackerState.hp,
        stress: trackerState.stress,
        hope: trackerState.hope,
        armor: trackerState.armorSlots,
        gold_handfuls: trackerState.goldHandfuls,
        gold_bags: trackerState.goldBags,
        gold_chests: trackerState.goldChests,
        prayer_dice: nextPrayerDice,
        unstoppable_value: unstoppableValue,
      });
      onUpdated?.(updatedCharacter);
    } catch {}
  }

  async function persistUnstoppableValue(nextUnstoppableValue: number) {
    if (!character) {
      return;
    }

    setUnstoppableValue(nextUnstoppableValue);

    try {
      const updatedCharacter = await updateCharacterTrackers(character.id, {
        hit_points: trackerState.hp,
        stress: trackerState.stress,
        hope: trackerState.hope,
        armor: trackerState.armorSlots,
        gold_handfuls: trackerState.goldHandfuls,
        gold_bags: trackerState.goldBags,
        gold_chests: trackerState.goldChests,
        prayer_dice: prayerDice,
        unstoppable_value: nextUnstoppableValue,
      });
      onUpdated?.(updatedCharacter);
    } catch {}
  }

  async function persistCompanionDetails() {
    if (!character) {
      return;
    }

    try {
      const updatedCharacter = await updateCharacterSheetDetails(character.id, {
        companion_name: companionName,
        companion_evasion: companionEvasion,
        companion_notes: companionNotes,
        rally_die_value: rallyDieValue,
        rally_notes: rallyNotes,
        warrior_notes: warriorNotes,
        inventory_notes: inventoryNotes,
      });
      onUpdated?.(updatedCharacter);
    } catch {}
  }

  async function persistClassNotes() {
    if (!character) {
      return;
    }

    try {
      const updatedCharacter = await updateCharacterSheetDetails(character.id, {
        rally_die_value: rallyDieValue,
        rally_notes: rallyNotes,
        warrior_notes: warriorNotes,
        inventory_notes: inventoryNotes,
        companion_name: companionName,
        companion_evasion: companionEvasion,
        companion_notes: companionNotes,
      });
      onUpdated?.(updatedCharacter);
    } catch {}
  }

  async function handleAddInventory(itemName: string) {
    if (!character) {
      return;
    }

    try {
      await addCharacterInventory(character.id, { item_name: itemName });
      const refreshed = await fetchCharacter(character.id);
      syncInventoryFromCharacter(refreshed);
      onUpdated?.(refreshed);
      setInventorySearch("");
      setInventoryResults([]);
      setEditingInventoryEntryId(null);
    } catch {}
  }

  async function handleToggleEquip(entry: CharacterInventoryEntry, slotName: string | null) {
    if (!character) {
      return;
    }

    try {
      await updateCharacterInventory(character.id, entry.id, {
        equipped: !entry.equipped || entry.slot_name !== slotName,
        slot_name: !entry.equipped || entry.slot_name !== slotName ? slotName : null,
      });
      const refreshed = await fetchCharacter(character.id);
      syncInventoryFromCharacter(refreshed);
      onUpdated?.(refreshed);
      setEditingInventoryEntryId(null);
    } catch {}
  }

  async function handleRemoveInventory(entryId: number) {
    if (!character) {
      return;
    }

    try {
      await deleteCharacterInventory(character.id, entryId);
      const refreshed = await fetchCharacter(character.id);
      syncInventoryFromCharacter(refreshed);
      onUpdated?.(refreshed);
      setEditingInventoryEntryId(null);
    } catch {}
  }

  async function handleInventoryFieldSave(entry: CharacterInventoryEntry) {
    if (!character) {
      return;
    }

    try {
      if (entry.quantity <= 0) {
        await deleteCharacterInventory(character.id, entry.id);
        const refreshedAfterDelete = await fetchCharacter(character.id);
        syncInventoryFromCharacter(refreshedAfterDelete);
        onUpdated?.(refreshedAfterDelete);
        setInventorySearch("");
        setInventoryResults([]);
        setEditingInventoryEntryId(null);
        return;
      }

      await updateCharacterInventory(character.id, entry.id, {
        quantity: entry.quantity,
        notes: entry.notes ?? "",
      });
      const refreshed = await fetchCharacter(character.id);
      syncInventoryFromCharacter(refreshed);
      onUpdated?.(refreshed);
      setInventorySearch("");
      setInventoryResults([]);
      setEditingInventoryEntryId(null);
    } catch {}
  }

  function updateInventoryDraft(entryId: number, updates: Partial<CharacterInventoryEntry>) {
    setInventoryEntries((currentEntries) =>
      currentEntries.map((currentEntry) =>
        currentEntry.id === entryId
          ? {
              ...currentEntry,
              ...updates,
            }
          : currentEntry,
      ),
    );
  }

  if (!character) {
    return (
      <section className={`panel ${styles.root}`} ref={sheetRef}>
        <div className="panel-header">
          <div>
            <p className="eyebrow">Character Sheet</p>
            <h2>Interactive Sheet</h2>
          </div>
        </div>
        <p className="empty-state">Choose a saved character to open the full sheet view.</p>
      </section>
    );
  }

  const payload = character.data_json ?? {};
  const maxHitPoints = getCharacterMaxHitPoints(character);
  const maxStress = getCharacterMaxStress(character);
  const traits = asTraits(payload.traits);
  const experiences = Array.isArray(payload.experiences)
    ? payload.experiences.filter(
        (entry): entry is { name: string; modifier: number } =>
          typeof entry === "object" &&
          entry !== null &&
          typeof (entry as { name?: unknown }).name === "string" &&
          typeof (entry as { modifier?: unknown }).modifier === "number",
      )
    : [];
  const domains = asStringArray(payload.class_domains);
  const domainCards = asStringArray(payload.domain_cards);
  const classItems = asStringArray(payload.class_items);
  const normalizedClassName = character.class_name.toLowerCase();
  const classDomains = domains.length ? domains.join(" & ") : "Class Domains";
  const classFeature = typeof payload.class_feature === "string" ? payload.class_feature : "";
  const hopeFeature = typeof payload.hope_feature === "string" ? payload.hope_feature : "";
  const featureSections = splitFeatureSections(classFeature);
  const displayedEvasion =
    typeof payload.derived_evasion === "number" ? payload.derived_evasion : character.evasion ?? "-";
  const evasionSources = asSourceList(payload.derived_evasion_sources);
  const traitSources = asSourceMap(payload.trait_modifier_sources);

  function renderClassSpecificModule() {
    const normalizedClass = normalizedClassName;

    if (normalizedClass === "seraph") {
      return (
        <article className={`${styles.card} ${styles.classSpecialCard}`}>
          <CardHeader id="class-module" label="Prayer Dice" />
          {!collapsedCards.has("class-module") && (
            <>
              {renderFeatureBoxes(
                6,
                prayerDice,
                (index) => {
                  const nextPrayerDice = getNextMarkedValue(prayerDice, index);
                  void persistPrayerDice(nextPrayerDice);
                },
                true,
                "Prayer die",
              )}
              <p className="muted">Track the prayer dice you have ready on this sheet.</p>
            </>
          )}
        </article>
      );
    }

    if (normalizedClass === "guardian") {
      return (
        <article className={`${styles.card} ${styles.classSpecialCard}`}>
          <CardHeader id="class-module" label="Unstoppable Die" />
          {!collapsedCards.has("class-module") && (
            <>
              {renderFeatureBoxes(
                6,
                unstoppableValue,
                (index) => {
                  const nextUnstoppableValue = getNextMarkedValue(unstoppableValue, index);
                  void persistUnstoppableValue(nextUnstoppableValue);
                },
                true,
                "Unstoppable die",
              )}
              <p className="muted">Track the current face/value of your Unstoppable die.</p>
            </>
          )}
        </article>
      );
    }

    if (normalizedClass === "bard") {
      return (
        <article className={`${styles.card} ${styles.classSpecialCard}`}>
          <CardHeader id="class-module" label="Rally Die" />
          {!collapsedCards.has("class-module") && (
            <>
              <div className={`${styles.gridForm} ${styles.inventoryCompactGrid}`}>
                <label>
                  Rally Die
                  <select value={rallyDieValue} onChange={(event) => setRallyDieValue(event.target.value)}>
                    <option value="">Choose die</option>
                    <option value="d6">d6</option>
                    <option value="d8">d8</option>
                    <option value="d10">d10</option>
                  </select>
                </label>
                <label className={styles.wide}>
                  Rally Notes
                  <textarea rows={4} value={rallyNotes} onChange={(event) => setRallyNotes(event.target.value)} />
                </label>
              </div>
              <button className="secondary-button" onClick={() => void persistClassNotes()} type="button">
                Save Bard Notes
              </button>
            </>
          )}
        </article>
      );
    }

    if (normalizedClass === "warrior") {
      return (
        <article className={`${styles.card} ${styles.classSpecialCard}`}>
          <CardHeader id="class-module" label="Combat Notes" />
          {!collapsedCards.has("class-module") && (
            <>
              <textarea
                className={styles.sheetTextarea}
                rows={6}
                value={warriorNotes}
                onChange={(event) => setWarriorNotes(event.target.value)}
                placeholder="Track attack of opportunity reminders, combat training notes, or slayer-style cues."
              />
              <button className="secondary-button" onClick={() => void persistClassNotes()} type="button">
                Save Warrior Notes
              </button>
            </>
          )}
        </article>
      );
    }

    if (normalizedClass === "ranger") {
      return (
        <article className={`${styles.card} ${styles.classSpecialCard} ${styles.rangerCompanionCard}`}>
          <CardHeader id="class-module" label="Companion" />
          {!collapsedCards.has("class-module") && (
            <>
              <div className={`${styles.gridForm} ${styles.inventoryCompactGrid}`}>
                <label>
                  Companion Name
                  <input value={companionName} onChange={(event) => setCompanionName(event.target.value)} />
                </label>
                <label>
                  Companion Evasion
                  <input
                    type="number"
                    min="0"
                    value={companionEvasion}
                    onChange={(event) => setCompanionEvasion(Number(event.target.value) || 0)}
                  />
                </label>
                <label className={styles.wide}>
                  Companion Notes
                  <textarea rows={4} value={companionNotes} onChange={(event) => setCompanionNotes(event.target.value)} />
                </label>
                <label className={styles.wide}>
                  Companion Experiences
                  <textarea
                    rows={3}
                    value={rallyNotes}
                    onChange={(event) => setRallyNotes(event.target.value)}
                    placeholder="Use this field for companion experiences or training notes for now."
                  />
                </label>
              </div>
              <button className="secondary-button" onClick={() => void persistCompanionDetails()} type="button">
                Save Companion
              </button>
            </>
          )}
        </article>
      );
    }

    return null;
  }

  return (
    <>
      <section
        className={`panel ${styles.root}`}
        data-sheet-theme={normalizedClassName}
        ref={sheetRef}
      >
        <section className={styles.banner}>
          <div className={styles.bannerMain}>
            <p className={styles.bannerClass}>{character.class_name}</p>
            <p className={styles.bannerDomains}>{classDomains}</p>
          </div>
          <div className={styles.bannerDetails}>
            <div>
              <p className={styles.sheetLabel}>Character</p>
              <h2>{character.name}</h2>
            </div>
            <div className={styles.bannerActions}>
              <span className="pill">Level {character.level}</span>
              <button className="secondary-button" onClick={() => setActiveDialog("edit")} type="button">
                Edit Sheet
              </button>
              <button className={`secondary-button ${styles.sheetLevelUpButton}`} onClick={() => setActiveDialog("level-up")} type="button">
                Level Up
              </button>
            </div>
          </div>
        </section>

        {/* Traits strip — horizontal, between banner and grid */}
        <div className={`${styles.card} ${styles.traitsStrip}`}>
          <CardHeader id="traits" label="Traits" />
          {!collapsedCards.has("traits") && (
            <div className={styles.traitsRow}>
              {Object.entries(traits).map(([trait, modifier]) => (
                <div key={trait} className={styles.traitChip}>
                  <span className={styles.traitChipName}>{trait}</span>
                  <strong className={styles.traitChipValue}>{modifier}</strong>
                  {traitSources[trait]?.length ? (
                    <span className={styles.traitChipSources}>
                      {traitSources[trait].join(", ")}
                    </span>
                  ) : null}
                </div>
              ))}
              {Object.keys(traits).length === 0 && (
                <p className="muted">No trait assignment saved yet.</p>
              )}
            </div>
          )}
        </div>

        <section className={styles.sheetGrid}>
          {/* Identity Card – now includes Active Armor */}
          <article className={`${styles.card} ${styles.identityCard}`}>
            <CardHeader id="identity" label="Identity" />
            {!collapsedCards.has("identity") && (<><div className={styles.topline}>
              <div>
                <p className={styles.sheetLabel}>Class</p>
                <h3>
                  {character.class_name}
                  {character.subclass_name ? ` / ${character.subclass_name}` : ""}
                </h3>
              </div>
              <div>
                <p className={styles.sheetLabel}>Pronouns</p>
                <p>{typeof payload.pronouns === "string" && payload.pronouns ? payload.pronouns : "-"}</p>
              </div>
            </div>
            <div className={styles.meta}>
              <div>
                <p className={styles.sheetLabel}>Heritage</p>
                <p>
                  {character.ancestry ?? "-"} / {character.community ?? "-"}
                </p>
              </div>
              <div>
                <p className={styles.sheetLabel}>Description</p>
                <p>{typeof payload.description === "string" && payload.description ? payload.description : "-"}</p>
              </div>
            </div>

            {/* Active Armor embedded here */}
            <div className={styles.armorSection}>
              <p className={styles.sheetLabel}>Active Armor</p>
              <div className={styles.armorDetails}>
                <div>
                  <span>Armor:</span>
                  <strong>{typeof payload.armor_name === "string" && payload.armor_name ? payload.armor_name : "-"}</strong>
                </div>
                <div>
                  <span>Thresholds:</span>
                  <strong>
                    {typeof payload.armor_threshold_major === "string" ? payload.armor_threshold_major : "-"} /{" "}
                    {typeof payload.armor_threshold_severe === "string" ? payload.armor_threshold_severe : "-"}
                  </strong>
                </div>
              </div>
              <div className={styles.trackerBlockCompact}>
                <p className={styles.sheetLabel}>Armor Slots</p>
                {renderBoxes(6, trackerState.armorSlots, (index) => {
                  const armorSlots = getNextMarkedValue(trackerState.armorSlots, index);
                  void persistTrackers({ ...trackerState, armorSlots });
                }, "Armor slot")}
              </div>
            </div>
            </>)}
          </article>

          <article className={`${styles.card} ${styles.trackerCard}`}>
            <CardHeader id="trackers" label="Trackers" />
            {!collapsedCards.has("trackers") && (<>
            <div className={styles.statBadges}>
              <div className={styles.statBadge}>
                <span>Evasion</span>
                <strong>{displayedEvasion}</strong>
              </div>
              <div className={styles.statBadge}>
                <span>Armor</span>
                <strong>{character.armor ?? "-"}</strong>
              </div>
              <div className={styles.statBadge}>
                <span>Prof.</span>
                <strong>{typeof payload.proficiency === "number" ? payload.proficiency : 1}</strong>
              </div>
            </div>
            {evasionSources.length > 0 ? (
              <div className={styles.derivedSourceBlock}>
                <p className={styles.sheetLabel}>Evasion Sources</p>
                <div className={styles.sourcePillRow}>
                  {evasionSources.map((source) => (
                    <span key={source} className={styles.sourcePill}>
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            <div className={styles.trackerBlock}>
              <p className={styles.sheetLabel}>HP ({trackerState.hp}/{maxHitPoints})</p>
              {renderBoxes(maxHitPoints, clampTracker(trackerState.hp, maxHitPoints), (index) => {
                const hp = getNextMarkedValue(trackerState.hp, index);
                void persistTrackers({ ...trackerState, hp });
              }, "HP slot")}
            </div>

            <div className={styles.trackerBlock}>
              <p className={styles.sheetLabel}>Stress ({trackerState.stress}/{maxStress})</p>
              {renderBoxes(maxStress, clampTracker(trackerState.stress, maxStress), (index) => {
                const stress = getNextMarkedValue(trackerState.stress, index);
                void persistTrackers({ ...trackerState, stress });
              }, "Stress slot")}
            </div>

            <div className={styles.trackerBlock}>
              <p className={styles.sheetLabel}>Hope</p>
              {renderBoxes(6, trackerState.hope, (index) => {
                const hope = getNextMarkedValue(trackerState.hope, index);
                void persistTrackers({ ...trackerState, hope });
              }, "Hope slot")}
            </div>
            {hopeFeature ? <p className={styles.sheetFeatureCopy}>{hopeFeature}</p> : null}
            </>)}
          </article>

          <article className={styles.card}>
            <CardHeader id="weapons" label="Active Weapons" />
            {!collapsedCards.has("weapons") && (
              <>
                {(() => {
                  const equippedPrimary = inventoryEntries.find((e) => e.equipped && e.slot_name === "primary");
                  const equippedSecondary = inventoryEntries.find((e) => e.equipped && e.slot_name === "secondary");
                  const fallbackPrimary = typeof payload.primary_weapon === "string" && payload.primary_weapon ? payload.primary_weapon : null;
                  const fallbackSecondary = typeof payload.secondary_weapon === "string" && payload.secondary_weapon ? payload.secondary_weapon : null;
                  return (
                    <>
                      <div className="sheet-entry">
                        <span>Primary</span>
                        <strong>{equippedPrimary ? equippedPrimary.item_name : (fallbackPrimary ?? "-")}</strong>
                      </div>
                      <div className="sheet-entry">
                        <span>Secondary</span>
                        <strong>{equippedSecondary ? equippedSecondary.item_name : (fallbackSecondary ?? "-")}</strong>
                      </div>
                    </>
                  );
                })()}
                <p className="muted">
                  {typeof payload.weapon_notes === "string" && payload.weapon_notes ? payload.weapon_notes : "No weapon notes yet."}
                </p>
              </>
            )}
          </article>

          {/* The separate Active Armor card has been removed */}

          <article className={styles.card}>
            <CardHeader id="experience" label="Experience" />
            {!collapsedCards.has("experience") && (
            <div className="sheet-list">
              {experiences.map((experience) => (
                <div key={experience.name} className="sheet-entry">
                  <span>{experience.name}</span>
                  <strong>+{experience.modifier}</strong>
                </div>
              ))}
              {experiences.length === 0 ? <p className="muted">No experiences saved yet.</p> : null}
            </div>
            )}
          </article>

          <article className={styles.card}>
            <CardHeader id="domains" label="Domains and Cards" />
            {!collapsedCards.has("domains") && (<>
            <p className="muted">Domains: {domains.length ? domains.join(" / ") : "No class domains saved."}</p>
            <div className="sheet-list">
              {domainCards.map((card) => (
                <div key={card} className="sheet-entry">
                  <span>{card}</span>
                </div>
              ))}
              {domainCards.length === 0 ? <p className="muted">No domain cards saved yet.</p> : null}
            </div>
            </>)}
          </article>

          <article className={styles.card}>
            <CardHeader id="gold" label="Gold" />
            {!collapsedCards.has("gold") && (
            <div className={styles.goldTrackerGrid}>
              <div className={styles.trackerBlock}>
                <p className={styles.sheetLabel}>Handfuls</p>
                {renderBoxes(10, trackerState.goldHandfuls, (index) => {
                  const goldHandfuls = getNextMarkedValue(trackerState.goldHandfuls, index);
                  void persistTrackers({ ...trackerState, ...normalizeGold(goldHandfuls, trackerState.goldBags, trackerState.goldChests) });
                }, "Gold handful")}
              </div>
              <div className={styles.trackerBlock}>
                <p className={styles.sheetLabel}>Bags</p>
                {renderBoxes(10, trackerState.goldBags, (index) => {
                  const goldBags = getNextMarkedValue(trackerState.goldBags, index);
                  void persistTrackers({ ...trackerState, ...normalizeGold(trackerState.goldHandfuls, goldBags, trackerState.goldChests) });
                }, "Gold bag")}
              </div>
              <div className={styles.trackerBlock}>
                <p className={styles.sheetLabel}>Chest</p>
                {renderBoxes(1, trackerState.goldChests, (index) => {
                  const goldChests = getNextMarkedValue(trackerState.goldChests, index);
                  void persistTrackers({ ...trackerState, ...normalizeGold(trackerState.goldHandfuls, trackerState.goldBags, goldChests) });
                }, "Gold chest")}
              </div>
            </div>
            )}
          </article>

          <article className={`${styles.card} ${styles.wideCard} ${styles.classFeatureCard}`}>
            <CardHeader id="classfeature" label="Class Feature" />
            {!collapsedCards.has("classfeature") && (
            <div className={styles.featureSectionList}>
              {featureSections.length ? (
                featureSections.map((section, index) => (
                  <article key={`${section.heading}-${index}`} className={styles.featureSectionCard}>
                    <h4>{section.heading}</h4>
                    <p>{section.body}</p>
                  </article>
                ))
              ) : (
                <p>No class feature text loaded yet.</p>
              )}
            </div>
            )}
          </article>

          {renderClassSpecificModule()}

          <article className={styles.card}>
            <CardHeader id="inventory" label="Inventory" />
            {!collapsedCards.has("inventory") && (<>
            <div className={styles.inventoryToolbar}>
              <input
                value={inventorySearch}
                onChange={(event) => setInventorySearch(event.target.value)}
                placeholder="Search equipment, items, consumables"
              />
              {inventorySearch ? (
                <button
                  className={`secondary-button ${styles.inventoryClearButton}`}
                  onClick={() => {
                    setInventorySearch("");
                    setInventoryResults([]);
                  }}
                  type="button"
                >
                  Clear Search
                </button>
              ) : null}
            </div>
            {inventoryResults.length ? (
              <div className={styles.inventorySearchResults}>
                {inventoryResults.map((result) => (
                  <button
                    key={`${result.category}-${result.item_name}`}
                    className={styles.inventoryResultButton}
                    onClick={() => void handleAddInventory(result.item_name)}
                    type="button"
                  >
                    {result.item_name} {result.category ? `(${result.category})` : ""}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="sheet-list">
              {inventoryEntries.map((entry) => (
                <div key={entry.id} className={styles.inventoryEntryCard}>
                  <div className="sheet-entry">
                    <span>{entry.item_name}</span>
                    <strong>x{entry.quantity}</strong>
                  </div>
                  <p className="muted">
                    {entry.category ?? "Misc"} {entry.equipped && entry.slot_name ? `| Equipped as ${entry.slot_name}` : ""}
                  </p>
                  <div className={styles.inventoryEntryActions}>
                    <button
                      className="secondary-button"
                      onClick={() =>
                        setEditingInventoryEntryId((currentId) => (currentId === entry.id ? null : entry.id))
                      }
                      type="button"
                    >
                      {editingInventoryEntryId === entry.id ? "Close" : "Edit"}
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        const nextEntry = {
                          ...entry,
                          quantity: Math.max(0, entry.quantity - 1),
                        };
                        updateInventoryDraft(entry.id, { quantity: nextEntry.quantity });
                        void handleInventoryFieldSave(nextEntry);
                      }}
                      type="button"
                    >
                      -1
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        const nextEntry = {
                          ...entry,
                          quantity: entry.quantity + 1,
                        };
                        updateInventoryDraft(entry.id, { quantity: nextEntry.quantity });
                        void handleInventoryFieldSave(nextEntry);
                      }}
                      type="button"
                    >
                      +1
                    </button>
                    {entry.category === "Primary Weapon" ? (
                      <button className="secondary-button" onClick={() => void handleToggleEquip(entry, "primary")} type="button">
                        {entry.equipped && entry.slot_name === "primary" ? "Unequip" : "Equip Primary"}
                      </button>
                    ) : null}
                    {entry.category === "Secondary Weapon" ? (
                      <button className="secondary-button" onClick={() => void handleToggleEquip(entry, "secondary")} type="button">
                        {entry.equipped && entry.slot_name === "secondary" ? "Unequip" : "Equip Secondary"}
                      </button>
                    ) : null}
                    {entry.category === "Armor" ? (
                      <button className="secondary-button" onClick={() => void handleToggleEquip(entry, "armor")} type="button">
                        {entry.equipped && entry.slot_name === "armor" ? "Unequip" : "Equip Armor"}
                      </button>
                    ) : null}
                    <button className="secondary-button" onClick={() => void handleInventoryFieldSave(entry)} type="button">
                      Save Entry
                    </button>
                    <button className="secondary-button" onClick={() => void handleRemoveInventory(entry.id)} type="button">
                      Remove
                    </button>
                  </div>
                  {editingInventoryEntryId === entry.id ? (
                    <div className={`${styles.gridForm} ${styles.inventoryCompactGrid} ${styles.inventoryEditGrid}`}>
                      <label>
                        Quantity
                        <input
                          type="number"
                          min="0"
                          value={entry.quantity}
                          onChange={(event) =>
                            updateInventoryDraft(entry.id, { quantity: Math.max(0, Number(event.target.value) || 0) })
                          }
                          onBlur={() => void handleInventoryFieldSave(entry)}
                        />
                      </label>
                      <label className={styles.wide}>
                        Notes
                        <textarea
                          rows={3}
                          value={entry.notes ?? ""}
                          onChange={(event) => updateInventoryDraft(entry.id, { notes: event.target.value })}
                          onBlur={() => void handleInventoryFieldSave(entry)}
                          placeholder="Add inventory notes, usage reminders, or carry details."
                        />
                      </label>
                      <div className={`${styles.inventoryEntryActions} ${styles.wide}`}>
                        <button className="secondary-button" onClick={() => void handleInventoryFieldSave(entry)} type="button">
                          Save Entry
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
              {inventoryEntries.length === 0 ? (
                <p className="muted">No structured inventory entries yet.</p>
              ) : null}
            </div>
            <label className={`${styles.sheetLabel} ${styles.inventoryNotesLabel}`}>
              Loose Inventory and Starter Supplies
              <textarea
                className={styles.sheetTextarea}
                rows={4}
                value={inventoryNotes}
                onChange={(event) => setInventoryNotes(event.target.value)}
                onBlur={() => void persistCompanionDetails()}
                placeholder="Track rope, torch, supplies, class trinkets, or anything not yet stored as a structured entry."
              />
            </label>
            <p className="muted">Potion: {typeof payload.potion_choice === "string" ? payload.potion_choice : "-"}</p>
            <p className="muted">Class Items: {classItems.length ? classItems.join(" / ") : "-"}</p>
            </>)}
          </article>

          <article className={`${styles.card} ${styles.wideCard}`}>
            <CardHeader id="background" label="Background and Connections" />
            {!collapsedCards.has("background") && (<>
            <p>{typeof payload.background === "string" && payload.background ? payload.background : "No background notes yet."}</p>
            <p className="muted">
              {typeof payload.connection_notes === "string" && payload.connection_notes
                ? payload.connection_notes
                : "No connection notes yet."}
            </p>
            </>)}
          </article>
          {Array.isArray(payload.level_up_log) && payload.level_up_log.length ? (
            <article className={`${styles.card} ${styles.wideCard}`}>
              <CardHeader id="levellog" label="Level-Up Log" />
              {!collapsedCards.has("levellog") && (
              <div className="sheet-list">
                {payload.level_up_log.map((entry) =>
                  typeof entry === "string" ? (
                    <div key={entry} className="sheet-entry">
                      <span>{entry}</span>
                    </div>
                  ) : null,
                )}
              </div>
              )}
            </article>
          ) : null}
        </section>
      </section>

      {activeDialog === "edit" ? (
        <div className={styles.modalBackdrop} role="presentation">
          <div className={styles.modalShell} role="dialog" aria-modal="true">
            <CharacterForm
              initialCharacter={character}
              onCancel={() => setActiveDialog(null)}
              onSaved={(updatedCharacter) => {
                onUpdated?.(updatedCharacter);
                setActiveDialog(null);
              }}
              submitLabel="Save Revisions"
            />
          </div>
        </div>
      ) : null}

      {activeDialog === "level-up" ? (
        <CharacterLevelUpModal
          character={character}
          onClose={() => setActiveDialog(null)}
          onSaved={(updatedCharacter) => {
            onUpdated?.(updatedCharacter);
            setActiveDialog(null);
          }}
        />
      ) : null}
    </>
  );
}