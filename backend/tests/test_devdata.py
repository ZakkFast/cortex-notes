import pytest

from app.devdata import assert_dev_database, build_seed_notes


def test_dev_database_guard_accepts_only_explicit_dev_database() -> None:
    assert_dev_database("postgresql+psycopg://cortex:test@db:5432/cortex_dev", "1")

    with pytest.raises(RuntimeError, match="disabled"):
        assert_dev_database("postgresql+psycopg://cortex:test@db:5432/cortex_dev", None)

    with pytest.raises(RuntimeError, match="non-dev database"):
        assert_dev_database("postgresql+psycopg://cortex:test@db:5432/cortex", "1")


def test_seed_dataset_is_large_linked_and_deterministic() -> None:
    notes = build_seed_notes()
    titles = [note.title for note in notes]

    assert len(notes) == 52
    assert len(set(titles)) == 52
    assert all("seed" in note.tags for note in notes)
    assert sum("[[" in note.content for note in notes) >= 48
    assert {"Atlas", "Cortex", "Homelab", "Knowledge Graph", "Old Scratchpad"}.issubset(titles)
