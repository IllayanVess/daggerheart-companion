import type { Adversary, Character, InventoryCatalogOption, NPC } from "../../types";

export type BoardTokenType = "pc" | "adversary" | "npc" | "object";

export type NamedRoll = {
  id: string;
  name: string;
  expression: string;
};

export type DragPayload = {
  category: Exclude<PaletteCategory, "adhoc">;
  id: string;
};

type PcTokenData = Character["data_json"] & {
  tokenType: "pc";
};

type AdversaryTokenData = {
  tokenType: "adversary";
  role: string | null;
  tactics: string | null;
  motives: string | null;
  attack_name: string | null;
  attack_damage: string | null;
  [key: string]: unknown;
};

type NpcTokenData = {
  tokenType: "npc";
  role: string | null;
  tactics: string | null;
  motives: string | null;
  attack_name: string | null;
  attack_damage: string | null;
  [key: string]: unknown;
};

type ObjectTokenData = {
  tokenType: "object";
  category: string | null;
  subcategory: string | null;
  source_url: string | null;
  adhoc?: boolean;
  [key: string]: unknown;
};

export type BoardTokenDataByType = {
  pc: PcTokenData;
  adversary: AdversaryTokenData;
  npc: NpcTokenData;
  object: ObjectTokenData;
};

export type BoardTokenData = BoardTokenDataByType[BoardTokenType];

type BoardTokenBase = {
  id: string;
  sourceId: string;
  name: string;
  portraitUrl: string | null;
  currentHp: number;
  maxHp: number;
  currentStress: number;
  maxStress: number;
  namedRolls: NamedRoll[];
  description?: string;
};

export type BoardToken = {
  [TokenType in BoardTokenType]: BoardTokenBase & {
    type: TokenType;
    data?: BoardTokenDataByType[TokenType];
  };
}[BoardTokenType];

export type CellState = {
  environment: string | null;
  creature: BoardToken | null;
  objects: BoardToken[];
};

export type BoardState = {
  id: string;
  defaultEnvironment: string | null;
  cells: Record<string, CellState>;
};

export type PaletteCategory = "pcs" | "adversaries" | "npcs" | "objects" | "adhoc";

export type PaletteToken = {
  id: string;
  sourceId: string;
  type: BoardTokenType;
  name: string;
  subtitle: string;
  portraitUrl: string | null;
  currentHp: number;
  maxHp: number;
  currentStress: number;
  maxStress: number;
  description?: string;
  data?: BoardTokenData;
  source: Character | Adversary | InventoryCatalogOption | NPC;
};

export type AdhocTokenDraft = {
  name: string;
  type: BoardTokenType;
  portraitUrl: string | null;
  description?: string;
  maxHp: number;
  maxStress: number;
};

export type SelectedTokenRef = {
  cellKey: string;
  tokenId: string;
} | null;

export type ContextMenuState = {
  x: number;
  y: number;
  row: number;
  col: number;
  token: BoardToken;
};

export type AddTokenPopoverState = {
  x: number;
  y: number;
  row: number;
  col: number;
} | null;

export type BoardColorOption = {
  id: string;
  name: string;
  boardColor: string;
};
