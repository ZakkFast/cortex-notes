from app.utils.wiki_links import extract_wiki_links


def test_extracts_unique_clean_wiki_links() -> None:
    content = "See [[Project Atlas]] and [[  Project   Atlas ]] plus [[Cortex]]."
    assert extract_wiki_links(content) == ["Project Atlas", "Cortex"]


def test_ignores_empty_and_multiline_links() -> None:
    content = "[[]] [[   ]] [[broken\nlink]] [[Valid]]"
    assert extract_wiki_links(content) == ["Valid"]
