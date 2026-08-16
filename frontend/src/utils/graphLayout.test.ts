import { describe, expect, it } from "vitest";

import type { KnowledgeGraph } from "../types/note";
import { layoutGraph } from "./graphLayout";

const graph: KnowledgeGraph = {
  nodes: [
    { id: "a", title: "Atlas", tags: [], updated_at: "2026-08-16T00:00:00Z", degree: 1 },
    { id: "c", title: "Cortex", tags: [], updated_at: "2026-08-16T00:00:00Z", degree: 1 },
  ],
  edges: [{ source: "a", target: "c" }],
};

describe("layoutGraph", () => {
  it("returns stable bounded positions for every node", () => {
    const first = layoutGraph(graph, 800, 600);
    const second = layoutGraph(graph, 800, 600);

    expect(first).toEqual(second);
    expect(first.nodes).toHaveLength(2);
    for (const node of first.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(54);
      expect(node.x).toBeLessThanOrEqual(746);
      expect(node.y).toBeGreaterThanOrEqual(54);
      expect(node.y).toBeLessThanOrEqual(546);
    }
  });

  it("handles an empty graph", () => {
    expect(layoutGraph({ nodes: [], edges: [] })).toEqual({ nodes: [], edges: [] });
  });
});
