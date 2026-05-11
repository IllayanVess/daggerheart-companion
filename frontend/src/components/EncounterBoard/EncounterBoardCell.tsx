// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import type { DragEvent, MouseEvent } from "react";

import type { BoardColorOption, BoardToken, CellState, DragPayload } from "./EncounterBoard.types";
import styles from "./EncounterBoard.module.css";

type EncounterBoardCellProps = {
  row: number;
  col: number;
  cell: CellState;
  defaultEnvironment: string | null;
  environmentById: Map<string, BoardColorOption>;
  selectedTokenId: string | null;
  isSelectedCell: boolean;
  isRejected: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>, row: number, col: number) => void;
  onTokenDragStart: (event: DragEvent, row: number, col: number, token: BoardToken) => void;
  onTokenContextMenu: (event: MouseEvent, row: number, col: number, token: BoardToken) => void;
  onDropToken: (row: number, col: number, payload: DragPayload) => void;
  onMoveToken: (row: number, col: number, tokenId: string) => void;
};

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("");
}

function getTokenClass(type: BoardToken["type"]) {
  switch (type) {
    case "pc":
      return styles.tokenPc;
    case "adversary":
      return styles.tokenAdversary;
    case "npc":
      return styles.tokenNpc;
    case "object":
      return styles.tokenObject;
  }
}

function TokenPortrait({
  token,
  size,
  selected,
  onDragStart,
  onContextMenu,
}: {
  token: BoardToken;
  size: "creature" | "object";
  selected: boolean;
  onDragStart: (event: DragEvent) => void;
  onContextMenu: (event: MouseEvent) => void;
}) {
  const tokenClassName = [
    styles.token,
    size === "creature" ? styles.creatureToken : styles.objectToken,
    getTokenClass(token.type),
    selected ? styles.selectedToken : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={tokenClassName} draggable onContextMenu={onContextMenu} onDragStart={onDragStart} title={token.name}>
      {token.portraitUrl ? <img alt="" src={token.portraitUrl} /> : <span>{getInitials(token.name)}</span>}
    </span>
  );
}

function buildTooltip(cell: CellState, environmentName: string) {
  const parts = [`Environment: ${environmentName}`];
  if (cell.creature) {
    parts.push(`Creature: ${cell.creature.name}`);
  }
  if (cell.objects.length) {
    parts.push(`Objects: ${cell.objects.map((object) => object.name).join(", ")}`);
  }
  return parts.join("\n");
}

export function EncounterBoardCell({
  row,
  col,
  cell,
  defaultEnvironment,
  environmentById,
  selectedTokenId,
  isSelectedCell,
  isRejected,
  onClick,
  onTokenDragStart,
  onTokenContextMenu,
  onDropToken,
  onMoveToken,
}: EncounterBoardCellProps) {
  const effectiveEnvironmentId = cell.environment ?? defaultEnvironment;
  const environment = effectiveEnvironmentId ? environmentById.get(effectiveEnvironmentId) : null;
  const environmentName = environment?.name ?? "Default Ground";
  const environmentColor = environment?.boardColor ?? "#252525";

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const rawBoardTokenPayload = event.dataTransfer.getData("application/x-board-token");
    if (rawBoardTokenPayload) {
      try {
        const payload = JSON.parse(rawBoardTokenPayload) as { tokenId?: string };
        if (payload.tokenId) {
          onMoveToken(row, col, payload.tokenId);
        }
      } catch {
        return;
      }
      return;
    }

    const rawPayload = event.dataTransfer.getData("application/x-encounter-token");
    if (!rawPayload) {
      return;
    }

    try {
      onDropToken(row, col, JSON.parse(rawPayload) as DragPayload);
    } catch {
      return;
    }
  }

  return (
    <button
      className={`${styles.cell} ${isRejected ? styles.cellRejected : ""}`}
      aria-label={`Cell ${row + 1}, ${col + 1}`}
      data-selected={isSelectedCell ? "true" : "false"}
      style={{ backgroundColor: environmentColor }}
      title={buildTooltip(cell, environmentName)}
      type="button"
      onClick={(event) => onClick(event, row, col)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <span className={styles.environmentLabel}>{environmentName}</span>
      {cell.creature ? (
        <TokenPortrait
          selected={selectedTokenId === cell.creature.id}
          size="creature"
          token={cell.creature}
          onDragStart={(event) => onTokenDragStart(event, row, col, cell.creature!)}
          onContextMenu={(event) => onTokenContextMenu(event, row, col, cell.creature!)}
        />
      ) : null}
      {cell.objects.length ? (
        <span className={styles.objectStack}>
          {cell.objects.slice(0, 4).map((object) => (
            <TokenPortrait
              key={object.id}
              selected={selectedTokenId === object.id}
              size="object"
              token={object}
              onDragStart={(event) => onTokenDragStart(event, row, col, object)}
              onContextMenu={(event) => onTokenContextMenu(event, row, col, object)}
            />
          ))}
          {cell.objects.length > 4 ? <span className={styles.objectOverflowBadge}>+{cell.objects.length - 4}</span> : null}
        </span>
      ) : null}
    </button>
  );
}
