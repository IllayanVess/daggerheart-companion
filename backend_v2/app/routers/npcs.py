from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.repositories.builders import (
    create_npc as create_npc_record,
    delete_npc as delete_npc_record,
    get_npc,
    list_npcs as list_npc_records,
    update_npc as update_npc_record,
)
from app.schemas.models import NPCCreate, NPCResponse

router = APIRouter(prefix="/npcs", tags=["npcs"])


@router.get("", response_model=list[NPCResponse])
def list_npcs() -> list[NPCResponse]:
    return [NPCResponse(**row) for row in list_npc_records()]


@router.get("/{npc_id}", response_model=NPCResponse)
def get_npc_by_id(npc_id: int) -> NPCResponse:
    npc = get_npc(npc_id)
    if npc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NPC not found")
    return NPCResponse(**npc)


@router.post("", response_model=NPCResponse, status_code=status.HTTP_201_CREATED)
def create_npc(payload: NPCCreate) -> NPCResponse:
    return NPCResponse(**create_npc_record(payload))


@router.put("/{npc_id}", response_model=NPCResponse)
def update_npc(npc_id: int, payload: NPCCreate) -> NPCResponse:
    existing = get_npc(npc_id)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NPC not found")

    updated = update_npc_record(npc_id, payload)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NPC not found")
    return NPCResponse(**updated)


@router.delete("/{npc_id}", status_code=status.HTTP_200_OK)
def delete_npc(npc_id: int) -> dict[str, str]:
    existing = get_npc(npc_id)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NPC not found")

    delete_npc_record(npc_id)
    return {"message": "NPC deleted successfully"}
