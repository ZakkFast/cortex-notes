import ReactMarkdown from "react-markdown";

import type { NoteDraft, SaveState } from "../../types/note";
import { toMarkdownWikiLinks, wikiTitleFromHref } from "../../utils/wikiLinks";
import "./NoteEditor.css";

type NoteEditorProps = {
  draft: NoteDraft;
  deleted: boolean;
  mode: "write" | "preview";
  saveState: SaveState;
  onDraftChange: (draft: NoteDraft) => void;
  onModeChange: (mode: "write" | "preview") => void;
  onDelete: () => void;
  onRestore: () => void;
  onOpenWikiTitle: (title: string) => void;
};

function saveLabel(saveState: SaveState): string {
  if (saveState === "saving") return "Saving";
  if (saveState === "saved") return "Saved";
  if (saveState === "error") return "Save failed";
  return "";
}

export function NoteEditor({
  draft,
  deleted,
  mode,
  saveState,
  onDraftChange,
  onModeChange,
  onDelete,
  onRestore,
  onOpenWikiTitle,
}: NoteEditorProps) {
  return (
    <main className="note-editor">
      <header className="note-editor__header">
        <input
          className="note-editor__title"
          value={draft.title}
          onChange={(event) => onDraftChange({ ...draft, title: event.target.value })}
          aria-label="Note title"
        />
        <div className="note-editor__toolbar">
          {!deleted ? <span className={`note-editor__save note-editor__save--${saveState}`}>{saveLabel(saveState)}</span> : null}
          <div className="note-editor__mode-switch" aria-label="Editor mode">
            <button
              className={`note-editor__mode${mode === "write" ? " note-editor__mode--active" : ""}`}
              type="button"
              onClick={() => onModeChange("write")}
            >
              Write
            </button>
            <button
              className={`note-editor__mode${mode === "preview" ? " note-editor__mode--active" : ""}`}
              type="button"
              onClick={() => onModeChange("preview")}
            >
              Preview
            </button>
          </div>
          <button className="note-editor__danger-action" type="button" onClick={deleted ? onRestore : onDelete}>
            {deleted ? "Restore" : "Trash"}
          </button>
        </div>
      </header>

      <div className="note-editor__tags-row">
        <span className="note-editor__tags-label">Tags</span>
        <input
          className="note-editor__tags-input"
          value={draft.tags.join(", ")}
          onChange={(event) =>
            onDraftChange({
              ...draft,
              tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean),
            })
          }
          placeholder="project, research"
          disabled={deleted}
          aria-label="Tags"
        />
      </div>

      <section className="note-editor__body">
        {mode === "write" ? (
          <textarea
            className="note-editor__textarea"
            value={draft.content}
            onChange={(event) => onDraftChange({ ...draft, content: event.target.value })}
            placeholder="Start writing. Link another note with [[Note Title]]."
            disabled={deleted}
            aria-label="Note content"
          />
        ) : (
          <article className="note-editor__preview">
            {draft.content.trim() ? (
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => {
                    const wikiTitle = wikiTitleFromHref(href);
                    if (wikiTitle) {
                      return (
                        <button className="note-editor__wiki-link" type="button" onClick={() => onOpenWikiTitle(wikiTitle)}>
                          {children}
                        </button>
                      );
                    }
                    return (
                      <a href={href} target="_blank" rel="noreferrer">
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {toMarkdownWikiLinks(draft.content)}
              </ReactMarkdown>
            ) : (
              <p className="note-editor__preview-empty">Nothing to preview yet.</p>
            )}
          </article>
        )}
      </section>
    </main>
  );
}
