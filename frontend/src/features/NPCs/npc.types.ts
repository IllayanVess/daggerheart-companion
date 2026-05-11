// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
export type NPC = {
  id: number;
  name: string;
  tier: number | null;
  role: string | null;
  description: string | null;
  motives: string | null;
  tactics: string | null;
  difficulty: number | null;
  thresholds_major: number | null;
  thresholds_severe: number | null;
  hit_points: number | null;
  stress: number | null;
  attack_name: string | null;
  attack_range: string | null;
  attack_damage: string | null;
  attack_standard: string | null;
  attack_modifier: number | null;
  passive_features: string | null;
  action_features: string | null;
  reaction_features: string | null;
  fear_features: string | null;
  feature_groups?: Record<string, string[]>;
  experiences_list: Array<{ name: string; modifier: number }>;
  features: string | null;
  experiences: string | null;
  notes: string | null;
  data_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type NPCUpsertPayload = Omit<NPC, "id" | "created_at" | "updated_at">;
