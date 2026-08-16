import type { Backlink } from "../../types/note";
import "./BacklinksPanel.css";

type BacklinksPanelProps = {
  backlinks: Backlink[];
  mobileOpen: boolean;
  onOpen: (noteId: string) => void;
  onMobileClose: () => void;
};

export function BacklinksPanel({ backlinks, mobileOpen, onOpen, onMobileClose }: BacklinksPanelProps) {
  return (
    <aside className={`backlinks-panel${mobileOpen ? " backlinks-panel--mobile-open" : ""}`}>
      <div className="backlinks-panel__heading">
        <div className="backlinks-panel__title-row">
          <span>Backlinks</span>
          <span className="backlinks-panel__count">{backlinks.length}</span>
        </div>
        <button className="backlinks-panel__mobile-close" type="button" onClick={onMobileClose}>
          Close
        </button>
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
