// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
export type CharacterDataJson = {
  max_hit_points?: number | string;
  max_stress?: number | string;
  armor_slots?: number | string;
  [key: string]: unknown;
};

export type Character = {
  id: number;
  name: string;
  class_name: string;
  subclass_name: string | null;
  ancestry: string | null;
  community: string | null;
  level: number;
  evasion: number | null;
  armor: number | null;
  hit_points: number | null;
  stress: number | null;
  hope: number | null;
  notes: string | null;
  data_json: CharacterDataJson;
  created_at: string;
  updated_at: string;
};

export type CharacterUpsertPayload = Omit<Character, "id" | "created_at" | "updated_at">;

export type CharacterTrackersUpdate = {
  hit_points?: number;
  stress?: number;
  hope?: number;
  armor?: number;
  gold_handfuls?: number;
  gold_bags?: number;
  gold_chests?: number;
  prayer_dice?: number;
  unstoppable_value?: number;
};

export type CharacterSheetDetailsUpdate = {
  companion_name?: string;
  companion_evasion?: number;
  companion_notes?: string;
  rally_die_value?: string;
  rally_notes?: string;
  warrior_notes?: string;
  inventory_notes?: string;
};
