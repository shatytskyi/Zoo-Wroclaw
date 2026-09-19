import { WALK_EDGES, WALK_NODES } from "@/data/walk-graph";

export const ZOO_CENTER: [number, number] = [51.10425, 17.07485];
export const ZOO_BOUNDS: [[number, number], [number, number]] = [
  [51.1005, 17.0685],
  [51.108, 17.0804],
];
export const WALK_MPS = 1.25;

const adj: number[][] = Array.from({ length: WALK_NODES.length }, () => []);
for (const [a, b] of WALK_EDGES) {
  adj[a].push(b);
  adj[b].push(a);
}

export function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(meters: number, lang: "pl" | "ru" | "en"): string {
  if (meters < 950) {
    const m = Math.round(meters);
    if (lang === "ru") return `${m} м`;
    if (lang === "en") return `${m} m`;
    return `${m} m`;
  }
  const km = (meters / 1000).toFixed(1);
  if (lang === "ru") return `${km} км`;
  return `${km} km`;
}

export function formatWalk(meters: number, lang: "pl" | "ru" | "en"): string {
  const min = Math.max(1, Math.round(meters / WALK_MPS / 60));
  if (lang === "pl") return `${min} min`;
  if (lang === "ru") return `${min} мин`;
  return `${min} min`;
}

export function bearing(from: [number, number], to: [number, number]): number {
  const φ1 = (from[0] * Math.PI) / 180;
  const φ2 = (to[0] * Math.PI) / 180;
  const Δλ = ((to[1] - from[1]) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function isInsideZoo(lat: number, lon: number): boolean {
  return (
    lat >= ZOO_BOUNDS[0][0] - 0.002 &&
    lat <= ZOO_BOUNDS[1][0] + 0.002 &&
    lon >= ZOO_BOUNDS[0][1] - 0.002 &&
    lon <= ZOO_BOUNDS[1][1] + 0.002
  );
}

function nearestNode(p: [number, number]): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < WALK_NODES.length; i++) {
    const n = WALK_NODES[i];
    const d = (n[0] - p[0]) ** 2 + (n[1] - p[1]) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

export type WalkRoute = {
  path: [number, number][];
  distance: number;
};

type HeapItem = { d: number; id: number };

function heapPush(heap: HeapItem[], item: HeapItem) {
  heap.push(item);
  let i = heap.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (heap[p].d <= heap[i].d) break;
    const t = heap[p];
    heap[p] = heap[i];
    heap[i] = t;
    i = p;
  }
}

function heapPop(heap: HeapItem[]): HeapItem {
  const top = heap[0];
  const last = heap.pop()!;
  if (heap.length === 0) return top;
  heap[0] = last;
  let i = 0;
  for (;;) {
    const l = i * 2 + 1;
    const r = l + 1;
    let s = i;
    if (l < heap.length && heap[l].d < heap[s].d) s = l;
    if (r < heap.length && heap[r].d < heap[s].d) s = r;
    if (s === i) break;
    const t = heap[s];
    heap[s] = heap[i];
    heap[i] = t;
    i = s;
  }
  return top;
}

export function walkRoute(from: [number, number], to: [number, number]): WalkRoute {
  const start = nearestNode(from);
  const goal = nearestNode(to);
  if (start === goal) {
    const distance = haversine(from, to);
    return { path: [from, to], distance };
  }

  const dist = new Float64Array(WALK_NODES.length).fill(Infinity);
  const prev = new Int32Array(WALK_NODES.length).fill(-1);
  dist[start] = 0;
  const heap: HeapItem[] = [];
  heapPush(heap, { d: 0, id: start });

  while (heap.length) {
    const { d, id: u } = heapPop(heap);
    if (d !== dist[u]) continue;
    if (u === goal) break;
    const ul = WALK_NODES[u];
    for (const v of adj[u]) {
      const alt = d + haversine(ul, WALK_NODES[v]);
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
        heapPush(heap, { d: alt, id: v });
      }
    }
  }

  const chain: number[] = [];
  if (Number.isFinite(dist[goal])) {
    for (let cur = goal; cur !== -1; cur = prev[cur]) chain.push(cur);
    chain.reverse();
  }

  if (chain.length === 0) {
    return { path: [from, to], distance: haversine(from, to) };
  }

  const path: [number, number][] = [from];
  for (const i of chain) path.push(WALK_NODES[i]);
  path.push(to);

  let distance = 0;
  for (let i = 1; i < path.length; i++) distance += haversine(path[i - 1], path[i]);
  return { path, distance };
}

export function walkTour(points: [number, number][]): WalkRoute {
  const path: [number, number][] = [];
  let distance = 0;
  for (let i = 1; i < points.length; i++) {
    const seg = walkRoute(points[i - 1], points[i]);
    if (path.length) path.pop();
    path.push(...seg.path);
    distance += seg.distance;
  }
  return { path, distance };
}

export function alongPath(path: [number, number][], meters: number): [number, number] {
  if (path.length === 0) return ZOO_CENTER;
  if (meters <= 0) return path[0];
  let left = meters;
  for (let i = 1; i < path.length; i++) {
    const d = haversine(path[i - 1], path[i]);
    if (left <= d) {
      const t = d === 0 ? 0 : left / d;
      return [
        path[i - 1][0] + (path[i][0] - path[i - 1][0]) * t,
        path[i - 1][1] + (path[i][1] - path[i - 1][1]) * t,
      ];
    }
    left -= d;
  }
  return path[path.length - 1];
}

export function pathLength(path: [number, number][]): number {
  let n = 0;
  for (let i = 1; i < path.length; i++) n += haversine(path[i - 1], path[i]);
  return n;
}
