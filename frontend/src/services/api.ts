// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import type {
  Adversary,
  AncestryOption,
  Character,
  CharacterInventoryCreate,
  CharacterInventoryEntry,
  CharacterInventoryUpdate,
  CharacterSheetDetailsUpdate,
  CharacterTrackersUpdate,
  CharacterUpsertPayload,
  ClassDetail,
  ClassOption,
  CommunityOption,
  DomainCardOption,
  EquipmentOption,
  Environment,
  EnvironmentUpsertPayload,
  InventoryCatalogOption,
  NPC,
  NPCUpsertPayload,
  SubclassDetail,
} from "../types";
import type { BoardState } from "../components/EncounterBoard/EncounterBoard.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();
  return (responseText ? JSON.parse(responseText) : undefined) as T;
}

export function fetchClasses(): Promise<ClassOption[]> {
  return apiRequest<ClassOption[]>("/lookup/classes");
}

export function fetchClassDetail(className: string): Promise<ClassDetail> {
  return apiRequest<ClassDetail>(`/lookup/class/${encodeURIComponent(className)}`);
}

export function fetchSubclassDetail(subclassName: string): Promise<SubclassDetail> {
  return apiRequest<SubclassDetail>(`/lookup/subclass/${encodeURIComponent(subclassName)}`);
}

export function fetchAncestries(): Promise<AncestryOption[]> {
  return apiRequest<AncestryOption[]>("/lookup/ancestries");
}

export function fetchCommunities(): Promise<CommunityOption[]> {
  return apiRequest<CommunityOption[]>("/lookup/communities");
}

export function fetchDomainCards(className: string, maxLevel = 1): Promise<DomainCardOption[]> {
  return apiRequest<DomainCardOption[]>(
    `/lookup/domain-cards?class_name=${encodeURIComponent(className)}&max_level=${maxLevel}`,
  );
}

export function fetchEquipment(category?: string, tier?: number, search?: string): Promise<EquipmentOption[]> {
  const params = new URLSearchParams();
  if (category) {
    params.set("category", category);
  }
  if (tier !== undefined) {
    params.set("tier", String(tier));
  }
  if (search) {
    params.set("search", search);
  }
  return apiRequest<EquipmentOption[]>(`/lookup/equipment?${params.toString()}`);
}

export function fetchInventoryCatalog(search?: string): Promise<InventoryCatalogOption[]> {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  return apiRequest<InventoryCatalogOption[]>(`/lookup/inventory-content?${params.toString()}`);
}

export function fetchCharacters(): Promise<Character[]> {
  return apiRequest<Character[]>("/characters");
}

export function fetchCharacter(characterId: number): Promise<Character> {
  return apiRequest<Character>(`/characters/${characterId}`);
}

export function createCharacter(payload: Omit<Character, "id" | "created_at" | "updated_at">): Promise<Character> {
  return apiRequest<Character>("/characters", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCharacter(characterId: number, payload: CharacterUpsertPayload): Promise<Character> {
  return apiRequest<Character>(`/characters/${characterId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateCharacterTrackers(
  characterId: number,
  payload: CharacterTrackersUpdate,
): Promise<Character> {
  return apiRequest<Character>(`/characters/${characterId}/trackers`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateCharacterSheetDetails(
  characterId: number,
  payload: CharacterSheetDetailsUpdate,
): Promise<Character> {
  return apiRequest<Character>(`/characters/${characterId}/sheet-details`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function fetchCharacterInventory(characterId: number): Promise<CharacterInventoryEntry[]> {
  return apiRequest<CharacterInventoryEntry[]>(`/characters/${characterId}/inventory`);
}

export function addCharacterInventory(
  characterId: number,
  payload: CharacterInventoryCreate,
): Promise<CharacterInventoryEntry> {
  return apiRequest<CharacterInventoryEntry>(`/characters/${characterId}/inventory`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCharacterInventory(
  characterId: number,
  entryId: number,
  payload: CharacterInventoryUpdate,
): Promise<CharacterInventoryEntry> {
  return apiRequest<CharacterInventoryEntry>(`/characters/${characterId}/inventory/${entryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteCharacterInventory(characterId: number, entryId: number): Promise<void> {
  return apiRequest<void>(`/characters/${characterId}/inventory/${entryId}`, {
    method: "DELETE",
  });
}

export function fetchAdversaries(): Promise<Adversary[]> {
  return apiRequest<Adversary[]>("/adversaries");
}

export function createAdversary(payload: Omit<Adversary, "id" | "created_at" | "updated_at">): Promise<Adversary> {
  return apiRequest<Adversary>("/adversaries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchNpcs(): Promise<NPC[]> {
  return apiRequest<NPC[]>("/npcs");
}

export function createNpc(payload: NPCUpsertPayload): Promise<NPC> {
  return apiRequest<NPC>("/npcs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchEnvironments(): Promise<Environment[]> {
  return apiRequest<Environment[]>("/environments");
}

export function createEnvironment(
  payload: EnvironmentUpsertPayload,
): Promise<Environment> {
  return apiRequest<Environment>("/environments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateEnvironment(environmentId: number, payload: EnvironmentUpsertPayload): Promise<Environment> {
  return apiRequest<Environment>(`/environments/${environmentId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function fetchEncounterBoard(): Promise<BoardState> {
  return apiRequest<BoardState>("/encounter-board/");
}

export function saveEncounterBoard(state: BoardState): Promise<BoardState> {
  return apiRequest<BoardState>("/encounter-board/", {
    method: "PUT",
    body: JSON.stringify(state),
  });
}
