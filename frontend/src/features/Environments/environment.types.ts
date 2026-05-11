// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
export type Environment = {
  id: number;
  name: string;
  tier: number;
  environment_type: string;
  description: string | null;
  impulses: string | null;
  difficulty: number | null;
  potential_adversaries: string | null;
  features: string | null;
  notes: string | null;
  data_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type EnvironmentUpsertPayload = Omit<Environment, "id" | "created_at" | "updated_at">;
