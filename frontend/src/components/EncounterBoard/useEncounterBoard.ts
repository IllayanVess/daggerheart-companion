// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { fetchAdversaries, fetchCharacters, fetchEncounterBoard, fetchInventoryCatalog, fetchNpcs, saveEncounterBoard } from "../../services/api";
import type { Adversary, Character, InventoryCatalogOption, NPC } from "../../types";
import { getCharacterMaxHitPoints, getCharacterMaxStress } from "../../utils/characterUtils";
import type {
  AdhocTokenDraft,
  BoardState,
  BoardToken,
  BoardTokenData,
  CellState,
  BoardColorOption,
  NamedRoll,
  PaletteToken,
  SelectedTokenRef,
} from "./EncounterBoard.types";

const BOARD_ID = "default";
const EMPTY_CELL: CellState = { environment: null, creature: null, objects: [] };
const SAVE_DELAY_MS = 1000;
const REJECT_SHAKE_MS = 360;

const BOARD_COLOR_OPTIONS: BoardColorOption[] = [
  { id: "ground", name: "Default Ground", boardColor: "#252525" },
  { id: "stone", name: "Stone", boardColor: "#394049" },
  { id: "forest", name: "Forest", boardColor: "#31452a" },
  { id: "water", name: "Water", boardColor: "#254644" },
  { id: "fire", name: "Firelight", boardColor: "#5a2d24" },
  { id: "shadow", name: "Shadow", boardColor: "#2d2a3f" },
  { id: "arcane", name: "Arcane", boardColor: "#47375f" },
  { id: "hazard", name: "Hazard", boardColor: "#4a4428" },
];
const BOARD_COLOR_IDS = new Set(BOARD_COLOR_OPTIONS.map((option) => option.id));

function createInitialBoard(): BoardState {
  return {
    id: BOARD_ID,
    defaultEnvironment: null,
    cells: {},
  };
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function readString(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

function readNumber(payload: Record<string, unknown>, keys: string[], fallback: number) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
}

function createTypedData(type: BoardToken["type"], data: Record<string, unknown> = {}): BoardTokenData {
  switch (type) {
    case "pc":
      return { ...data, tokenType: "pc" };
    case "adversary":
      return {
        ...data,
        tokenType: "adversary",
        role: typeof data.role === "string" ? data.role : null,
        tactics: typeof data.tactics === "string" ? data.tactics : null,
        motives: typeof data.motives === "string" ? data.motives : null,
        attack_name: typeof data.attack_name === "string" ? data.attack_name : null,
        attack_damage: typeof data.attack_damage === "string" ? data.attack_damage : null,
      };
    case "npc":
      return {
        ...data,
        tokenType: "npc",
        role: typeof data.role === "string" ? data.role : null,
        tactics: typeof data.tactics === "string" ? data.tactics : null,
        motives: typeof data.motives === "string" ? data.motives : null,
        attack_name: typeof data.attack_name === "string" ? data.attack_name : null,
        attack_damage: typeof data.attack_damage === "string" ? data.attack_damage : null,
      };
    case "object":
      return {
        ...data,
        tokenType: "object",
        category: typeof data.category === "string" ? data.category : null,
        subcategory: typeof data.subcategory === "string" ? data.subcategory : null,
        source_url: typeof data.source_url === "string" ? data.source_url : null,
      };
  }
}

function getCellKey(row: number, col: number) {
  return `${row}-${col}`;
}

export function isCellEmpty(cell: Pick<CellState, "creature" | "objects">) {
  return cell.creature === null && cell.objects.length === 0;
}

function isCellPrunable(cell: CellState) {
  return cell.environment === null && cell.creature === null && cell.objects.length === 0;
}

function cloneCell(cell?: CellState): CellState {
  return cell
    ? {
        environment: cell.environment,
        creature: cell.creature,
        objects: [...cell.objects],
      }
    : { environment: null, creature: null, objects: [] };
}

function pruneCells(cells: Record<string, CellState>) {
  return Object.fromEntries(Object.entries(cells).filter(([, cell]) => !isCellPrunable(cell))) as Record<string, CellState>;
}

function buildTokenCellIndex(cells: Record<string, CellState>) {
  const index = new Map<string, string>();
  for (const [cellKey, cell] of Object.entries(cells)) {
    if (cell.creature) {
      index.set(cell.creature.id, cellKey);
    }
    for (const object of cell.objects) {
      index.set(object.id, cellKey);
    }
  }
  return index;
}

function normalizeBoardColorId(value: string | null | undefined) {
  return value && BOARD_COLOR_IDS.has(value) ? value : null;
}

function normalizeBoard(board: BoardState): BoardState {
  const normalizedCells = Object.fromEntries(
    Object.entries(board.cells ?? {}).map(([cellKey, cell]) => [
      cellKey,
      {
        ...cell,
        environment: normalizeBoardColorId(cell.environment),
      },
    ]),
  ) as Record<string, CellState>;

  return {
    id: board.id || BOARD_ID,
    defaultEnvironment: normalizeBoardColorId(board.defaultEnvironment),
    cells: pruneCells(normalizedCells),
  };
}

function makePaletteTokenFromCharacter(character: Character): PaletteToken {
  const data = toRecord(character.data_json);
  const maxHp = getCharacterMaxHitPoints(character);
  const maxStress = getCharacterMaxStress(character);

  return {
    id: `pc-${character.id}`,
    sourceId: String(character.id),
    type: "pc",
    name: character.name,
    subtitle: `${character.class_name}${character.subclass_name ? ` / ${character.subclass_name}` : ""}`,
    portraitUrl: readString(data, ["portrait_url", "portraitUrl", "image_url", "character_image"]),
    currentHp: character.hit_points ?? maxHp,
    maxHp,
    currentStress: character.stress ?? maxStress,
    maxStress,
    data: createTypedData("pc", data),
    source: character,
  };
}

function makePaletteTokenFromAdversary(adversary: Adversary, type: "adversary" | "npc"): PaletteToken {
  const data = toRecord(adversary.data_json);
  const maxHp = readNumber(data, ["max_hit_points", "maxHp"], adversary.hit_points ?? 0);
  const maxStress = readNumber(data, ["max_stress", "maxStress"], adversary.stress ?? 0);

  return {
    id: `${type}-${adversary.id}`,
    sourceId: String(adversary.id),
    type,
    name: adversary.name,
    subtitle: type === "npc" ? `NPC / Tier ${adversary.tier}` : `Tier ${adversary.tier} ${adversary.role ?? "Standard"}`,
    portraitUrl: readString(data, ["portrait_url", "portraitUrl", "image_url", "adversary_image"]),
    currentHp: adversary.hit_points ?? maxHp,
    maxHp,
    currentStress: adversary.stress ?? maxStress,
    maxStress,
    description: adversary.description ?? undefined,
    data: createTypedData(type, {
      ...data,
      role: adversary.role,
      tactics: adversary.tactics,
      motives: adversary.motives,
      attack_name: adversary.attack_name,
      attack_damage: adversary.attack_damage,
    }),
    source: adversary,
  };
}

function makePaletteTokenFromNpc(npc: NPC): PaletteToken {
  const data = toRecord(npc.data_json);
  const maxHp = readNumber(data, ["max_hit_points", "maxHp"], npc.hit_points ?? 0);
  const maxStress = readNumber(data, ["max_stress", "maxStress"], npc.stress ?? 0);

  return {
    id: `npc-${npc.id}`,
    sourceId: String(npc.id),
    type: "npc",
    name: npc.name || "Unnamed NPC",
    subtitle: [npc.tier ? `Tier ${npc.tier}` : null, npc.role].filter(Boolean).join(" / ") || "NPC",
    portraitUrl: readString(data, ["portrait_url", "portraitUrl", "image_url", "npc_image"]),
    currentHp: npc.hit_points ?? maxHp,
    maxHp,
    currentStress: npc.stress ?? maxStress,
    maxStress,
    description: npc.description ?? undefined,
    data: createTypedData("npc", {
      ...data,
      role: npc.role,
      tactics: npc.tactics,
      motives: npc.motives,
      attack_name: npc.attack_name,
      attack_damage: npc.attack_damage,
    }),
    source: npc,
  };
}

function makePaletteTokenFromInventory(item: InventoryCatalogOption): PaletteToken {
  const maybeItemId = "id" in item ? (item as InventoryCatalogOption & { id?: string | number }).id : undefined;
  const sourceId = String(maybeItemId ?? `${item.category}-${item.subcategory ?? "none"}-${item.item_name}`);

  return {
    id: `object-${sourceId}`,
    sourceId,
    type: "object",
    name: item.item_name,
    subtitle: [item.category, item.subcategory].filter(Boolean).join(" / ") || "Object",
    portraitUrl: item.source_url,
    currentHp: 0,
    maxHp: 0,
    currentStress: 0,
    maxStress: 0,
    description: item.description_text,
    data: createTypedData("object", {
      category: item.category,
      subcategory: item.subcategory,
      source_url: item.source_url,
    }),
    source: item,
  };
}

function paletteTokenToBoardToken(token: PaletteToken): BoardToken {
  return {
    id: createId(token.type),
    sourceId: token.sourceId,
    type: token.type,
    name: token.name,
    portraitUrl: token.portraitUrl,
    currentHp: token.currentHp,
    maxHp: token.maxHp,
    currentStress: token.currentStress,
    maxStress: token.maxStress,
    namedRolls: [],
    description: token.description,
    data: token.data,
  } as BoardToken;
}

function adhocDraftToBoardToken(draft: AdhocTokenDraft): BoardToken {
  const maxHp = draft.type === "object" ? 0 : Math.max(0, draft.maxHp);
  const maxStress = draft.type === "object" ? 0 : Math.max(0, draft.maxStress);

  return {
    id: createId(draft.type),
    sourceId: "adhoc",
    type: draft.type,
    name: draft.name.trim(),
    portraitUrl: draft.portraitUrl,
    currentHp: maxHp,
    maxHp,
    currentStress: maxStress,
    maxStress,
    namedRolls: [],
    description: draft.description,
    data: createTypedData(draft.type, { adhoc: true }),
  } as BoardToken;
}

function getSelectedToken(board: BoardState, selectedTokenRef: SelectedTokenRef): BoardToken | null {
  if (!selectedTokenRef) {
    return null;
  }

  const cell = board.cells[selectedTokenRef.cellKey];
  if (!cell) {
    return null;
  }

  if (cell.creature?.id === selectedTokenRef.tokenId) {
    return cell.creature;
  }

  return cell.objects.find((token) => token.id === selectedTokenRef.tokenId) ?? null;
}

export function useEncounterBoard() {
  const [boardState, setBoardState] = useState<BoardState>(() => createInitialBoard());
  const [tokenCellIndex, setTokenCellIndex] = useState<Map<string, string>>(() => new Map());
  const [characters, setCharacters] = useState<Character[]>([]);
  const [adversaries, setAdversaries] = useState<Adversary[]>([]);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [inventoryCatalog, setInventoryCatalog] = useState<InventoryCatalogOption[]>([]);
  const [selectedTokenRef, setSelectedTokenRef] = useState<SelectedTokenRef>(null);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null);
  const [isPaintMode, setIsPaintMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Loading encounter board.");
  const [saveStatus, setSaveStatus] = useState("Idle");
  const [libraryStatus, setLibraryStatus] = useState("Loading token libraries.");
  const [isReloadingLibraries, setIsReloadingLibraries] = useState(false);
  const [rejectedCellKey, setRejectedCellKey] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const tokenCellIndexRef = useRef(tokenCellIndex);

  const syncTokenCellIndex = useCallback((cells: Record<string, CellState>) => {
    const nextIndex = buildTokenCellIndex(cells);
    tokenCellIndexRef.current = nextIndex;
    setTokenCellIndex(nextIndex);
  }, []);

  const getTokenCellKey = useCallback(
    (tokenId: string) => tokenCellIndex.get(tokenId) ?? tokenCellIndexRef.current.get(tokenId) ?? null,
    [tokenCellIndex],
  );

  const reloadLibraries = useCallback(async () => {
    setIsReloadingLibraries(true);
    setLibraryStatus("Loading token libraries.");
    const [characterResult, adversaryResult, npcResult, inventoryResult] = await Promise.allSettled([
      fetchCharacters(),
      fetchAdversaries(),
      fetchNpcs(),
      fetchInventoryCatalog(),
    ]);

    if (characterResult.status === "fulfilled") setCharacters(characterResult.value);
    if (adversaryResult.status === "fulfilled") setAdversaries(adversaryResult.value);
    if (npcResult.status === "fulfilled") setNpcs(npcResult.value);
    if (inventoryResult.status === "fulfilled") setInventoryCatalog(inventoryResult.value);

    const failedLibraries = [characterResult, adversaryResult, npcResult, inventoryResult].filter(
      (result) => result.status === "rejected",
    ).length;

    const pcCount = characterResult.status === "fulfilled" ? characterResult.value.length : 0;
    const adversaryCount = adversaryResult.status === "fulfilled" ? adversaryResult.value.length : 0;
    const npcCount = npcResult.status === "fulfilled" ? npcResult.value.length : 0;
    const objectCount = inventoryResult.status === "fulfilled" ? inventoryResult.value.length : 0;

    setLibraryStatus(
      failedLibraries
        ? `Some libraries failed. Loaded ${pcCount} PCs, ${adversaryCount} adversaries, ${npcCount} NPCs, and ${objectCount} objects.`
        : `Loaded ${pcCount} PCs, ${adversaryCount} adversaries, ${npcCount} NPCs, and ${objectCount} objects.`,
    );
    setIsReloadingLibraries(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadBoard() {
      setIsLoading(true);
      const boardResult = await Promise.resolve(fetchEncounterBoard()).then(
        (value) => ({ status: "fulfilled" as const, value }),
        (reason) => ({ status: "rejected" as const, reason }),
      );

      if (!isMounted) {
        return;
      }

      const nextBoard = boardResult.status === "fulfilled" ? normalizeBoard(boardResult.value) : createInitialBoard();
      setBoardState(nextBoard);
      syncTokenCellIndex(nextBoard.cells);
      setStatusMessage(boardResult.status === "fulfilled" ? "Board loaded." : "Could not load the board. Starting with an empty encounter board.");
      setIsLoading(false);
      hasLoadedRef.current = true;
    }

    loadBoard().catch(() => {
      if (!isMounted) {
        return;
      }
      const emptyBoard = createInitialBoard();
      setBoardState(emptyBoard);
      syncTokenCellIndex(emptyBoard.cells);
      setStatusMessage("Could not load the board. Starting with an empty encounter board.");
      setIsLoading(false);
      hasLoadedRef.current = true;
    });

    return () => {
      isMounted = false;
    };
  }, [syncTokenCellIndex]);

  useEffect(() => {
    reloadLibraries();
  }, [reloadLibraries]);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      return undefined;
    }

    setSaveStatus("Saving...");

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      const payload = normalizeBoard(boardState);
      saveEncounterBoard(payload)
        .then(() => {
          setSaveStatus("Saved");
        })
        .catch(() => {
          setSaveStatus("Save failed");
        });
    }, SAVE_DELAY_MS);

    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [boardState]);

  const palette = useMemo(
    () => ({
      pcs: characters.map(makePaletteTokenFromCharacter),
      adversaries: adversaries.map((adversary) => makePaletteTokenFromAdversary(adversary, "adversary")),
      npcs: npcs.map(makePaletteTokenFromNpc),
      objects: inventoryCatalog.map(makePaletteTokenFromInventory),
    }),
    [adversaries, characters, inventoryCatalog, npcs],
  );

  const environmentOptions = BOARD_COLOR_OPTIONS;

  const environmentById = useMemo(() => {
    return new Map(BOARD_COLOR_OPTIONS.map((environment) => [String(environment.id), environment]));
  }, []);

  useEffect(() => {
    if (!selectedEnvironmentId && boardState.defaultEnvironment) {
      setSelectedEnvironmentId(boardState.defaultEnvironment);
    }
  }, [boardState.defaultEnvironment, selectedEnvironmentId]);

  const selectedToken = useMemo(() => getSelectedToken(boardState, selectedTokenRef), [boardState, selectedTokenRef]);

  const getCell = useCallback((row: number, col: number): CellState => {
    return boardState.cells[getCellKey(row, col)] ?? EMPTY_CELL;
  }, [boardState.cells]);

  const rejectCell = useCallback((row: number, col: number) => {
    const cellKey = getCellKey(row, col);
    setRejectedCellKey(cellKey);
    window.setTimeout(() => setRejectedCellKey((current) => (current === cellKey ? null : current)), REJECT_SHAKE_MS);
  }, []);

  const placeBoardToken = useCallback(
    (row: number, col: number, token: BoardToken) => {
      const cellKey = getCellKey(row, col);
      let didPlace = false;
      let didReject = false;
      let nextIndex: Map<string, string> | null = null;

      flushSync(() => {
        setBoardState((current) => {
          const currentCell = current.cells[cellKey] ?? EMPTY_CELL;
          if (token.type !== "object" && currentCell.creature) {
            didReject = true;
            return current;
          }

          const cell = cloneCell(current.cells[cellKey]);

          if (token.type === "object") {
            cell.objects = [...cell.objects, token];
          } else {
            cell.creature = token;
          }

          const nextCells = pruneCells({
            ...current.cells,
            [cellKey]: cell,
          });
          nextIndex = buildTokenCellIndex(nextCells);
          tokenCellIndexRef.current = nextIndex;
          didPlace = true;

          return {
            ...current,
            cells: nextCells,
          };
        });
      });

      if (didReject) {
        rejectCell(row, col);
        return false;
      }

      if (didPlace) {
        if (nextIndex) {
          setTokenCellIndex(nextIndex);
        }
        setSelectedTokenRef({ cellKey, tokenId: token.id });
      }
      return didPlace;
    },
    [rejectCell],
  );

  const placePaletteToken = useCallback(
    (row: number, col: number, token: PaletteToken) => placeBoardToken(row, col, paletteTokenToBoardToken(token)),
    [placeBoardToken],
  );

  const placeAdhocToken = useCallback(
    (row: number, col: number, draft: AdhocTokenDraft) => {
      if (!draft.name.trim()) {
        return false;
      }

      return placeBoardToken(row, col, adhocDraftToBoardToken(draft));
    },
    [placeBoardToken],
  );

  const selectTopToken = useCallback((row: number, col: number) => {
    const cellKey = getCellKey(row, col);
    const cell = boardState.cells[cellKey];
    const token = cell ? [...cell.objects].reverse()[0] ?? cell.creature : null;
    setSelectedTokenRef(token ? { cellKey, tokenId: token.id } : null);
    return token;
  }, [boardState.cells]);

  const moveToken = useCallback(
    (tokenId: string, toRow: number, toCol: number) => {
      const toCellKey = getCellKey(toRow, toCol);
      const fromCellKey = getTokenCellKey(tokenId);

      if (!fromCellKey) {
        return false;
      }

      if (fromCellKey === toCellKey) {
        setSelectedTokenRef({ cellKey: toCellKey, tokenId });
        return true;
      }

      let didMove = false;
      let didReject = false;
      let didLoseToken = false;
      let nextIndex: Map<string, string> | null = null;

      flushSync(() => {
        setBoardState((current) => {
          const sourceCellCurrent = current.cells[fromCellKey];
          if (!sourceCellCurrent) {
            didLoseToken = true;
            return current;
          }

          const movingToken =
            sourceCellCurrent.creature?.id === tokenId
              ? sourceCellCurrent.creature
              : sourceCellCurrent.objects.find((entry) => entry.id === tokenId) ?? null;

          if (!movingToken) {
            didLoseToken = true;
            return current;
          }

          const targetCell = current.cells[toCellKey] ?? EMPTY_CELL;
          if (movingToken.type !== "object" && targetCell.creature) {
            didReject = true;
            return current;
          }

          const sourceCell = cloneCell(sourceCellCurrent);
          const destinationCell = cloneCell(current.cells[toCellKey]);

          if (sourceCell.creature?.id === tokenId) {
            sourceCell.creature = null;
          }
          sourceCell.objects = sourceCell.objects.filter((object) => object.id !== tokenId);

          if (movingToken.type === "object") {
            destinationCell.objects = [...destinationCell.objects, movingToken];
          } else {
            destinationCell.creature = movingToken;
          }

          const nextCells = pruneCells({
            ...current.cells,
            [fromCellKey]: sourceCell,
            [toCellKey]: destinationCell,
          });
          nextIndex = buildTokenCellIndex(nextCells);
          tokenCellIndexRef.current = nextIndex;
          didMove = true;

          return {
            ...current,
            cells: nextCells,
          };
        });
      });

      if (didReject) {
        rejectCell(toRow, toCol);
        return false;
      }

      if (didLoseToken) {
        return false;
      }

      if (didMove) {
        if (nextIndex) {
          setTokenCellIndex(nextIndex);
        }
        setSelectedTokenRef({ cellKey: toCellKey, tokenId });
      }
      return didMove;
    },
    [getTokenCellKey, rejectCell],
  );

  const updateToken = useCallback((tokenId: string, updates: Partial<BoardToken>) => {
    const cellKey = getTokenCellKey(tokenId);
    if (!cellKey) {
      return;
    }

    setBoardState((current) => {
      const cell = current.cells[cellKey];
      if (!cell) {
        return current;
      }

      const nextCell = cloneCell(cell);
      if (nextCell.creature?.id === tokenId) {
        nextCell.creature = { ...nextCell.creature, ...updates } as BoardToken;
      }
      nextCell.objects = nextCell.objects.map((object) => (object.id === tokenId ? ({ ...object, ...updates } as BoardToken) : object));

      return {
        ...current,
        cells: pruneCells({
          ...current.cells,
          [cellKey]: nextCell,
        }),
      };
    });
  }, [getTokenCellKey]);

  const removeToken = useCallback((tokenId: string) => {
    const cellKey = getTokenCellKey(tokenId);
    if (!cellKey) {
      return;
    }

    let nextIndex: Map<string, string> | null = null;
    flushSync(() => {
      setBoardState((current) => {
        const cell = current.cells[cellKey];
        if (!cell) {
          return current;
        }

        const nextCell = cloneCell(cell);
        if (nextCell.creature?.id === tokenId) {
          nextCell.creature = null;
        }
        nextCell.objects = nextCell.objects.filter((object) => object.id !== tokenId);
        const nextCells = pruneCells({
          ...current.cells,
          [cellKey]: nextCell,
        });
        nextIndex = buildTokenCellIndex(nextCells);
        tokenCellIndexRef.current = nextIndex;

        return {
          ...current,
          cells: nextCells,
        };
      });
    });

    if (nextIndex) {
      setTokenCellIndex(nextIndex);
    }
    setSelectedTokenRef((current) => (current?.tokenId === tokenId ? null : current));
  }, [getTokenCellKey]);

  const clearCell = useCallback((row: number, col: number) => {
    const cellKey = getCellKey(row, col);
    let nextIndex: Map<string, string> | null = null;
    flushSync(() => {
      setBoardState((current) => {
        const cell = cloneCell(current.cells[cellKey]);
        cell.creature = null;
        cell.objects = [];
        const nextCells = pruneCells({
          ...current.cells,
          [cellKey]: cell,
        });
        nextIndex = buildTokenCellIndex(nextCells);
        tokenCellIndexRef.current = nextIndex;
        return {
          ...current,
          cells: nextCells,
        };
      });
    });
    if (nextIndex) {
      setTokenCellIndex(nextIndex);
    }
    setSelectedTokenRef((current) => (current?.cellKey === cellKey ? null : current));
  }, []);

  const resetCellEnvironment = useCallback((row: number, col: number) => {
    const cellKey = getCellKey(row, col);
    setBoardState((current) => {
      const cell = cloneCell(current.cells[cellKey]);
      cell.environment = null;
      return {
        ...current,
        cells: pruneCells({
          ...current.cells,
          [cellKey]: cell,
        }),
      };
    });
  }, []);

  const setDefaultEnvironment = useCallback((environmentId: string | null) => {
    setBoardState((current) => ({ ...current, defaultEnvironment: environmentId }));
    setSelectedEnvironmentId(environmentId);
  }, []);

  const setCellEnvironment = useCallback((row: number, col: number, environmentId: string | null) => {
    const cellKey = getCellKey(row, col);
    setBoardState((current) => {
      const cell = cloneCell(current.cells[cellKey]);
      cell.environment = environmentId;
      return {
        ...current,
        cells: pruneCells({
          ...current.cells,
          [cellKey]: cell,
        }),
      };
    });
  }, []);

  const paintCell = useCallback(
    (row: number, col: number) => {
      if (!selectedEnvironmentId) {
        return;
      }
      setCellEnvironment(row, col, selectedEnvironmentId);
    },
    [selectedEnvironmentId, setCellEnvironment],
  );

  const addNamedRoll = useCallback((tokenId: string, roll: Omit<NamedRoll, "id">) => {
    const cellKey = getTokenCellKey(tokenId);
    if (!cellKey) {
      return;
    }

    const namedRoll: NamedRoll = { ...roll, id: createId("roll") };
    setBoardState((current) => {
      const cell = current.cells[cellKey];
      if (!cell) {
        return current;
      }

      const nextCell = cloneCell(cell);
      if (nextCell.creature?.id === tokenId) {
        nextCell.creature = { ...nextCell.creature, namedRolls: [...nextCell.creature.namedRolls, namedRoll] };
      }
      nextCell.objects = nextCell.objects.map((object) =>
        object.id === tokenId ? { ...object, namedRolls: [...object.namedRolls, namedRoll] } : object,
      );

      return {
        ...current,
        cells: pruneCells({
          ...current.cells,
          [cellKey]: nextCell,
        }),
      };
    });
  }, [getTokenCellKey]);

  const removeNamedRoll = useCallback((tokenId: string, rollId: string) => {
    const cellKey = getTokenCellKey(tokenId);
    if (!cellKey) {
      return;
    }

    setBoardState((current) => {
      const cell = current.cells[cellKey];
      if (!cell) {
        return current;
      }

      const nextCell = cloneCell(cell);
      if (nextCell.creature?.id === tokenId) {
        nextCell.creature = {
          ...nextCell.creature,
          namedRolls: nextCell.creature.namedRolls.filter((roll) => roll.id !== rollId),
        };
      }
      nextCell.objects = nextCell.objects.map((object) =>
        object.id === tokenId
          ? { ...object, namedRolls: object.namedRolls.filter((roll) => roll.id !== rollId) }
          : object,
      );

      return {
        ...current,
        cells: pruneCells({
          ...current.cells,
          [cellKey]: nextCell,
        }),
      };
    });
  }, [getTokenCellKey]);

  return {
    boardState,
    palette,
    environments: environmentOptions,
    environmentById,
    selectedEnvironmentId,
    selectedToken,
    selectedTokenRef,
    isPaintMode,
    isLoading,
    isReloadingLibraries,
    statusMessage,
    libraryStatus,
    saveStatus,
    rejectedCellKey,
    getCell,
    placePaletteToken,
    placeAdhocToken,
    moveToken,
    selectTopToken,
    reloadLibraries,
    setSelectedTokenRef,
    setSelectedEnvironmentId,
    setIsPaintMode,
    setDefaultEnvironment,
    setCellEnvironment,
    paintCell,
    updateToken,
    removeToken,
    clearCell,
    resetCellEnvironment,
    addNamedRoll,
    removeNamedRoll,
  };
}
