def test_note_crud_backlinks_search_and_trash(client) -> None:
    cortex = client.post("/api/notes", json={"title": "Cortex", "content": "Home note", "tags": ["productivity"]})
    assert cortex.status_code == 201
    cortex_note = cortex.json()

    atlas = client.post("/api/notes", json={"title": "Atlas", "content": "Links to [[Cortex]]", "tags": ["ai"]})
    assert atlas.status_code == 201
    atlas_note = atlas.json()

    backlinks = client.get(f"/api/notes/{cortex_note['id']}/backlinks")
    assert backlinks.status_code == 200
    assert [note["title"] for note in backlinks.json()] == ["Atlas"]

    search = client.get("/api/notes", params={"search": "productivity"})
    assert search.status_code == 200
    assert [note["title"] for note in search.json()] == ["Cortex"]

    duplicate = client.patch(f"/api/notes/{atlas_note['id']}", json={"title": "cortex"})
    assert duplicate.status_code == 409
    assert "already exists" in duplicate.json()["detail"]

    deleted = client.delete(f"/api/notes/{atlas_note['id']}")
    assert deleted.status_code == 204

    active = client.get("/api/notes")
    assert [note["title"] for note in active.json()] == ["Cortex"]

    trash = client.get("/api/notes", params={"trash": "true"})
    assert [note["title"] for note in trash.json()] == ["Atlas"]

    restored = client.post(f"/api/notes/{atlas_note['id']}/restore")
    assert restored.status_code == 200
    assert restored.json()["deleted_at"] is None


def test_knowledge_graph_includes_active_resolved_links(client) -> None:
    cortex = client.post("/api/notes", json={"title": "Cortex", "content": "[[Atlas]] [[Missing Note]]", "tags": ["notes"]}).json()
    atlas = client.post("/api/notes", json={"title": "Atlas", "content": "[[Cortex]]", "tags": ["ai"]}).json()
    archive = client.post("/api/notes", json={"title": "Archive", "content": "[[Cortex]]"}).json()
    client.delete(f"/api/notes/{archive['id']}")

    response = client.get("/api/notes/graph")

    assert response.status_code == 200
    graph = response.json()
    assert [node["title"] for node in graph["nodes"]] == ["Atlas", "Cortex"]
    assert {node["title"]: node["degree"] for node in graph["nodes"]} == {"Atlas": 1, "Cortex": 1}
    assert len(graph["edges"]) == 1
    edge = graph["edges"][0]
    assert {edge["source"], edge["target"]} == {atlas["id"], cortex["id"]}


def test_settings_validate_and_persist_accent(client) -> None:
    default = client.get("/api/settings")
    assert default.json()["accent_color"] == "#8b9cff"

    updated = client.patch("/api/settings", json={"accent_color": "#D97757"})
    assert updated.status_code == 200
    assert updated.json()["accent_color"] == "#d97757"

    invalid = client.patch("/api/settings", json={"accent_color": "orange"})
    assert invalid.status_code == 422
