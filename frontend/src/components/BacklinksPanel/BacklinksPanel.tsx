import type { Backlink } from "../../types/note";
import "./BacklinksPanel.css";

type BacklinksPanelProps = {
  backlinks: Backlink[];
  onOpen: (noteId: string) => void;
};

export function BacklinksPanel({ backlinks, onOpen }: BacklinksPanelProps) {
  return (
    <aside className="backlinks-panel">
      <div className="backlinks-panel__heading">
        <span>Backlinks</span>
        <span className="backlinks-panel__count">{backlinks.length}</span>
      </div>
      {backlinks.length === 0 ? <p className="backlinks-panel__empty">Nothing links here yet.</p> : null}
      <div className="backlinks-panel__list">
        {backlinks.map((backlink) => (
          <button className="backlinks-panel__item" type="button" key={backlink.id} onClick={() => onOpen(backlink.id)}>
            {backlink.title}
          </button>
        ))}
      </div>
    </aside>
  );
}
