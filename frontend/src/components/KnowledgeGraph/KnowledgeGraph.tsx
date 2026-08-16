import { useMemo, useState } from "react";

import type { KnowledgeGraph as KnowledgeGraphData } from "../../types/note";
import { layoutGraph } from "../../utils/graphLayout";
import "./KnowledgeGraph.css";

const WIDTH = 1000;
const HEIGHT = 700;

type KnowledgeGraphProps = {
  graph: KnowledgeGraphData;
  loading: boolean;
  onRefresh: () => void;
  onOpenNote: (noteId: string) => void;
};

function shortenTitle(title: string): string {
  return title.length > 30 ? `${title.slice(0, 29)}…` : title;
}

export function KnowledgeGraph({ graph, loading, onRefresh, onOpenNote }: KnowledgeGraphProps) {
  const [query, setQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const positioned = useMemo(() => layoutGraph(graph, WIDTH, HEIGHT), [graph]);
  const nodesById = useMemo(() => new Map(positioned.nodes.map((node) => [node.id, node])), [positioned.nodes]);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchingIds = useMemo(() => {
    if (!normalizedQuery) return new Set<string>();
    return new Set(
      positioned.nodes
        .filter((node) => `${node.title} ${node.tags.join(" ")}`.toLocaleLowerCase().includes(normalizedQuery))
        .map((node) => node.id),
    );
  }, [normalizedQuery, positioned.nodes]);
  const connectedIds = useMemo(() => {
    const ids = new Set<string>();
    if (!hoveredId) return ids;
    ids.add(hoveredId);
    for (const edge of positioned.edges) {
      if (edge.source === hoveredId) ids.add(edge.target);
      if (edge.target === hoveredId) ids.add(edge.source);
    }
    return ids;
  }, [hoveredId, positioned.edges]);

  const viewWidth = WIDTH / zoom;
  const viewHeight = HEIGHT / zoom;
  const viewBox = `${(WIDTH - viewWidth) / 2} ${(HEIGHT - viewHeight) / 2} ${viewWidth} ${viewHeight}`;

  function nodeOpacity(nodeId: string): number {
    if (hoveredId) return connectedIds.has(nodeId) ? 1 : 0.18;
    if (normalizedQuery) return matchingIds.has(nodeId) ? 1 : 0.16;
    return 1;
  }

  function edgeOpacity(source: string, target: string): number {
    if (hoveredId) return source === hoveredId || target === hoveredId ? 0.85 : 0.06;
    if (normalizedQuery) return matchingIds.has(source) || matchingIds.has(target) ? 0.7 : 0.05;
    return 0.34;
  }

  return (
    <main className="knowledge-graph">
      <header className="knowledge-graph__header">
        <div>
          <p className="knowledge-graph__eyebrow">Cortex</p>
          <h2 className="knowledge-graph__title">Knowledge Graph</h2>
          <p className="knowledge-graph__summary">
            {graph.nodes.length} {graph.nodes.length === 1 ? "note" : "notes"} · {graph.edges.length} {graph.edges.length === 1 ? "link" : "links"}
          </p>
        </div>
        <div className="knowledge-graph__actions">
          <button type="button" onClick={() => setZoom((current) => Math.max(1, Number((current - 0.2).toFixed(1))))} disabled={zoom <= 1} aria-label="Zoom out">
            −
          </button>
          <span className="knowledge-graph__zoom">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((current) => Math.min(2, Number((current + 0.2).toFixed(1))))} disabled={zoom >= 2} aria-label="Zoom in">
            +
          </button>
          <button type="button" onClick={onRefresh} disabled={loading}>Refresh</button>
        </div>
      </header>

      <div className="knowledge-graph__toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a node"
          aria-label="Find a node in the knowledge graph"
        />
        <p className="knowledge-graph__hint">
          <span className="knowledge-graph__hint-pointer">Hover to isolate connections. Click a node to open the note.</span>
          <span className="knowledge-graph__hint-touch">Tap a node to open the note.</span>
        </p>
      </div>

      <div className="knowledge-graph__canvas">
        {loading ? <div className="knowledge-graph__state">Building graph</div> : null}
        {!loading && graph.nodes.length === 0 ? (
          <div className="knowledge-graph__state">
            <strong>No nodes yet</strong>
            <span>Create notes and connect them with [[wiki links]].</span>
          </div>
        ) : null}
        {!loading && graph.nodes.length > 0 ? (
          <svg className="knowledge-graph__svg" viewBox={viewBox} role="img" aria-label="Interactive graph of linked Cortex notes">
            <g className="knowledge-graph__edges">
              {positioned.edges.map((edge) => {
                const source = nodesById.get(edge.source);
                const target = nodesById.get(edge.target);
                if (!source || !target) return null;
                return (
                  <line
                    key={`${edge.source}-${edge.target}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    style={{ opacity: edgeOpacity(edge.source, edge.target) }}
                  />
                );
              })}
            </g>
            <g className="knowledge-graph__nodes">
              {positioned.nodes.map((node) => {
                const radius = 7 + Math.min(node.degree, 8) * 0.8;
                const matched = matchingIds.has(node.id);
                return (
                  <g
                    className={`knowledge-graph__node${matched ? " knowledge-graph__node--match" : ""}`}
                    key={node.id}
                    transform={`translate(${node.x} ${node.y})`}
                    style={{ opacity: nodeOpacity(node.id) }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${node.title}`}
                    onPointerEnter={() => setHoveredId(node.id)}
                    onPointerLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(node.id)}
                    onBlur={() => setHoveredId(null)}
                    onClick={() => onOpenNote(node.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") onOpenNote(node.id);
                    }}
                  >
                    <circle className="knowledge-graph__node-hit" r={radius + 15} />
                    <circle className="knowledge-graph__node-dot" r={radius} />
                    <text x={radius + 7} y="4">{shortenTitle(node.title)}</text>
                    <title>{node.title}{node.tags.length ? ` · ${node.tags.join(", ")}` : ""}</title>
                  </g>
                );
              })}
            </g>
          </svg>
        ) : null}
      </div>
    </main>
  );
}
