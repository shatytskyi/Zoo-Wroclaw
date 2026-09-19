import n0 from "./walk-nodes-0.json";
import n1 from "./walk-nodes-1.json";
import n2 from "./walk-nodes-2.json";
import edges from "./walk-edges.json";

export const WALK_NODES = [...n0, ...n1, ...n2] as [number, number][];
export const WALK_EDGES = edges as [number, number][];
