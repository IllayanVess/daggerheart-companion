from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.repositories.builders import (
    create_environment as create_environment_record,
    delete_environment as delete_environment_record,
    get_environment,
    list_environments as list_environment_records,
    update_environment as update_environment_record,
)
from app.schemas.models import EnvironmentCreate, EnvironmentResponse

router = APIRouter(prefix="/environments", tags=["environments"])


@router.get("", response_model=list[EnvironmentResponse])
def list_environments() -> list[EnvironmentResponse]:
    return [EnvironmentResponse(**row) for row in list_environment_records()]


@router.get("/{environment_id}", response_model=EnvironmentResponse)
def get_environment_by_id(environment_id: int) -> EnvironmentResponse:
    environment = get_environment(environment_id)
    if environment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Environment not found")
    return EnvironmentResponse(**environment)


@router.post("", response_model=EnvironmentResponse, status_code=status.HTTP_201_CREATED)
def create_environment(payload: EnvironmentCreate) -> EnvironmentResponse:
    return EnvironmentResponse(**create_environment_record(payload))


@router.put("/{environment_id}", response_model=EnvironmentResponse)
def update_environment(environment_id: int, payload: EnvironmentCreate) -> EnvironmentResponse:
    existing = get_environment(environment_id)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Environment not found")

    updated = update_environment_record(environment_id, payload)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Environment not found")
    return EnvironmentResponse(**updated)


@router.delete("/{environment_id}", status_code=status.HTTP_200_OK)
def delete_environment(environment_id: int) -> dict[str, str]:
    existing = get_environment(environment_id)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Environment not found")

    delete_environment_record(environment_id)
    return {"message": "Environment deleted successfully"}
