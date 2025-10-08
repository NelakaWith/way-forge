"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";
import { useState } from "react";
import {
  findShortestPath,
  createSimpleGraph,
  RouteResult,
} from "@/lib/dijkstra";

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-muted rounded-md flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
});

interface MapNode {
  id: string;
  position: LatLngExpression;
  title: string;
  description?: string;
}

// Predefined nodes for route optimization (Colombo area)
const availableNodes = [
  {
    id: "colombo-fort",
    position: [6.9271, 79.8612] as [number, number],
    name: "Colombo Fort",
  },
  {
    id: "pettah",
    position: [6.9355, 79.85] as [number, number],
    name: "Pettah Market",
  },
  {
    id: "galle-face",
    position: [6.9218, 79.8438] as [number, number],
    name: "Galle Face Green",
  },
  {
    id: "mount-lavinia",
    position: [6.8344, 79.8631] as [number, number],
    name: "Mount Lavinia",
  },
  {
    id: "dehiwala",
    position: [6.8518, 79.8631] as [number, number],
    name: "Dehiwala",
  },
  {
    id: "bambalapitiya",
    position: [6.8851, 79.856] as [number, number],
    name: "Bambalapitiya",
  },
  {
    id: "wellawatte",
    position: [6.8682, 79.8554] as [number, number],
    name: "Wellawatte",
  },
  {
    id: "kollupitiya",
    position: [6.9063, 79.8492] as [number, number],
    name: "Kollupitiya",
  },
];

export default function Home() {
  const [startLocation, setStartLocation] = useState<string>("");
  const [endLocation, setEndLocation] = useState<string>("");
  const [optimizedRoute, setOptimizedRoute] = useState<RouteResult | null>(
    null
  );
  const [isCalculating, setIsCalculating] = useState(false);

  // Create graph for route calculation
  const graph = createSimpleGraph(availableNodes);

  // Convert available nodes to MapNode format
  const mapNodes: MapNode[] = availableNodes.map((node) => ({
    id: node.id,
    position: node.position,
    title: node.name,
    description: `Click to select as start/end point`,
  }));

  // Create route visualization if route exists
  const routes = optimizedRoute
    ? [
        {
          id: "optimized-route",
          positions: optimizedRoute.coordinates,
          color: "#22c55e", // green-500
          weight: 4,
        },
      ]
    : [];

  const handleNodeClick = (node: MapNode) => {
    if (!startLocation) {
      setStartLocation(node.id);
    } else if (!endLocation && node.id !== startLocation) {
      setEndLocation(node.id);
    } else {
      // Reset and start over
      setStartLocation(node.id);
      setEndLocation("");
      setOptimizedRoute(null);
    }
  };

  const calculateRoute = async () => {
    if (!startLocation || !endLocation) {
      alert("Please select both start and end locations");
      return;
    }

    setIsCalculating(true);

    // Simulate some processing time for demo
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = findShortestPath(graph, startLocation, endLocation);

    if (result) {
      setOptimizedRoute(result);
    } else {
      alert("No route found between selected locations");
    }

    setIsCalculating(false);
  };

  const resetRoute = () => {
    setStartLocation("");
    setEndLocation("");
    setOptimizedRoute(null);
  };

  const getLocationName = (nodeId: string) => {
    return availableNodes.find((node) => node.id === nodeId)?.name || nodeId;
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">🧭 Way Forge</h1>
          <p className="text-xl text-muted-foreground">
            Route Optimizer & Map Intelligence App
          </p>
        </div>

        {/* Main Map Container */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Interactive Route Optimization</CardTitle>
            <CardDescription>
              Click on map markers to select start and end points, then
              calculate the optimal route
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <MapView
              className="h-96 w-full"
              center={[6.9271, 79.8612]}
              zoom={11}
              nodes={mapNodes}
              routes={routes}
              onNodeClick={handleNodeClick}
            />

            {/* Route Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Location</label>
                <Input
                  value={startLocation ? getLocationName(startLocation) : ""}
                  placeholder="Click a marker to select start"
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Location</label>
                <Input
                  value={endLocation ? getLocationName(endLocation) : ""}
                  placeholder="Click a marker to select end"
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <div className="flex gap-2">
                  <Button
                    onClick={calculateRoute}
                    disabled={!startLocation || !endLocation || isCalculating}
                    className="flex-1"
                  >
                    {isCalculating ? "Calculating..." : "Calculate Route"}
                  </Button>
                  <Button variant="outline" onClick={resetRoute}>
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* Route Results */}
            {optimizedRoute && (
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-800">
                      Route Found!
                    </h3>
                    <p className="text-sm text-green-600">
                      Distance:{" "}
                      <span className="font-medium">
                        {optimizedRoute.distance.toFixed(2)} km
                      </span>
                    </p>
                    <p className="text-sm text-green-600">
                      Path:{" "}
                      {optimizedRoute.path
                        .map((nodeId) => getLocationName(nodeId))
                        .join(" → ")}
                    </p>
                  </div>
                  <div className="text-green-500">✅</div>
                </div>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-medium mb-2">🎯 Smart Algorithms</h3>
              <p className="text-muted-foreground">
                Dijkstra pathfinding for optimal route calculation
              </p>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-medium mb-2">🗺️ Interactive Maps</h3>
              <p className="text-muted-foreground">
                Leaflet-powered visualization with click-to-select nodes
              </p>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-medium mb-2">📊 Route Analytics</h3>
              <p className="text-muted-foreground">
                Real-time distance calculation and path optimization
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">How to Use</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>
              1. Click on any blue marker on the map to select your start
              location
            </li>
            <li>2. Click on another marker to select your destination</li>
            <li>
              3. Click &quot;Calculate Route&quot; to find the optimal path
            </li>
            <li>
              4. The green line shows the optimized route with distance
              information
            </li>
            <li>5. Click &quot;Reset&quot; to start over with new locations</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
