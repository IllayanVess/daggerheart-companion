import { useEffect, useMemo, useState } from "react";

import {
  createCharacter,
  fetchAncestries,
  fetchClassDetail,
  fetchClasses,
  fetchCommunities,
  fetchDomainCards,
  fetchEquipment,
  fetchSubclassDetail,
  updateCharacter,
} from "../../services/api";
import { getCharacterMaxHitPoints, getCharacterMaxStress } from "../../utils/characterUtils";
import type {
  AncestryOption,
  Character,
  CharacterUpsertPayload,
  ClassDetail,
  ClassOption,
  CommunityOption,
  DomainCardOption,
  EquipmentOption,
  SubclassDetail,
} from "../../types";
import styles from "./CharacterForm.module.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CharacterFormProps = {
  onSaved: (character: Character) => void;
  focusMode?: boolean;
  initialCharacter?: Character | null;
  onCancel?: () => void;
  submitLabel?: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEPS = [
  "Class",
  "Heritage",
  "Traits",
  "Core",
  "Equipment",
  "Background",
  "Experiences",
  "Domains",
  "Connections",
] as const;

const TRAITS = ["Agility", "Strength", "Finesse", "Instinct", "Presence", "Knowledge"] as const;
const TRAIT_MODIFIER_OPTIONS = ["+2", "+1", "+1", "+0", "+0", "-1"] as const;

type TraitName = (typeof TRAITS)[number];

// Precomputed — the modifier pool never changes at runtime.
const MODIFIER_TOTALS: Record<string, number> = TRAIT_MODIFIER_OPTIONS.reduce<Record<string, number>>(
  (acc, modifier) => {
    acc[modifier] = (acc[modifier] ?? 0) + 1;
    return acc;
  },
  {},
);

// ---------------------------------------------------------------------------
// Builder state
// ---------------------------------------------------------------------------

type BuilderState = {
  name: string;
  pronouns: string;
  description: string;
  className: string;
  subclassName: string;
  ancestry: string;
  community: string;
  heritageNotes: string;
  traits: Record<TraitName, string>;
  level: number;
  evasion: number;
  hitPoints: number;
  stress: number;
  hope: number;
  proficiency: number;
  armorScore: string;
  armorName: string;
  armorThresholdMajor: string;
  armorThresholdSevere: string;
  primaryWeapon: string;
  secondaryWeapon: string;
  weaponNotes: string;
  potionChoice: string;
  classItemChoice: string;
  inventoryNotes: string;
  background: string;
  experienceOne: string;
  experienceTwo: string;
  domainCardOne: string;
  domainCardTwo: string;
  connectionNotes: string;
};

const INITIAL_STATE: BuilderState = {
  name: "",
  pronouns: "",
  description: "",
  className: "",
  subclassName: "",
  ancestry: "",
  community: "",
  heritageNotes: "",
  traits: {
    Agility: "",
    Strength: "",
    Finesse: "",
    Instinct: "",
    Presence: "",
    Knowledge: "",
  },
  level: 1,
  evasion: 0,
  hitPoints: 0,
  stress: 6,
  hope: 2,
  proficiency: 1,
  armorScore: "",
  armorName: "",
  armorThresholdMajor: "",
  armorThresholdSevere: "",
  primaryWeapon: "",
  secondaryWeapon: "",
  weaponNotes: "",
  potionChoice: "",
  classItemChoice: "",
  inventoryNotes: "Torch, 50 feet of rope, basic supplies, and a handful of gold",
  background: "",
  experienceOne: "",
  experienceTwo: "",
  domainCardOne: "",
  domainCardTwo: "",
  connectionNotes: "",
};

// ---------------------------------------------------------------------------
// Pure utilities
// ---------------------------------------------------------------------------

function titleCase(value: string): string {
  return value.toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asExperiences(value: unknown): Array<{ name: string; modifier: number }> {
  return Array.isArray(value)
    ? value.filter(
        (entry): entry is { name: string; modifier: number } =>
          typeof entry === "object" &&
          entry !== null &&
          typeof (entry as { name?: unknown }).name === "string" &&
          typeof (entry as { modifier?: unknown }).modifier === "number",
      )
    : [];
}

function asDomainCards(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

/** Derive armor fields from a selected equipment option and the current level. */
function deriveArmorFields(
  armor: EquipmentOption | null,
  level: number,
): Pick<BuilderState, "armorScore" | "armorThresholdMajor" | "armorThresholdSevere"> {
  if (!armor) {
    return { armorScore: "", armorThresholdMajor: "", armorThresholdSevere: "" };
  }
  return {
    armorScore: armor.base_score ? String(armor.base_score) : "",
    armorThresholdMajor: armor.thresholds_major ? String(armor.thresholds_major + level) : "",
    armorThresholdSevere: armor.thresholds_severe ? String(armor.thresholds_severe + level) : "",
  };
}

function buildModifierInventory(traits: Record<TraitName, string>) {
  return Object.fromEntries(
    Object.entries(MODIFIER_TOTALS).map(([modifier, total]) => {
      const used = Object.values(traits).filter((v) => v === modifier).length;
      return [modifier, { total, used, remaining: Math.max(0, total - used) }];
    }),
  );
}

// ---------------------------------------------------------------------------
// State hydration / payload builders
// ---------------------------------------------------------------------------

function buildStateFromCharacter(character: Character): BuilderState {
  const payload = character.data_json ?? {};
  const traits = payload.traits as Record<string, unknown> | undefined;
  const experiences = asExperiences(payload.experiences);
  const domainCards = asDomainCards(payload.domain_cards);

  return {
    name: character.name,
    pronouns: asString(payload.pronouns),
    description: asString(payload.description),
    className: character.class_name,
    subclassName: character.subclass_name ?? "",
    ancestry: character.ancestry ?? "",
    community: character.community ?? "",
    heritageNotes: asString(payload.heritage_notes),
    traits: {
      Agility: typeof traits?.Agility === "string" ? traits.Agility : "",
      Strength: typeof traits?.Strength === "string" ? traits.Strength : "",
      Finesse: typeof traits?.Finesse === "string" ? traits.Finesse : "",
      Instinct: typeof traits?.Instinct === "string" ? traits.Instinct : "",
      Presence: typeof traits?.Presence === "string" ? traits.Presence : "",
      Knowledge: typeof traits?.Knowledge === "string" ? traits.Knowledge : "",
    },
    level: character.level,
    evasion: character.evasion ?? 0,
    hitPoints: getCharacterMaxHitPoints(character),
    stress: getCharacterMaxStress(character),
    hope: character.hope ?? 2,
    proficiency: asNumber(payload.proficiency, 1),
    armorScore:
      character.armor !== null && character.armor !== undefined ? String(character.armor) : "",
    armorName: asString(payload.armor_name),
    armorThresholdMajor: asString(payload.armor_threshold_major),
    armorThresholdSevere: asString(payload.armor_threshold_severe),
    primaryWeapon: asString(payload.primary_weapon),
    secondaryWeapon: asString(payload.secondary_weapon),
    weaponNotes: asString(payload.weapon_notes),
    potionChoice: asString(payload.potion_choice),
    classItemChoice: asString(payload.class_item_choice),
    inventoryNotes: asString(payload.inventory_notes),
    background: asString(payload.background),
    experienceOne: experiences[0]?.name ?? "",
    experienceTwo: experiences[1]?.name ?? "",
    domainCardOne: domainCards[0] ?? "",
    domainCardTwo: domainCards[1] ?? "",
    connectionNotes: asString(payload.connection_notes),
  };
}

function buildCharacterPayload(
  builder: BuilderState,
  classDetail: ClassDetail | null,
  subclassDetail: SubclassDetail | null,
  currentCharacter?: Character | null,
): CharacterUpsertPayload {
  const existingPayload = currentCharacter?.data_json ?? {};
  const existingExperiences = asExperiences(existingPayload.experiences);
  const existingDomainCards = asDomainCards(existingPayload.domain_cards);
  const experienceModifierMap = new Map(
    existingExperiences.map((entry) => [entry.name, entry.modifier]),
  );

  return {
    name: builder.name.trim(),
    class_name: builder.className,
    subclass_name: builder.subclassName,
    ancestry: builder.ancestry,
    community: builder.community,
    level: builder.level,
    evasion: builder.evasion,
    armor: builder.armorScore ? Number(builder.armorScore) : null,
    hit_points: currentCharacter?.hit_points ?? 0,
    stress: currentCharacter?.stress ?? 0,
    hope: currentCharacter?.hope ?? builder.hope,
    notes: builder.background || null,
    data_json: {
      ...existingPayload,
      pronouns: builder.pronouns,
      description: builder.description,
      heritage_notes: builder.heritageNotes,
      traits: builder.traits,
      proficiency: builder.proficiency,
      max_hit_points: builder.hitPoints,
      max_stress: builder.stress,
      armor_name: builder.armorName,
      armor_threshold_major: builder.armorThresholdMajor,
      armor_threshold_severe: builder.armorThresholdSevere,
      primary_weapon: builder.primaryWeapon,
      secondary_weapon: builder.secondaryWeapon,
      weapon_notes: builder.weaponNotes,
      potion_choice: builder.potionChoice,
      class_item_choice: builder.classItemChoice,
      inventory_notes: builder.inventoryNotes,
      background: builder.background,
      experiences: [
        {
          name: builder.experienceOne,
          modifier: experienceModifierMap.get(builder.experienceOne) ?? 2,
        },
        {
          name: builder.experienceTwo,
          modifier: experienceModifierMap.get(builder.experienceTwo) ?? 2,
        },
        ...existingExperiences.slice(2),
      ].filter((entry) => entry.name.trim()),
      domain_cards: [
        ...[builder.domainCardOne, builder.domainCardTwo].filter(Boolean),
        ...existingDomainCards.filter((_, index) => index >= 2),
      ],
      class_domains: classDetail?.domains ?? [],
      class_items: classDetail?.class_items ?? [],
      subclass_spellcast_trait: subclassDetail?.spellcast_trait_type ?? null,
      connection_notes: builder.connectionNotes,
    },
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CharacterForm({
  onSaved,
  focusMode = false,
  initialCharacter = null,
  onCancel,
  submitLabel,
}: CharacterFormProps) {
  const isEditing = Boolean(initialCharacter);

  const [builder, setBuilder] = useState<BuilderState>(
    initialCharacter ? buildStateFromCharacter(initialCharacter) : INITIAL_STATE,
  );
  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
  const [ancestries, setAncestries] = useState<AncestryOption[]>([]);
  const [communities, setCommunities] = useState<CommunityOption[]>([]);
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [subclassDetail, setSubclassDetail] = useState<SubclassDetail | null>(null);
  const [domainCards, setDomainCards] = useState<DomainCardOption[]>([]);
  const [primaryWeapons, setPrimaryWeapons] = useState<EquipmentOption[]>([]);
  const [secondaryWeapons, setSecondaryWeapons] = useState<EquipmentOption[]>([]);
  const [armorOptions, setArmorOptions] = useState<EquipmentOption[]>([]);
  const [potionOptions, setPotionOptions] = useState<EquipmentOption[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(
    isEditing
      ? "Update any step, then save the revised sheet."
      : "Choose a class to begin the official Daggerheart flow.",
  );

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Sync when a different character is passed in from the parent.
  useEffect(() => {
    setBuilder(initialCharacter ? buildStateFromCharacter(initialCharacter) : INITIAL_STATE);
    setActiveStep(0);
    setStatus(
      initialCharacter
        ? "Update any step, then save the revised sheet."
        : "Choose a class to begin the official Daggerheart flow.",
    );
  }, [initialCharacter]);

  // Load all static lookup data once on mount.
  useEffect(() => {
    Promise.all([
      fetchClasses(),
      fetchAncestries(),
      fetchCommunities(),
      fetchEquipment("Primary Weapon", 1),
      fetchEquipment("Secondary Weapon", 1),
      fetchEquipment("Armor", 1),
      fetchEquipment("Consumable"),
    ])
      .then(
        ([
          loadedClasses,
          loadedAncestries,
          loadedCommunities,
          loadedPrimaryWeapons,
          loadedSecondaryWeapons,
          loadedArmor,
          loadedConsumables,
        ]) => {
          setClassOptions(loadedClasses);
          setAncestries(loadedAncestries);
          setCommunities(loadedCommunities);
          setPrimaryWeapons(loadedPrimaryWeapons);
          setSecondaryWeapons(loadedSecondaryWeapons);
          setArmorOptions(loadedArmor);
          setPotionOptions(
            loadedConsumables.filter((item) =>
              ["MINOR HEALTH POTION", "MINOR STAMINA POTION"].includes(item.item_name),
            ),
          );
        },
      )
      .catch(() => {
        setStatus("Could not load one or more SQL-backed builder options.");
      });
  }, []);

  // Load class detail and domain cards when class changes.
  useEffect(() => {
    if (!builder.className) {
      setClassDetail(null);
      setDomainCards([]);
      return;
    }

    Promise.all([fetchClassDetail(builder.className), fetchDomainCards(builder.className, 1)])
      .then(([detail, cards]) => {
        setClassDetail(detail);
        setDomainCards(cards);
        setBuilder((current) => ({
          ...current,
          evasion: isEditing ? current.evasion : detail.starting_evasion,
          hitPoints: isEditing ? current.hitPoints : detail.starting_hit_points,
          classItemChoice: current.classItemChoice || detail.class_items[0] || "",
        }));
      })
      .catch(() => {
        setStatus("Could not load the selected class details or domain cards.");
      });
  }, [builder.className]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load subclass detail when subclass changes.
  useEffect(() => {
    if (!builder.subclassName) {
      setSubclassDetail(null);
      return;
    }

    fetchSubclassDetail(builder.subclassName)
      .then(setSubclassDetail)
      .catch(() => {
        setStatus("Could not load the selected subclass details.");
      });
  }, [builder.subclassName]);

  // Recompute armor derived fields when level changes while armor is already selected.
  // This is the single source of truth for armor derivation — the armor onChange
  // handler calls deriveArmorFields directly so this effect only needs to handle
  // the level-change case.
  useEffect(() => {
    if (!builder.armorName) return;

    const armor = armorOptions.find((item) => item.item_name === builder.armorName) ?? null;
    if (!armor) return;

    setBuilder((current) => ({
      ...current,
      ...deriveArmorFields(armor, current.level),
    }));
  }, [builder.level, builder.armorName, armorOptions]);

  // ---------------------------------------------------------------------------
  // Derived values (memoized)
  // ---------------------------------------------------------------------------

  const activeClass = useMemo(
    () => classOptions.find((option) => option.class_name === builder.className) ?? null,
    [builder.className, classOptions],
  );

  const selectedDomainCardOne = useMemo(
    () => domainCards.find((card) => card.card_name === builder.domainCardOne) ?? null,
    [domainCards, builder.domainCardOne],
  );

  const selectedDomainCardTwo = useMemo(
    () => domainCards.find((card) => card.card_name === builder.domainCardTwo) ?? null,
    [domainCards, builder.domainCardTwo],
  );

  const selectedPrimaryWeapon = useMemo(
    () => primaryWeapons.find((item) => item.item_name === builder.primaryWeapon) ?? null,
    [primaryWeapons, builder.primaryWeapon],
  );

  const selectedSecondaryWeapon = useMemo(
    () => secondaryWeapons.find((item) => item.item_name === builder.secondaryWeapon) ?? null,
    [secondaryWeapons, builder.secondaryWeapon],
  );

  const selectedArmor = useMemo(
    () => armorOptions.find((item) => item.item_name === builder.armorName) ?? null,
    [armorOptions, builder.armorName],
  );

  const selectedPotion = useMemo(
    () => potionOptions.find((item) => item.item_name === builder.potionChoice) ?? null,
    [potionOptions, builder.potionChoice],
  );

  const activeAncestry = useMemo(
    () => ancestries.find((option) => option.ancestry_name === builder.ancestry) ?? null,
    [ancestries, builder.ancestry],
  );

  const activeCommunity = useMemo(
    () => communities.find((option) => option.community_name === builder.community) ?? null,
    [communities, builder.community],
  );

  const classItemOptions = useMemo(
    () => classDetail?.class_items.filter(Boolean) ?? [],
    [classDetail],
  );

  const modifierInventory = useMemo(
    () => buildModifierInventory(builder.traits),
    [builder.traits],
  );

  const builderCompletion = useMemo(() => {
    const missing: string[] = [];

    // Trait validation lives here so builderCompletion always reflects current traits.
    const usedTraitModifiers = Object.values(builder.traits).filter(Boolean);
    const traitAssignmentValid =
      TRAITS.every((trait) => builder.traits[trait] !== "") &&
      TRAIT_MODIFIER_OPTIONS.every(
        (modifier) =>
          usedTraitModifiers.filter((v) => v === modifier).length ===
          TRAIT_MODIFIER_OPTIONS.filter((v) => v === modifier).length,
      );

    if (!builder.name.trim()) missing.push("character name");
    if (!builder.className) missing.push("class");
    if (!builder.subclassName) missing.push("subclass");
    if (!builder.ancestry) missing.push("ancestry");
    if (!builder.community) missing.push("community");
    if (!traitAssignmentValid) missing.push("valid trait spread");
    if (!builder.primaryWeapon) missing.push("primary weapon");
    if (!builder.armorName) missing.push("armor");
    if (!builder.potionChoice) missing.push("potion");
    if (!builder.classItemChoice) missing.push("class item");
    if (!builder.background.trim()) missing.push("background");
    if (!builder.experienceOne.trim()) missing.push("experience one");
    if (!builder.experienceTwo.trim()) missing.push("experience two");
    if (!builder.domainCardOne) missing.push("domain card one");
    if (!builder.domainCardTwo) missing.push("domain card two");
    if (!builder.connectionNotes.trim()) missing.push("connection notes");

    return { complete: missing.length === 0, missing, traitAssignmentValid };
  }, [builder]);

  // ---------------------------------------------------------------------------
  // Updaters
  // ---------------------------------------------------------------------------

  function updateField<K extends keyof BuilderState>(field: K, value: BuilderState[K]): void {
    setBuilder((current) => ({ ...current, [field]: value }));
  }

  function updateTrait(trait: TraitName, value: string): void {
    setBuilder((current) => ({
      ...current,
      traits: { ...current.traits, [trait]: value },
    }));
  }

  /** Handle class selection: reset all class-dependent choices. */
  function handleClassChange(nextClass: string): void {
    setBuilder((current) => ({
      ...current,
      className: nextClass,
      subclassName: "",
      domainCardOne: "",
      domainCardTwo: "",
      classItemChoice: "",
    }));
  }

  /** Handle armor selection: derive all armor fields in one update. */
  function handleArmorChange(armorName: string): void {
    const armor = armorOptions.find((item) => item.item_name === armorName) ?? null;
    setBuilder((current) => ({
      ...current,
      armorName,
      ...deriveArmorFields(armor, current.level),
    }));
  }

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------

  async function handleSave(): Promise<void> {
    if (isSubmitting) return;

    if (activeStep !== STEPS.length - 1) {
      setStatus("You can only save at the end of the builder.");
      return;
    }

    if (!builderCompletion.complete) {
      setStatus(
        `Finish these required choices before saving: ${builderCompletion.missing.join(", ")}.`,
      );
      return;
    }

    setIsSubmitting(true);

    const payload = buildCharacterPayload(builder, classDetail, subclassDetail, initialCharacter);

    try {
      const saved = initialCharacter
        ? await updateCharacter(initialCharacter.id, payload)
        : await createCharacter(payload);

      setStatus(initialCharacter ? `Updated ${saved.name}.` : `Saved ${saved.name}.`);

      if (!initialCharacter) {
        setBuilder(INITIAL_STATE);
        setClassDetail(null);
        setSubclassDetail(null);
        setActiveStep(0);
      }

      onSaved(saved);
    } catch {
      setStatus(initialCharacter ? "Character update failed." : "Character save failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <section
      className={`panel character-form ${styles.characterFormScope} ${focusMode ? "builder-focus-panel" : ""}`}
    >
      <div className="panel-header">
        <div>
          <p className="eyebrow">Character Builder</p>
          <h2>Follow the official creation flow</h2>
        </div>
        <p className="status" aria-live="polite">
          {status}
        </p>
      </div>

      {focusMode ? (
        <section className="builder-intro-card">
          <div>
            <p className="eyebrow">Focused Creation</p>
            <h3>Build one hero at a time.</h3>
          </div>
          <p className="muted">
            This screen is reserved for the character builder so you can stay inside the official
            Daggerheart flow without the roster competing for attention.
          </p>
        </section>
      ) : null}

      <div className="stepper">
        {STEPS.map((step, index) => (
          <button
            key={step}
            className={`step-chip ${index === activeStep ? "active" : ""}`}
            onClick={() => setActiveStep(index)}
            type="button"
          >
            {index + 1}. {step}
          </button>
        ))}
      </div>

      <section className={`builder-shell ${focusMode ? "builder-shell-focused" : ""}`}>
        <div className="builder-main">

          {/* ── Step 1: Class ── */}
          {activeStep === 0 ? (
            <div className="step-section">
              <h3>Step 1: Choose a Class and Subclass</h3>
              <p className="muted">
                Start with class, subclass, and identity details. Pronouns and description are optional.
              </p>

              <div className="grid-form">
                <label>
                  Name
                  <input
                    value={builder.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                </label>

                <label>
                  Pronouns
                  <input
                    value={builder.pronouns}
                    onChange={(e) => updateField("pronouns", e.target.value)}
                  />
                </label>

                <label className="wide">
                  Character Description (Optional)
                  <textarea
                    rows={3}
                    value={builder.description}
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </label>

                <label>
                  Class
                  <select
                    value={builder.className}
                    onChange={(e) => handleClassChange(e.target.value)}
                  >
                    <option value="">Choose a class</option>
                    {classOptions.map((option) => (
                      <option key={option.class_name} value={option.class_name}>
                        {option.class_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Subclass
                  <select
                    disabled={!builder.className}
                    value={builder.subclassName}
                    onChange={(e) => updateField("subclassName", e.target.value)}
                  >
                    <option value="">Choose a subclass</option>
                    {[activeClass?.subclass1_name, activeClass?.subclass2_name]
                      .filter((value): value is string => Boolean(value))
                      .map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                  </select>
                </label>
              </div>

              {classDetail ? (
                <article className="detail-card">
                  <h4>{classDetail.class_name}</h4>
                  <p>
                    Domains: {classDetail.domains.join(" / ")} | Starting Evasion:{" "}
                    {classDetail.starting_evasion} | Starting HP: {classDetail.starting_hit_points}
                  </p>
                  <p className="muted">Class Items: {classDetail.class_items.join(" or ")}</p>
                  <p>{classDetail.hope_feature}</p>
                  <p>{classDetail.class_feature}</p>
                </article>
              ) : null}

              {subclassDetail ? (
                <article className="detail-card">
                  <h4>{subclassDetail.subclass_name}</h4>
                  <p className="muted">Spellcast Trait: {subclassDetail.spellcast_trait_type}</p>
                  <p>{subclassDetail.foundation_feature}</p>
                </article>
              ) : null}
            </div>
          ) : null}

          {/* ── Step 2: Heritage ── */}
          {activeStep === 1 ? (
            <div className="step-section">
              <h3>Step 2: Choose Your Heritage</h3>
              <div className="grid-form">
                <label>
                  Ancestry
                  <select
                    value={builder.ancestry}
                    onChange={(e) => updateField("ancestry", e.target.value)}
                  >
                    <option value="">Choose an ancestry</option>
                    {ancestries.map((option) => (
                      <option key={option.ancestry_name} value={option.ancestry_name}>
                        {option.ancestry_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Community
                  <select
                    value={builder.community}
                    onChange={(e) => updateField("community", e.target.value)}
                  >
                    <option value="">Choose a community</option>
                    {communities.map((option) => (
                      <option key={option.community_name} value={option.community_name}>
                        {titleCase(option.community_name)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="wide">
                  Heritage Notes
                  <textarea
                    rows={3}
                    value={builder.heritageNotes}
                    onChange={(e) => updateField("heritageNotes", e.target.value)}
                    placeholder="Use this for mixed ancestry notes or narrative heritage details."
                  />
                </label>
              </div>

              {activeAncestry ? (
                <article className="detail-card">
                  <h4>{activeAncestry.ancestry_name}</h4>
                  <p>{activeAncestry.ancestry_feature1}</p>
                  <p>{activeAncestry.ancestry_feature2}</p>
                </article>
              ) : null}

              {activeCommunity ? (
                <article className="detail-card">
                  <h4>{titleCase(activeCommunity.community_name)}</h4>
                  <p>{activeCommunity.community_feature}</p>
                </article>
              ) : null}
            </div>
          ) : null}

          {/* ── Step 3: Traits ── */}
          {activeStep === 2 ? (
            <div className="step-section">
              <h3>Step 3: Assign Character Traits</h3>
              <p className="muted">
                You must use each modifier a limited number of times: one `+2`, two `+1`s, two
                `+0`s, and one `-1`.
              </p>
              <article className="traitHelpCard">
                <h4>Available Modifiers</h4>
                <div className="traitCounterList">
                  {Object.entries(modifierInventory).map(([modifier, summary]) => (
                    <p key={modifier}>
                      <strong>{modifier}</strong>: {summary.remaining} remaining of {summary.total}
                    </p>
                  ))}
                </div>
              </article>
              <div className="trait-grid">
                {TRAITS.map((trait) => (
                  <label key={trait} className="trait-row">
                    <span>{trait}</span>
                    <select
                      value={builder.traits[trait]}
                      onChange={(e) => updateTrait(trait, e.target.value)}
                    >
                      <option value="">Assign modifier</option>
                      {TRAIT_MODIFIER_OPTIONS.map((modifier, index) => (
                        <option
                          key={`${modifier}-${index}`}
                          value={modifier}
                          disabled={
                            builder.traits[trait] !== modifier &&
                            modifierInventory[modifier].remaining === 0
                          }
                        >
                          {modifier}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <p
                className={`status ${builderCompletion.traitAssignmentValid ? "success-text" : ""}`}
              >
                {builderCompletion.traitAssignmentValid
                  ? "Trait spread is valid."
                  : "Finish assigning all six modifiers."}
              </p>
            </div>
          ) : null}

          {/* ── Step 4: Core Stats ── */}
          {activeStep === 3 ? (
            <div className="step-section">
              <h3>Step 4: Record Additional Character Information</h3>
              <div className="grid-form">
                <label>
                  Level
                  <input
                    type="number"
                    min="1"
                    value={builder.level}
                    onChange={(e) => updateField("level", Number(e.target.value) || 1)}
                  />
                </label>
                <label>
                  Evasion
                  <input
                    type="number"
                    min="0"
                    value={builder.evasion}
                    onChange={(e) => updateField("evasion", Number(e.target.value) || 0)}
                  />
                </label>
                <label>
                  Max Hit Points
                  <input
                    type="number"
                    min="0"
                    value={builder.hitPoints}
                    onChange={(e) => updateField("hitPoints", Number(e.target.value) || 0)}
                  />
                </label>
                <label>
                  Max Stress
                  <input
                    type="number"
                    min="0"
                    value={builder.stress}
                    onChange={(e) => updateField("stress", Number(e.target.value) || 0)}
                  />
                </label>
                <label>
                  Hope
                  <input
                    type="number"
                    min="0"
                    value={builder.hope}
                    onChange={(e) => updateField("hope", Number(e.target.value) || 0)}
                  />
                </label>
                <label>
                  Proficiency
                  <input
                    type="number"
                    min="1"
                    value={builder.proficiency}
                    onChange={(e) => updateField("proficiency", Number(e.target.value) || 1)}
                  />
                </label>
              </div>
            </div>
          ) : null}

          {/* ── Step 5: Equipment ── */}
          {activeStep === 4 ? (
            <div className="step-section">
              <h3>Step 5: Choose Your Starting Equipment</h3>
              <div className="grid-form">
                <label>
                  Primary Weapon
                  <select
                    value={builder.primaryWeapon}
                    onChange={(e) => updateField("primaryWeapon", e.target.value)}
                  >
                    <option value="">Choose a tier 1 primary weapon</option>
                    {primaryWeapons.map((item) => (
                      <option key={item.item_name} value={item.item_name}>
                        {item.item_name} ({item.trait_name} / {item.range_name} /{" "}
                        {item.damage_text})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Secondary Weapon
                  <select
                    value={builder.secondaryWeapon}
                    onChange={(e) => updateField("secondaryWeapon", e.target.value)}
                  >
                    <option value="">Choose an optional tier 1 secondary weapon</option>
                    {secondaryWeapons.map((item) => (
                      <option key={item.item_name} value={item.item_name}>
                        {item.item_name} ({item.trait_name} / {item.range_name} /{" "}
                        {item.damage_text})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Armor
                  <select
                    value={builder.armorName}
                    onChange={(e) => handleArmorChange(e.target.value)}
                  >
                    <option value="">Choose tier 1 armor</option>
                    {armorOptions.map((item) => (
                      <option key={item.item_name} value={item.item_name}>
                        {item.item_name} (Score {item.base_score} / {item.thresholds_major}-
                        {item.thresholds_severe})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Armor Score
                  <input
                    value={builder.armorScore}
                    onChange={(e) => updateField("armorScore", e.target.value)}
                    placeholder="Base score plus permanent bonuses"
                  />
                </label>

                <label>
                  Armor Threshold 1
                  <input
                    value={builder.armorThresholdMajor}
                    onChange={(e) => updateField("armorThresholdMajor", e.target.value)}
                  />
                </label>

                <label>
                  Armor Threshold 2
                  <input
                    value={builder.armorThresholdSevere}
                    onChange={(e) => updateField("armorThresholdSevere", e.target.value)}
                  />
                </label>

                <label>
                  Potion
                  <select
                    value={builder.potionChoice}
                    onChange={(e) => updateField("potionChoice", e.target.value)}
                  >
                    <option value="">Choose a potion</option>
                    {potionOptions.map((item) => (
                      <option key={item.item_name} value={item.item_name}>
                        {titleCase(item.item_name)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Class-Specific Item
                  <select
                    value={builder.classItemChoice}
                    onChange={(e) => updateField("classItemChoice", e.target.value)}
                    disabled={classItemOptions.length === 0}
                  >
                    <option value="">Choose a class item</option>
                    {classItemOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="wide">
                  Weapon and Damage Notes
                  <textarea
                    rows={3}
                    value={builder.weaponNotes}
                    onChange={(e) => updateField("weaponNotes", e.target.value)}
                    placeholder="Record damage dice, equipped weapon setup, and any tier 1 notes."
                  />
                </label>

                <label className="wide">
                  Inventory
                  <textarea
                    rows={3}
                    value={builder.inventoryNotes}
                    onChange={(e) => updateField("inventoryNotes", e.target.value)}
                  />
                </label>
              </div>

              {selectedPrimaryWeapon ? (
                <article className="detail-card">
                  <h4>{selectedPrimaryWeapon.item_name}</h4>
                  <p className="muted">
                    {selectedPrimaryWeapon.trait_name} | {selectedPrimaryWeapon.range_name} |{" "}
                    {selectedPrimaryWeapon.damage_text} {selectedPrimaryWeapon.damage_type ?? ""}
                  </p>
                  <p>{selectedPrimaryWeapon.feature_text ?? selectedPrimaryWeapon.description_text}</p>
                </article>
              ) : null}

              {selectedSecondaryWeapon ? (
                <article className="detail-card">
                  <h4>{selectedSecondaryWeapon.item_name}</h4>
                  <p className="muted">
                    {selectedSecondaryWeapon.trait_name} | {selectedSecondaryWeapon.range_name} |{" "}
                    {selectedSecondaryWeapon.damage_text}{" "}
                    {selectedSecondaryWeapon.damage_type ?? ""}
                  </p>
                  <p>
                    {selectedSecondaryWeapon.feature_text ??
                      selectedSecondaryWeapon.description_text}
                  </p>
                </article>
              ) : null}

              {selectedArmor ? (
                <article className="detail-card">
                  <h4>{selectedArmor.item_name}</h4>
                  <p className="muted">
                    Base Score {selectedArmor.base_score ?? "-"} | Thresholds{" "}
                    {selectedArmor.thresholds_major ?? "-"} /{" "}
                    {selectedArmor.thresholds_severe ?? "-"}
                  </p>
                  <p>{selectedArmor.feature_text ?? selectedArmor.description_text}</p>
                </article>
              ) : null}

              {selectedPotion ? (
                <article className="detail-card">
                  <h4>{titleCase(selectedPotion.item_name)}</h4>
                  <p>{selectedPotion.description_text}</p>
                </article>
              ) : null}

              {builder.classItemChoice ? (
                <article className="detail-card">
                  <h4>Chosen Class Item</h4>
                  <p>{builder.classItemChoice}</p>
                </article>
              ) : null}
            </div>
          ) : null}

          {/* ── Step 6: Background ── */}
          {activeStep === 5 ? (
            <div className="step-section">
              <h3>Step 6: Create Your Background</h3>
              <textarea
                className="full-textarea"
                rows={8}
                value={builder.background}
                onChange={(e) => updateField("background", e.target.value)}
                placeholder="Answer class-guide background questions or write the character's backstory."
              />
            </div>
          ) : null}

          {/* ── Step 7: Experiences ── */}
          {activeStep === 6 ? (
            <div className="step-section">
              <h3>Step 7: Create Your Experiences</h3>
              <div className="grid-form">
                <label>
                  Experience One (+2)
                  <input
                    value={builder.experienceOne}
                    onChange={(e) => updateField("experienceOne", e.target.value)}
                    placeholder="Scholar"
                  />
                </label>
                <label>
                  Experience Two (+2)
                  <input
                    value={builder.experienceTwo}
                    onChange={(e) => updateField("experienceTwo", e.target.value)}
                    placeholder="Catch Me If You Can"
                  />
                </label>
              </div>
            </div>
          ) : null}

          {/* ── Step 8: Domain Cards ── */}
          {activeStep === 7 ? (
            <div className="step-section">
              <h3>Step 8: Choose Domain Cards</h3>
              <p className="muted">
                These are real level 1 domain cards filtered from SQL by the selected class domains.
              </p>
              <article className="detail-card">
                <h4>{builder.className || "Class domains"}</h4>
                <p>{classDetail ? classDetail.domains.join(" / ") : "Choose a class first."}</p>
              </article>
              <div className="grid-form">
                <label>
                  Domain Card One
                  <select
                    value={builder.domainCardOne}
                    onChange={(e) => updateField("domainCardOne", e.target.value)}
                    disabled={!builder.className}
                  >
                    <option value="">Choose first card</option>
                    {domainCards.map((card) => (
                      <option
                        key={`${card.domain_name}-${card.card_name}`}
                        value={card.card_name}
                      >
                        {card.card_name} ({card.domain_name} L{card.card_level})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Domain Card Two
                  <select
                    value={builder.domainCardTwo}
                    onChange={(e) => updateField("domainCardTwo", e.target.value)}
                    disabled={!builder.className}
                  >
                    <option value="">Choose second card</option>
                    {domainCards.map((card) => (
                      <option
                        key={`${card.domain_name}-${card.card_name}-two`}
                        value={card.card_name}
                      >
                        {card.card_name} ({card.domain_name} L{card.card_level})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {selectedDomainCardOne ? (
                <article className="detail-card">
                  <h4>{selectedDomainCardOne.card_name}</h4>
                  <p className="muted">
                    {selectedDomainCardOne.domain_name} | {selectedDomainCardOne.card_type} |
                    Recall Cost {selectedDomainCardOne.recall_cost ?? "-"}
                  </p>
                  <p>{selectedDomainCardOne.card_text}</p>
                </article>
              ) : null}

              {selectedDomainCardTwo &&
              selectedDomainCardTwo.card_name !== selectedDomainCardOne?.card_name ? (
                <article className="detail-card">
                  <h4>{selectedDomainCardTwo.card_name}</h4>
                  <p className="muted">
                    {selectedDomainCardTwo.domain_name} | {selectedDomainCardTwo.card_type} |
                    Recall Cost {selectedDomainCardTwo.recall_cost ?? "-"}
                  </p>
                  <p>{selectedDomainCardTwo.card_text}</p>
                </article>
              ) : null}
            </div>
          ) : null}

          {/* ── Step 9: Connections ── */}
          {activeStep === 8 ? (
            <div className="step-section">
              <h3>Step 9: Create Your Connections</h3>
              <textarea
                className="full-textarea"
                rows={8}
                value={builder.connectionNotes}
                onChange={(e) => updateField("connectionNotes", e.target.value)}
                placeholder="Record proposed PC connections, accepted ties, and table notes."
              />
            </div>
          ) : null}

          {/* ── Navigation ── */}
          <div className="builder-actions">
            <button
              className="secondary-button"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
              type="button"
            >
              Previous
            </button>
            <button
              className="secondary-button"
              disabled={activeStep === STEPS.length - 1}
              onClick={() => setActiveStep((current) => Math.min(STEPS.length - 1, current + 1))}
              type="button"
            >
              Next
            </button>
            {activeStep === STEPS.length - 1 ? (
              <>
                {onCancel ? (
                  <button className="secondary-button" onClick={onCancel} type="button">
                    Cancel
                  </button>
                ) : null}
                <button
                  className="primary-button"
                  disabled={!builderCompletion.complete || isSubmitting}
                  onClick={handleSave}
                  type="button"
                >
                  {isSubmitting
                    ? "Saving..."
                    : (submitLabel ?? (initialCharacter ? "Save Changes" : "Save Character"))}
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className={`builder-sidebar ${focusMode ? "builder-sidebar-focused" : ""}`}>
          <article className="detail-card">
            <h4>Current Summary</h4>
            <p>
              {builder.name || "Unnamed Hero"}
              {builder.pronouns ? ` (${builder.pronouns})` : ""}
            </p>
            <p>
              {builder.className || "No class"}{" "}
              {builder.subclassName ? `/ ${builder.subclassName}` : ""}
            </p>
            <p>
              {builder.ancestry || "No ancestry"}{" "}
              {builder.community ? `/ ${titleCase(builder.community)}` : ""}
            </p>
            <p>
              Level {builder.level} | Evasion {builder.evasion || "-"} | HP 0/
              {builder.hitPoints || "-"} | Stress 0/{builder.stress} | Hope {builder.hope}
            </p>
          </article>

          <article className="detail-card">
            <h4>Save Requirements</h4>
            {builderCompletion.complete ? (
              <p className="success-text">
                All required builder choices are complete. Save unlocks on Step 9.
              </p>
            ) : (
              <p className="muted">Still needed: {builderCompletion.missing.join(", ")}.</p>
            )}
          </article>

          {classDetail ? (
            <article className="detail-card">
              <h4>Class Reference</h4>
              <p className="muted">Domains: {classDetail.domains.join(" / ")}</p>
              <p>{classDetail.hope_feature}</p>
            </article>
          ) : null}

          {subclassDetail ? (
            <article className="detail-card">
              <h4>Subclass Reference</h4>
              <p className="muted">Spellcast Trait: {subclassDetail.spellcast_trait_type}</p>
              <p>{subclassDetail.foundation_feature}</p>
            </article>
          ) : null}
        </aside>
      </section>
    </section>
  );
}