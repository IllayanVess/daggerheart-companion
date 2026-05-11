// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import { useMemo, useState, type CSSProperties, type DragEvent, type MouseEvent } from "react";

import { EncounterBoardCell } from "./EncounterBoardCell";
import { TokenDetailPanel } from "./TokenDetailPanel";
import { TokenPalette } from "./TokenPalette";
import type { AddTokenPopoverState, BoardToken, ContextMenuState, DragPayload, PaletteCategory, PaletteToken } from "./EncounterBoard.types";
import { isCellEmpty, useEncounterBoard } from "./useEncounterBoard";
import styles from "./EncounterBoard.module.css";

// GRID_SIZE sets --grid-size for .grid; keep it paired with the 48px cell sizing used by the board CSS.
const GRID_SIZE = 30;
const CELL_SIZE = 48;

type EncounterBoardProps = {
  headerAction?: React.ReactNode;
};

function getPaletteCollection(
  palette: ReturnType<typeof useEncounterBoard>["palette"],
  category: Exclude<PaletteCategory, "adhoc">,
) {
  switch (category) {
    case "pcs":
      return palette.pcs;
    case "adversaries":
      return palette.adversaries;
    case "npcs":
      return palette.npcs;
    case "objects":
      return palette.objects;
  }
}

function getViewportBounds() {
  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  };
}

export function EncounterBoard({ headerAction }: EncounterBoardProps) {
  const board = useEncounterBoard();
  const [addPopover, setAddPopover] = useState<AddTokenPopoverState>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const indices = useMemo(() => Array.from({ length: GRID_SIZE }, (_, index) => index), []);
  const gridStyle = { "--grid-size": GRID_SIZE, "--cell-size": `${CELL_SIZE}px` } as CSSProperties;

  function closeFloatingMenus() {
    setAddPopover(null);
    setContextMenu(null);
  }

  function handleCellClick(event: MouseEvent<HTMLButtonElement>, row: number, col: number) {
    closeFloatingMenus();

    if (board.isPaintMode) {
      board.paintCell(row, col);
      return;
    }

    const cell = board.getCell(row, col);
    if (isCellEmpty(cell)) {
      const rect = event.currentTarget.getBoundingClientRect();
      const viewport = getViewportBounds();
      setAddPopover({
        x: Math.min(rect.left + 12, viewport.width - 340),
        y: Math.min(rect.top + 12, viewport.height - 420),
        row,
        col,
      });
      return;
    }

    board.selectTopToken(row, col);
  }

  function handleTokenContextMenu(event: MouseEvent, row: number, col: number, token: BoardToken) {
    event.preventDefault();
    event.stopPropagation();
    const viewport = getViewportBounds();
    setAddPopover(null);
    setContextMenu({
      x: Math.min(event.clientX, viewport.width - 260),
      y: Math.min(event.clientY, viewport.height - 180),
      row,
      col,
      token,
    });
  }

  function handleTokenDragStart(event: DragEvent, row: number, col: number, token: BoardToken) {
    event.stopPropagation();
    event.dataTransfer.setData("application/x-board-token", JSON.stringify({ tokenId: token.id, fromCellKey: `${row}-${col}` }));
    event.dataTransfer.effectAllowed = "move";
    board.setSelectedTokenRef({ cellKey: `${row}-${col}`, tokenId: token.id });
  }

  function handleDropToken(row: number, col: number, payload: DragPayload) {
    const token = getPaletteCollection(board.palette, payload.category).find((entry) => entry.id === payload.id);
    if (token) {
      board.placePaletteToken(row, col, token);
    }
  }

  function placeFromPopover(token: PaletteToken) {
    if (!addPopover) {
      return;
    }

    const didPlace = board.placePaletteToken(addPopover.row, addPopover.col, token);
    if (didPlace) {
      setAddPopover(null);
    }
  }

  const selectedTokenId = board.selectedToken?.id ?? null;

  return (
    <section className="panel">
      <div className={styles.boardHeader}>
        <div>
          <p className="eyebrow">Encounter Board</p>
          <h2>Thirty by Thirty Scene Grid</h2>
          <p className="status">
            {board.statusMessage} {board.isLoading ? "" : `Persistence: ${board.saveStatus}.`}
          </p>
        </div>
        <div className={styles.headerActions}>{headerAction}</div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.environmentControl}>
          <label>
            Board default
            <select
              className={`${styles.inputBase} ${styles.toolbarSelect}`}
              aria-label="Board default color"
              value={board.boardState.defaultEnvironment ?? ""}
              onChange={(event) => board.setDefaultEnvironment(event.target.value || null)}
            >
              <option value="">Default Ground</option>
              {board.environments.map((environment) => (
                <option key={environment.id} value={environment.id}>
                  {environment.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={styles.paintControl}>
          <input
            checked={board.isPaintMode}
            type="checkbox"
            onChange={(event) => board.setIsPaintMode(event.target.checked)}
          />
          Paintbrush
        </label>

        <select
          className={`${styles.inputBase} ${styles.toolbarSelect}`}
          aria-label="Selected color for painting"
          value={board.selectedEnvironmentId ?? ""}
          onChange={(event) => board.setSelectedEnvironmentId(event.target.value || null)}
        >
          <option value="">Choose color</option>
          {board.environments.map((environment) => (
            <option key={environment.id} value={environment.id}>
              {environment.name}
            </option>
          ))}
        </select>

        <button className="secondary-button" disabled={board.isReloadingLibraries} type="button" onClick={board.reloadLibraries}>
          {board.isReloadingLibraries ? "Loading..." : "Reload libraries"}
        </button>
      </div>

      <div className={styles.libraryStatus}>{board.libraryStatus}</div>

      <TokenPalette
        isReloading={board.isReloadingLibraries}
        libraryStatus={board.libraryStatus}
        palette={board.palette}
        onReloadLibraries={board.reloadLibraries}
      />

      <div className={styles.layout}>
        <div className={styles.gridViewport} style={gridStyle} onClick={() => setContextMenu(null)}>
          <div className={styles.grid} role="grid" aria-label="Encounter board">
            {indices.map((row) =>
              indices.map((col) => {
                const cellKey = `${row}-${col}`;
                const cell = board.getCell(row, col);
                return (
                  <EncounterBoardCell
                    key={cellKey}
                    cell={cell}
                    col={col}
                    defaultEnvironment={board.boardState.defaultEnvironment}
                    environmentById={board.environmentById}
                    isRejected={board.rejectedCellKey === cellKey}
                    isSelectedCell={board.selectedTokenRef?.cellKey === cellKey}
                    row={row}
                    selectedTokenId={selectedTokenId}
                    onClick={handleCellClick}
                    onDropToken={handleDropToken}
                    onMoveToken={(targetRow, targetCol, tokenId) => board.moveToken(tokenId, targetRow, targetCol)}
                    onTokenDragStart={handleTokenDragStart}
                    onTokenContextMenu={handleTokenContextMenu}
                  />
                );
              }),
            )}
          </div>
        </div>

        <TokenDetailPanel
          token={board.selectedToken}
          onAddNamedRoll={board.addNamedRoll}
          onClose={() => board.setSelectedTokenRef(null)}
          onRemove={board.removeToken}
          onRemoveNamedRoll={board.removeNamedRoll}
          onUpdate={board.updateToken}
        />
      </div>

      {addPopover ? (
        <div className={styles.popover} style={{ left: addPopover.x, top: addPopover.y }}>
          <div className={styles.popoverHeader}>
            <strong>Add Token</strong>
            <button type="button" onClick={() => setAddPopover(null)}>
              X
            </button>
          </div>
          <TokenPalette
            compact
            isReloading={board.isReloadingLibraries}
            libraryStatus={board.libraryStatus}
            palette={board.palette}
            onReloadLibraries={board.reloadLibraries}
            onAdhocCreate={(draft) => {
              if (board.placeAdhocToken(addPopover.row, addPopover.col, draft)) {
                setAddPopover(null);
              }
            }}
            onTokenClick={placeFromPopover}
          />
        </div>
      ) : null}

      {contextMenu ? (
        <div className={styles.contextMenu} style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            onClick={() => {
              board.removeToken(contextMenu.token.id);
              setContextMenu(null);
            }}
          >
            Remove {contextMenu.token.name}
          </button>
          <button
            type="button"
            onClick={() => {
              board.clearCell(contextMenu.row, contextMenu.col);
              setContextMenu(null);
            }}
          >
            Clear all tokens from cell
          </button>
          <button
            type="button"
            onClick={() => {
              board.resetCellEnvironment(contextMenu.row, contextMenu.col);
              setContextMenu(null);
            }}
          >
            Reset cell color to default
          </button>
        </div>
      ) : null}
    </section>
  );
}
