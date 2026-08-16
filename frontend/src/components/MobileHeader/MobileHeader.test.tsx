import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { MobileHeader } from "./MobileHeader";

describe("MobileHeader", () => {
  it("renders the current view and backlink count", () => {
    const markup = renderToStaticMarkup(
      <MobileHeader
        title="Atlas"
        backlinkCount={3}
        showBacklinks
        onOpenNavigation={vi.fn()}
        onOpenBacklinks={vi.fn()}
      />,
    );

    expect(markup).toContain("Cortex");
    expect(markup).toContain("Atlas");
    expect(markup).toContain("Links 3");
  });

  it("keeps the header balanced when backlinks are unavailable", () => {
    const markup = renderToStaticMarkup(
      <MobileHeader
        title="Knowledge Graph"
        backlinkCount={0}
        showBacklinks={false}
        onOpenNavigation={vi.fn()}
        onOpenBacklinks={vi.fn()}
      />,
    );

    expect(markup).toContain("Knowledge Graph");
    expect(markup).not.toContain("Links 0");
    expect(markup).toContain("mobile-header__spacer");
  });
});
