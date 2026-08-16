import type { GraphEdge, GraphNode, KnowledgeGraph } from "../types/note";

export type PositionedGraphNode = GraphNode & {
  x: number;
  y: number;
};

export type PositionedKnowledgeGraph = {
  nodes: PositionedGraphNode[];
  edges: GraphEdge[];
};

function titleSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

export function layoutGraph(graph: KnowledgeGraph, width = 1000, height = 700): PositionedKnowledgeGraph {
  if (graph.nodes.length === 0) return { nodes: [], edges: graph.edges };

  const padding = 54;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.max(80, Math.min(width, height) * 0.34);
  const positions = graph.nodes.map((node, index) => {
    const seed = titleSeed(node.title);
    const angle = index * 2.3999632297 + (seed % 360) * (Math.PI / 180) * 0.08;
    const distance = radius * (0.52 + ((seed % 37) / 100));
    return {
      ...node,
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
    };
  });

  const indexById = new Map(positions.map((node, index) => [node.id, index]));
  const area = width * height;
  const idealDistance = Math.sqrt(area / Math.max(positions.length, 1)) * 0.72;
  const iterations = Math.min(120, 58 + positions.length * 3);

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const displacement = positions.map(() => ({ x: 0, y: 0 }));

    for (let left = 0; left < positions.length; left += 1) {
      for (let right = left + 1; right < positions.length; right += 1) {
        const dx = positions[left].x - positions[right].x;
        const dy = positions[left].y - positions[right].y;
        const distance = Math.max(Math.hypot(dx, dy), 1);
        const force = (idealDistance * idealDistance) / distance;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        displacement[left].x += fx;
        displacement[left].y += fy;
        displacement[right].x -= fx;
        displacement[right].y -= fy;
      }
    }

    for (const edge of graph.edges) {
      const sourceIndex = indexById.get(edge.source);
      const targetIndex = indexById.get(edge.target);
      if (sourceIndex === undefined || targetIndex === undefined) continue;

      const dx = positions[sourceIndex].x - positions[targetIndex].x;
      const dy = positions[sourceIndex].y - positions[targetIndex].y;
      const distance = Math.max(Math.hypot(dx, dy), 1);
      const force = (distance * distance) / idealDistance * 0.12;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;
      displacement[sourceIndex].x -= fx;
      displacement[sourceIndex].y -= fy;
      displacement[targetIndex].x += fx;
      displacement[targetIndex].y += fy;
    }

    const temperature = Math.max(1.2, (Math.min(width, height) * 0.075) * (1 - iteration / iterations));
    for (let index = 0; index < positions.length; index += 1) {
      displacement[index].x += (centerX - positions[index].x) * 0.012;
      displacement[index].y += (centerY - positions[index].y) * 0.012;
      const magnitude = Math.max(Math.hypot(displacement[index].x, displacement[index].y), 1);
      const step = Math.min(magnitude, temperature);
      positions[index].x += (displacement[index].x / magnitude) * step;
      positions[index].y += (displacement[index].y / magnitude) * step;
      positions[index].x = Math.min(width - padding, Math.max(padding, positions[index].x));
      positions[index].y = Math.min(height - padding, Math.max(padding, positions[index].y));
    }
  }

  return { nodes: positions, edges: graph.edges };
}
