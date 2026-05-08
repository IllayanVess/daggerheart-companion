from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter

from app.db import get_connection
from app.schemas.models import BoardState

router = APIRouter(prefix="/encounter-board", tags=["encounter-board"])

DEFAULT_BOARD_ID = "default"


def _empty_board(board_id: str = DEFAULT_BOARD_ID) -> BoardState:
    return BoardState(id=board_id, defaultEnvironment=None, cells={})


def _read_board_payload(raw_payload: str | None) -> dict[str, Any]:
    if not raw_payload:
        return {}

    try:
        payload = json.loads(raw_payload)
    except json.JSONDecodeError:
        return {}

    return payload if isinstance(payload, dict) else {}


@router.get("/", response_model=BoardState)
def fetch_encounter_board() -> BoardState:
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT id, state_json
            FROM encounter_boards
            WHERE id = ?
            """,
            (DEFAULT_BOARD_ID,),
        ).fetchone()

    if row is None:
        return _empty_board()

    payload = _read_board_payload(row["state_json"])
    return BoardState(**{**payload, "id": row["id"]})


@router.put("/", response_model=BoardState)
def save_encounter_board(payload: BoardState) -> BoardState:
    board = BoardState(id=DEFAULT_BOARD_ID, defaultEnvironment=payload.defaultEnvironment, cells=payload.cells)
    state_json = board.model_dump_json()

    with get_connection() as connection:
        connection.execute(
            """
            INSERT OR REPLACE INTO encounter_boards (id, state_json, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            """,
            (board.id, state_json),
        )
        connection.commit()

    return board
