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
