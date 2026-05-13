# backend/tests/conftest.py
import sys
import os
from pathlib import Path

# Add the parent directory (backend) to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
import tempfile
from fastapi.testclient import TestClient
from app.main import app
import app.db as db_module

@pytest.fixture(scope="function")
def test_db():
    """Create isolated test database for each test"""
    # Create temp file
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    
    # Set the database path
    original_path = db_module.DATABASE_PATH
    db_module.DATABASE_PATH = tmp_path
    
    # Initialize tables
    db_module.initialize_app_tables()
    
    yield tmp_path
    
    # Cleanup: close any open connections first
    # Force garbage collection to close any lingering connections
    import gc
    gc.collect()
    
    # Reset database path
    db_module.DATABASE_PATH = original_path
    
    # Try to delete the temp file, with retry
    for _ in range(3):
        try:
            if tmp_path.exists():
                tmp_path.unlink()
            break
        except PermissionError:
            import time
            time.sleep(0.1)
            continue

@pytest.fixture(scope="function")
def client(test_db):
    """Test client with clean database"""
    with TestClient(app) as test_client:
        yield test_client