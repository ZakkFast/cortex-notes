import "./MobileHeader.css";

type MobileHeaderProps = {
  title: string;
  backlinkCount: number;
  showBacklinks: boolean;
  onOpenNavigation: () => void;
  onOpenBacklinks: () => void;
};

export function MobileHeader({
  title,
  backlinkCount,
  showBacklinks,
  onOpenNavigation,
  onOpenBacklinks,
}: MobileHeaderProps) {
  return (
    <header className="mobile-header">
      <button className="mobile-header__button" type="button" onClick={onOpenNavigation}>
        Menu
      </button>
      <div className="mobile-header__identity">
        <span className="mobile-header__eyebrow">Cortex</span>
        <span className="mobile-header__title">{title}</span>
      </div>
      {showBacklinks ? (
        <button className="mobile-header__button mobile-header__button--links" type="button" onClick={onOpenBacklinks}>
          Links {backlinkCount}
        </button>
      ) : (
        <span className="mobile-header__spacer" aria-hidden="true" />
      )}
    </header>
  );
}
