import { describe, expect, it } from "vitest";

import { toMarkdownWikiLinks, wikiTitleFromHref } from "./wikiLinks";

describe("wiki links", () => {
  it("converts wiki links into local markdown links", () => {
    expect(toMarkdownWikiLinks("See [[Project Atlas]] next.")).toBe("See [Project Atlas](#wiki:Project%20Atlas) next.");
  });

  it("decodes wiki link targets", () => {
    expect(wikiTitleFromHref("#wiki:Project%20Atlas")).toBe("Project Atlas");
    expect(wikiTitleFromHref("https://example.com")).toBeNull();
  });
});
