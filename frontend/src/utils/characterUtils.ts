import type { Character } from "../types";

function readNumericValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return null;
    }

    const parsedValue = Number(trimmedValue);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
}

function readNumericPayloadValue(payload: Record<string, unknown>, keys: string[], fallback: number) {
  for (const key of keys) {
    const value = readNumericValue(payload[key]);
    if (value !== null) {
      return value;
    }
  }

  return fallback;
}

export function getCharacterMaxHitPoints(character: Character) {
  return readNumericPayloadValue(character.data_json ?? {}, ["max_hit_points"], character.hit_points ?? 0);
}

export function getCharacterMaxStress(character: Character) {
  return readNumericPayloadValue(character.data_json ?? {}, ["max_stress"], character.stress ?? 0);
}

export function getCharacterArmorSlots(character: Character) {
  return readNumericPayloadValue(character.data_json ?? {}, ["armor_slots"], character.armor ?? 0);
}

export function clampTracker(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}
