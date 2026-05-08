import type { Adversary } from "../../types";

export type AdversaryFormProps = {
  onSaved: (adversary: Adversary) => void;
};

export type AdversaryCreatePayload = Omit<Adversary, "id" | "created_at" | "updated_at">;
