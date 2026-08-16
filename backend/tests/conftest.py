import os
from pathlib import Path

os.environ["DATABASE_URL"] = "sqlite:///./test-cortex.db"

import pytest
from fastapi.testclient import TestClient

from app.db import Base, engine
from app.main import app


@pytest.fixture(autouse=True)
def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    Path("test-cortex.db").unlink(missing_ok=True)


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
