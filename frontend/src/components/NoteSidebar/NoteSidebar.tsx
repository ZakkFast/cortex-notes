import type { Note } from "../../types/note";
import "./NoteSidebar.css";

type NoteSidebarProps = {
  notes: Note[];
  selectedId: string | null;
  search: string;
  trash: boolean;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onSelect: (note: Note) => void;
  onCreate: () => void;
  onToggleTrash: (trash: boolean) => void;
  onOpenSettings: () => void;
};

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

export function NoteSidebar({
  notes,
  selectedId,
  search,
  trash,
  loading,
  onSearchChange,
  onSelect,
  onCreate,
  onToggleTrash,
  onOpenSettings,
}: NoteSidebarProps) {
  return (
    <aside className="note-sidebar">
      <header className="note-sidebar__header">
        <div>
          <p className="note-sidebar__eyebrow">Knowledge</p>
          <h1 className="note-sidebar__brand">Cortex</h1>
        </div>
        <button className="note-sidebar__new-button" type="button" onClick={onCreate} disabled={trash}>
          New note
        </button>
      </header>

      <input
        className="note-sidebar__search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search notes"
        aria-label="Search notes"
      />

      <nav className="note-sidebar__filters" aria-label="Note filters">
        <button
          className={`note-sidebar__filter${!trash ? " note-sidebar__filter--active" : ""}`}
          type="button"
          onClick={() => onToggleTrash(false)}
        >
          Notes
        </button>
        <button
          className={`note-sidebar__filter${trash ? " note-sidebar__filter--active" : ""}`}
          type="button"
          onClick={() => onToggleTrash(true)}
        >
          Trash
        </button>
      </nav>

      <div className="note-sidebar__list">
        {loading ? <p className="note-sidebar__empty">Loading</p> : null}
        {!loading && notes.length === 0 ? <p className="note-sidebar__empty">No notes here.</p> : null}
        {notes.map((note) => (
          <button
            className={`note-sidebar__note${selectedId === note.id ? " note-sidebar__note--active" : ""}`}
            type="button"
            key={note.id}
            onClick={() => onSelect(note)}
          >
            <span className="note-sidebar__note-title">{note.title}</span>
            <span className="note-sidebar__note-meta">
              <span>{formatUpdatedAt(note.updated_at)}</span>
              {note.tags.length > 0 ? <span>{note.tags.slice(0, 2).join(" · ")}</span> : null}
            </span>
          </button>
        ))}
      </div>

      <footer className="note-sidebar__footer">
        <button className="note-sidebar__settings-button" type="button" onClick={onOpenSettings}>
          Settings
        </button>
      </footer>
    </aside>
  );
}
