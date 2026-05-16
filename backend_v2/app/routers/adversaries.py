from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.repositories.builders import (
    create_adversary as create_adversary_record,
    delete_adversary as delete_adversary_record,
    get_adversary,
    list_adversaries as list_adversary_records,
    update_adversary as update_adversary_record,
)
from app.schemas.models import AdversaryCreate, AdversaryResponse

router = APIRouter(prefix="/adversaries", tags=["adversaries"])


@router.get("", response_model=list[AdversaryResponse])
def list_adversaries() -> list[AdversaryResponse]:
    return [AdversaryResponse(**row) for row in list_adversary_records()]


@router.get("/{adversary_id}", response_model=AdversaryResponse)
def get_adversary_by_id(adversary_id: int) -> AdversaryResponse:
    adversary = get_adversary(adversary_id)
    if adversary is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Adversary not found")
    return AdversaryResponse(**adversary)


@router.post("", response_model=AdversaryResponse, status_code=status.HTTP_201_CREATED)
def create_adversary(payload: AdversaryCreate) -> AdversaryResponse:
    return AdversaryResponse(**create_adversary_record(payload))


@router.put("/{adversary_id}", response_model=AdversaryResponse)
def update_adversary(adversary_id: int, payload: AdversaryCreate) -> AdversaryResponse:
    existing = get_adversary(adversary_id)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Adversary not found")

    updated = update_adversary_record(adversary_id, payload)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Adversary not found")
    return AdversaryResponse(**updated)


@router.delete("/{adversary_id}", status_code=status.HTTP_200_OK)
def delete_adversary(adversary_id: int) -> dict[str, str]:
    existing = get_adversary(adversary_id)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Adversary not found")

    delete_adversary_record(adversary_id)
    return {"message": "Adversary deleted successfully"}
