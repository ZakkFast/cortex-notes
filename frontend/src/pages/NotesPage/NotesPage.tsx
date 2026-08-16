import { useEffect, useMemo, useRef, useState } from "react";

import { ApiError } from "../../api/client";
import { notesApi } from "../../api/notes";
import { settingsApi } from "../../api/settings";
import { BacklinksPanel } from "../../components/BacklinksPanel/BacklinksPanel";
import { KnowledgeGraph } from "../../components/KnowledgeGraph/KnowledgeGraph";
import { NoteEditor } from "../../components/NoteEditor/NoteEditor";
import { NoteSidebar } from "../../components/NoteSidebar/NoteSidebar";
import { SettingsModal } from "../../components/SettingsModal/SettingsModal";
import { ToastViewport, type Toast } from "../../components/ToastViewport/ToastViewport";
import type { Backlink, KnowledgeGraph as KnowledgeGraphData, Note, NoteDraft, SaveState } from "../../types/note";
import "./NotesPage.css";

function toDraft(note: Note): NoteDraft {
  return { title: note.title, content: note.content, tags: note.tags };
}

function snapshot(draft: NoteDraft): string {
  return JSON.stringify(draft);
}

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selected, setSelected] = useState<Note | null>(null);
  const [draft, setDraft] = useState<NoteDraft | null>(null);
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [graphData, setGraphData] = useState<KnowledgeGraphData>({ nodes: [], edges: [] });
  const [search, setSearch] = useState("");
  const [trash, setTrash] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [graphLoading, setGraphLoading] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accentColor, setAccentColor] = useState("#8b9cff");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const draftRef = useRef<NoteDraft | null>(null);
  const lastSaved = useRef("");
  const toastId = useRef(0);

  function setCurrentDraft(nextDraft: NoteDraft | null) {
    draftRef.current = nextDraft;
    setDraft(nextDraft);
  }

  function addToast(message: string, tone: Toast["tone"] = "neutral") {
    const id = ++toastId.current;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
  }

  async function loadNotes(nextSearch = search, nextTrash = trash, keepSelection = true) {
    setLoading(true);
    try {
      const loaded = await notesApi.list(nextSearch, nextTrash);
      setNotes(loaded);
      if (!keepSelection || !selected || !loaded.some((note) => note.id === selected.id)) {
        const first = loaded[0] ?? null;
        setSelected(first);
        setCurrentDraft(first ? toDraft(first) : null);
        lastSaved.current = first ? snapshot(toDraft(first)) : "";
      }
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Cortex could not load notes.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadGraph() {
    setGraphLoading(true);
    try {
      setGraphData(await notesApi.graph());
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Cortex could not build the knowledge graph.", "error");
    } finally {
      setGraphLoading(false);
    }
  }

  useEffect(() => {
    settingsApi.get().then((settings) => {
      setAccentColor(settings.accent_color);
      document.documentElement.style.setProperty("--accent", settings.accent_color);
    }).catch((error) => addToast(error instanceof Error ? error.message : "Cortex could not load settings.", "error"));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadNotes(search, trash, true), 220);
    return () => window.clearTimeout(timer);
  }, [search, trash]);

  useEffect(() => {
    if (graphOpen) void loadGraph();
  }, [graphOpen]);

  useEffect(() => {
    if (!selected || selected.deleted_at) {
      setBacklinks([]);
      return;
    }
    notesApi.backlinks(selected.id).then(setBacklinks).catch(() => setBacklinks([]));
  }, [selected?.id, selected?.updated_at, selected?.deleted_at]);

  useEffect(() => {
    if (!selected || !draft || selected.deleted_at) return;
    const currentSnapshot = snapshot(draft);
    if (currentSnapshot === lastSaved.current) return;

    const noteId = selected.id;
    const sentDraft = draft;
    setSaveState("saving");
    const timer = window.setTimeout(async () => {
      try {
        const updated = await notesApi.update(noteId, sentDraft);
        setNotes((current) => current.map((note) => (note.id === updated.id ? updated : note)).sort((a, b) => b.updated_at.localeCompare(a.updated_at)));
        setSelected((current) => {
          if (current?.id !== noteId) return current;

          const savedDraft = toDraft(updated);
          lastSaved.current = snapshot(savedDraft);
          if (draftRef.current && snapshot(draftRef.current) === currentSnapshot) {
            setCurrentDraft(savedDraft);
            setSaveState("saved");
          } else {
            setSaveState("saving");
          }
          return updated;
        });
      } catch (error) {
        setSaveState("error");
        const message = error instanceof ApiError ? error.message : "Cortex could not save this note. Your unsaved text is still in the editor.";
        addToast(message, "error");
      }
    }, 650);

    return () => window.clearTimeout(timer);
  }, [draft, selected?.id, selected?.deleted_at]);

  const selectedDeleted = Boolean(selected?.deleted_at);
  const noteCountLabel = useMemo(() => `${notes.length} ${notes.length === 1 ? "note" : "notes"}`, [notes.length]);

  function selectNote(note: Note) {
    setGraphOpen(false);
    setSelected(note);
    setCurrentDraft(toDraft(note));
    lastSaved.current = snapshot(toDraft(note));
    setSaveState("idle");
    setMode("write");
  }

  async function createNote(title?: string) {
    try {
      const created = await notesApi.create(title ? { title } : {});
      setGraphOpen(false);
      setTrash(false);
      setSearch("");
      setNotes((current) => [created, ...current]);
      selectNote(created);
      return created;
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Cortex could not create a note.", "error");
      return null;
    }
  }

  async function deleteSelected() {
    if (!selected) return;
    try {
      await notesApi.remove(selected.id);
      addToast(`Moved "${selected.title}" to Trash.`);
      setSelected(null);
      setCurrentDraft(null);
      await loadNotes(search, trash, false);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Cortex could not move this note to Trash.", "error");
    }
  }

  async function restoreSelected() {
    if (!selected) return;
    try {
      const restored = await notesApi.restore(selected.id);
      addToast(`Restored "${restored.title}".`);
      await loadNotes(search, true, false);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Cortex could not restore this note.", "error");
    }
  }

  async function openBacklink(noteId: string) {
    const note = notes.find((candidate) => candidate.id === noteId) ?? (await notesApi.list()).find((candidate) => candidate.id === noteId);
    if (note) {
      setTrash(false);
      selectNote(note);
    }
  }

  async function openGraphNode(noteId: string) {
    try {
      const note = await notesApi.get(noteId);
      setSearch("");
      setTrash(false);
      selectNote(note);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Cortex could not open that graph node.", "error");
    }
  }

  async function openWikiTitle(title: string) {
    const allNotes = search || trash ? await notesApi.list() : notes;
    const existing = allNotes.find((note) => note.title.toLocaleLowerCase() === title.toLocaleLowerCase());
    if (existing) {
      setSearch("");
      setTrash(false);
      selectNote(existing);
      return;
    }
    await createNote(title);
  }

  async function saveSettings(nextAccent: string): Promise<boolean> {
    try {
      const saved = await settingsApi.update(nextAccent);
      setAccentColor(saved.accent_color);
      document.documentElement.style.setProperty("--accent", saved.accent_color);
      addToast("Settings saved.");
      return true;
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Cortex could not save settings.", "error");
      return false;
    }
  }

  return (
    <div className="notes-page">
      <NoteSidebar
        notes={notes}
        selectedId={selected?.id ?? null}
        search={search}
        trash={trash}
        graph={graphOpen}
        loading={loading}
        onSearchChange={setSearch}
        onSelect={selectNote}
        onCreate={() => void createNote()}
        onToggleTrash={(nextTrash) => {
          setGraphOpen(false);
          setTrash(nextTrash);
          setSearch("");
          setSelected(null);
          setCurrentDraft(null);
        }}
        onOpenGraph={() => {
          setGraphOpen(true);
          setTrash(false);
          setSearch("");
        }}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {graphOpen ? (
        <KnowledgeGraph
          graph={graphData}
          loading={graphLoading}
          onRefresh={() => void loadGraph()}
          onOpenNote={(noteId) => void openGraphNode(noteId)}
        />
      ) : selected && draft ? (
        <>
          <NoteEditor
            draft={draft}
            deleted={selectedDeleted}
            mode={mode}
            saveState={saveState}
            onDraftChange={setCurrentDraft}
            onModeChange={setMode}
            onDelete={() => void deleteSelected()}
            onRestore={() => void restoreSelected()}
            onOpenWikiTitle={(title) => void openWikiTitle(title)}
          />
          <BacklinksPanel backlinks={backlinks} onOpen={(noteId) => void openBacklink(noteId)} />
        </>
      ) : (
        <main className="notes-page__empty-state">
          <div className="notes-page__empty-inner">
            <p className="notes-page__empty-eyebrow">{trash ? "Trash" : "Cortex"}</p>
            <h2>{trash ? "Nothing selected" : "Start with a thought"}</h2>
            <p>{trash ? "Select a deleted note to review or restore it." : `Your workspace currently has ${noteCountLabel}.`}</p>
            {!trash ? <button type="button" onClick={() => void createNote()}>Create a note</button> : null}
          </div>
        </main>
      )}

      {settingsOpen ? <SettingsModal accentColor={accentColor} onClose={() => setSettingsOpen(false)} onSave={saveSettings} /> : null}
      <ToastViewport toasts={toasts} />
    </div>
  );
}
