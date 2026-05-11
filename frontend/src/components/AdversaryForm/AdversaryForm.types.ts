// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import type { Adversary } from "../../types";

export type AdversaryFormProps = {
  onSaved: (adversary: Adversary) => void;
};

export type AdversaryCreatePayload = Omit<Adversary, "id" | "created_at" | "updated_at">;
