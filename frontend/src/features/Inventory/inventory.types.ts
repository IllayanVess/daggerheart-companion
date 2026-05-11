// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
export type InventoryCatalogOption = {
  item_name: string;
  category: string;
  subcategory: string | null;
  description_text: string;
  source_url: string | null;
};

export type CharacterInventoryEntry = {
  id: number;
  character_id: number;
  item_name: string;
  category: string | null;
  quantity: number;
  equipped: boolean;
  slot_name: string | null;
  notes: string | null;
};

export type CharacterInventoryCreate = {
  item_name: string;
  quantity?: number;
  notes?: string;
};

export type CharacterInventoryUpdate = {
  quantity?: number;
  equipped?: boolean;
  slot_name?: string | null;
  notes?: string;
};
