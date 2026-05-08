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
