import { LatLngExpression } from "leaflet";

export interface GraphNode {
  id: string;
  position: LatLngExpression;
  name: string;
  connections: { [nodeId: string]: number }; // nodeId -> distance
}

export interface RouteResult {
  path: string[];
  distance: number;
  coordinates: LatLngExpression[];
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  pos1: LatLngExpression,
  pos2: LatLngExpression
): number {
  const lat1 = Array.isArray(pos1) ? pos1[0] : pos1.lat;
  const lng1 = Array.isArray(pos1) ? pos1[1] : pos1.lng;
  const lat2 = Array.isArray(pos2) ? pos2[0] : pos2.lat;
  const lng2 = Array.isArray(pos2) ? pos2[1] : pos2.lng;

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Dijkstra's shortest path algorithm
 */
export function findShortestPath(
  graph: Record<string, GraphNode>,
  startId: string,
  endId: string
): RouteResult | null {
  if (!graph[startId] || !graph[endId]) {
    return null;
  }

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();
  const unvisited = new Set<string>();

  // Initialize distances
  Object.keys(graph).forEach((nodeId) => {
    distances[nodeId] = nodeId === startId ? 0 : Infinity;
    previous[nodeId] = null;
    unvisited.add(nodeId);
  });

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let currentNode: string | null = null;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        currentNode = nodeId;
      }
    }

    if (!currentNode || distances[currentNode] === Infinity) {
      break; // No path exists
    }

    unvisited.delete(currentNode);
    visited.add(currentNode);

    // If we reached the destination
    if (currentNode === endId) {
      break;
    }

    // Update distances to neighbors
    const connections = graph[currentNode].connections;
    Object.keys(connections).forEach((neighborId) => {
      if (!visited.has(neighborId)) {
        const newDistance = distances[currentNode] + connections[neighborId];
        if (newDistance < distances[neighborId]) {
          distances[neighborId] = newDistance;
          previous[neighborId] = currentNode;
        }
      }
    });
  }

  // Reconstruct path
  if (distances[endId] === Infinity) {
    return null; // No path found
  }

  const path: string[] = [];
  let current: string | null = endId;

  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  // Get coordinates for the path
  const coordinates: LatLngExpression[] = path.map(
    (nodeId) => graph[nodeId].position
  );

  return {
    path,
    distance: distances[endId],
    coordinates,
  };
}

/**
 * Create a simple graph with automatic connections based on distance
 * Connects each node to its N nearest neighbors
 */
export function createSimpleGraph(
  nodes: Array<{ id: string; position: LatLngExpression; name: string }>,
  maxConnections = 3
): Record<string, GraphNode> {
  const graph: Record<string, GraphNode> = {};

  // Initialize graph nodes
  nodes.forEach((node) => {
    graph[node.id] = {
      ...node,
      connections: {},
    };
  });

  // Connect each node to its nearest neighbors
  nodes.forEach((node) => {
    const distances: Array<{ nodeId: string; distance: number }> = [];

    nodes.forEach((otherNode) => {
      if (node.id !== otherNode.id) {
        const distance = calculateDistance(node.position, otherNode.position);
        distances.push({ nodeId: otherNode.id, distance });
      }
    });

    // Sort by distance and take the nearest neighbors
    distances.sort((a, b) => a.distance - b.distance);
    distances.slice(0, maxConnections).forEach(({ nodeId, distance }) => {
      graph[node.id].connections[nodeId] = distance;
      // Make connections bidirectional
      graph[nodeId].connections[node.id] = distance;
    });
  });

  return graph;
}
