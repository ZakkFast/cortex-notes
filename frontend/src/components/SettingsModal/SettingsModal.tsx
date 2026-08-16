import { useState, type CSSProperties } from "react";
import "./SettingsModal.css";

const PRESETS = ["#8b9cff", "#66a6a6", "#b08a72", "#a17fb3", "#7d9b73", "#c17767"];

type SettingsModalProps = {
  accentColor: string;
  onClose: () => void;
  onSave: (accentColor: string) => Promise<boolean>;
};

export function SettingsModal({ accentColor, onClose, onSave }: SettingsModalProps) {
  const [draftColor, setDraftColor] = useState(accentColor);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const saved = await onSave(draftColor);
      if (saved) onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="settings-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header className="settings-modal__header">
          <div>
            <p className="settings-modal__eyebrow">Cortex</p>
            <h2 className="settings-modal__title" id="settings-title">Settings</h2>
          </div>
          <button className="settings-modal__close" type="button" onClick={onClose}>Close</button>
        </header>

        <div className="settings-modal__content">
          <div className="settings-modal__setting">
            <div>
              <h3 className="settings-modal__setting-title">Accent color</h3>
              <p className="settings-modal__setting-copy">Used for focus, selected states, links, and restrained interface highlights.</p>
            </div>
            <div className="settings-modal__swatches">
              {PRESETS.map((color) => (
                <button
                  className={`settings-modal__swatch${draftColor.toLowerCase() === color ? " settings-modal__swatch--active" : ""}`}
                  key={color}
                  type="button"
                  style={{ "--swatch-color": color } as CSSProperties}
                  onClick={() => setDraftColor(color)}
                  aria-label={`Use accent ${color}`}
                />
              ))}
            </div>
            <div className="settings-modal__custom-color">
              <input type="color" value={draftColor} onChange={(event) => setDraftColor(event.target.value)} aria-label="Custom accent color" />
              <input value={draftColor} onChange={(event) => setDraftColor(event.target.value)} maxLength={7} aria-label="Accent hex color" />
            </div>
          </div>
        </div>

        <footer className="settings-modal__footer">
          <button className="settings-modal__secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="settings-modal__primary" type="button" onClick={handleSave} disabled={saving}>{saving ? "Saving" : "Save settings"}</button>
        </footer>
      </section>
    </div>
  );
}
