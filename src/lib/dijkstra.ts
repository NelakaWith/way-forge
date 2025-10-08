import { LatLngExpression } from "leaflet";

/**
 * GraphNode represents a single node within the in-memory graph used by the
 * Dijkstra implementation. Each node stores:
 * - id: a unique string identifier for the node
 * - position: a Leaflet-compatible LatLngExpression (either [lat, lng]
 *   tuple or an object with { lat, lng }) used only for mapping/visualization
 * - name: human-friendly label
 * - connections: a map of neighbor nodeId -> edge weight (distance in km)
 */
export interface GraphNode {
  id: string;
  position: LatLngExpression;
  name: string;
  connections: { [nodeId: string]: number }; // nodeId -> distance (kilometers)
}

/**
 * RouteResult is the lightweight result returned by findShortestPath.
 * - path: ordered list of node ids from start -> end
 * - distance: total path distance in kilometers
 * - coordinates: an array of LatLngExpression corresponding to nodes in 'path'
 */
export interface RouteResult {
  path: string[];
  distance: number;
  coordinates: LatLngExpression[];
}

/* -------------------------------------------------------------------------- */
/* Utility: Haversine distance                                                  */
/* -------------------------------------------------------------------------- */
/**
 * calculateDistance
 * ------------------
 * Returns the great-circle distance between two coordinates using the
 * Haversine formula. The function accepts Leaflet's LatLngExpression which
 * may be either a tuple [lat, lng] or an object { lat, lng }.
 *
 * Notes / assumptions:
 * - Result unit: kilometers (km)
 * - This is an approximation suitable for routing heuristics and graph
 *   construction. For high-precision routing on small scales, consider
 *   using a more robust geodetic library.
 * - Input coordinates are expected to be in decimal degrees.
 *
 * Complexity: O(1)
 */
export function calculateDistance(
  pos1: LatLngExpression,
  pos2: LatLngExpression
): number {
  // Normalize inputs to numeric lat/lng
  const lat1 = Array.isArray(pos1) ? pos1[0] : pos1.lat;
  const lng1 = Array.isArray(pos1) ? pos1[1] : pos1.lng;
  const lat2 = Array.isArray(pos2) ? pos2[0] : pos2.lat;
  const lng2 = Array.isArray(pos2) ? pos2[1] : pos2.lng;

  // Earth's radius (approx.) in kilometers
  const R = 6371;

  // Convert degree differences to radians
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/* -------------------------------------------------------------------------- */
/* Core algorithm: Dijkstra's shortest path (basic implementation)             */
/* -------------------------------------------------------------------------- */
/**
 * findShortestPath
 * ----------------
 * A straightforward (non-optimized) implementation of Dijkstra's algorithm.
 * It expects a graph represented as a map of nodeId -> GraphNode where each
 * GraphNode.connections maps neighborId -> edge weight (distance in km).
 *
 * Behavior & edge cases:
 * - If either startId or endId does not exist in the graph, returns null.
 * - If no path exists between the two nodes, returns null.
 * - Uses simple sets and linear scans, so complexity is O(V^2 + E) in the
 *   worst case. For larger graphs, replace the selection of the minimum
 *   distance node with a binary heap (priority queue) to achieve O((V+E)
 *   log V).
 *
 * Returned object contains the ordered path, total distance (km), and the
 *   coordinates for each node in the path (useful for drawing on a map).
 */
export function findShortestPath(
  graph: Record<string, GraphNode>,
  startId: string,
  endId: string
): RouteResult | null {
  // Validate inputs
  if (!graph[startId] || !graph[endId]) {
    return null;
  }

  // distances[nodeId] = best known distance from startId to nodeId
  const distances: Record<string, number> = {};
  // previous[nodeId] = previous node id on the best path to nodeId
  const previous: Record<string, string | null> = {};

  // Visited/unvisited bookkeeping
  const visited = new Set<string>();
  const unvisited = new Set<string>();

  // Initialize distances: start has 0, others are Infinity
  Object.keys(graph).forEach((nodeId) => {
    distances[nodeId] = nodeId === startId ? 0 : Infinity;
    previous[nodeId] = null;
    unvisited.add(nodeId);
  });

  // Main loop: while there are nodes we haven't finalized
  while (unvisited.size > 0) {
    // Choose the unvisited node with the smallest tentative distance.
    // Note: this is O(V) per iteration. Use a priority queue for better
    // performance on large graphs.
    let currentNode: string | null = null;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        currentNode = nodeId;
      }
    }

    // If the smallest distance is Infinity or we couldn't pick a node,
    // there are unreachable nodes remaining and we can stop early.
    if (!currentNode || distances[currentNode] === Infinity) {
      break; // No path exists to remaining nodes
    }

    // Mark current node as finalized
    unvisited.delete(currentNode);
    visited.add(currentNode);

    // If we've reached the destination, we can exit the loop early.
    if (currentNode === endId) {
      break;
    }

    // Relax edges (currentNode -> neighbor)
    const connections = graph[currentNode].connections;
    Object.keys(connections).forEach((neighborId) => {
      // Only consider neighbors that haven't been finalized yet
      if (!visited.has(neighborId)) {
        const edgeWeight = connections[neighborId];
        const newDistance = distances[currentNode] + edgeWeight;
        if (newDistance < distances[neighborId]) {
          distances[neighborId] = newDistance;
          previous[neighborId] = currentNode;
        }
      }
    });
  }

  // If the end node remains at Infinity distance, there's no path
  if (distances[endId] === Infinity) {
    return null;
  }

  // Reconstruct the path backwards from endId -> startId using previous[]
  const path: string[] = [];
  let current: string | null = endId;

  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  // Convert path node ids to coordinates for map drawing
  const coordinates: LatLngExpression[] = path.map(
    (nodeId) => graph[nodeId].position
  );

  return {
    path,
    distance: distances[endId],
    coordinates,
  };
}

/* -------------------------------------------------------------------------- */
/* Helper: create a simple geometric graph from a set of nodes               */
/* -------------------------------------------------------------------------- */
/**
 * createSimpleGraph
 * -----------------
 * Build a naive undirected graph from a list of nodes by connecting each
 * node to its nearest neighbors. This is helpful for demoing algorithms
 * like Dijkstra when you don't have a precomputed road network. The
 * resulting graph uses the Haversine distance (in km) as edge weights.
 *
 * Parameters:
 * - nodes: array of { id, position, name }
 * - maxConnections: maximum number of nearest neighbors to connect to each
 *   node (default: 3)
 *
 * Behavior notes:
 * - Edges are added in both directions (graph[a].connections[b] and
 *   graph[b].connections[a]) so the returned graph is symmetric.
 * - This function's complexity is O(N^2 log N) dominated by the pairwise
 *   distance computation and per-node sorting; it's fine for small N (tens
 *   to low hundreds) but not intended for very large datasets.
 */
export function createSimpleGraph(
  nodes: Array<{ id: string; position: LatLngExpression; name: string }>,
  maxConnections = 3
): Record<string, GraphNode> {
  const graph: Record<string, GraphNode> = {};

  // Initialize graph nodes (empty connections)
  nodes.forEach((node) => {
    graph[node.id] = {
      ...node,
      connections: {},
    };
  });

  // For each node compute distances to all others, sort, and connect to the
  // nearest `maxConnections` neighbors.
  nodes.forEach((node) => {
    const distances: Array<{ nodeId: string; distance: number }> = [];

    nodes.forEach((otherNode) => {
      if (node.id !== otherNode.id) {
        const distance = calculateDistance(node.position, otherNode.position);
        distances.push({ nodeId: otherNode.id, distance });
      }
    });

    // Sort neighbor candidates by geographic distance ascending
    distances.sort((a, b) => a.distance - b.distance);

    // Connect to up to `maxConnections` nearest neighbors
    distances.slice(0, maxConnections).forEach(({ nodeId, distance }) => {
      graph[node.id].connections[nodeId] = distance;
      // Ensure bidirectional connectivity (overwrite if already set)
      graph[nodeId].connections[node.id] = distance;
    });
  });

  return graph;
}
