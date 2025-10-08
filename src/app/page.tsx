"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";
import { useState, useCallback } from "react";
import {
  findShortestPath,
  createSimpleGraph,
  RouteResult,
} from "@/lib/dijkstra";
import LocationInput from "@/components/LocationInput";

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
  // Location states for autocomplete inputs
  const [startLocationInput, setStartLocationInput] = useState<string>("");
  const [endLocationInput, setEndLocationInput] = useState<string>("");
  const [startPosition, setStartPosition] = useState<LatLngExpression | null>(
    null
  );
  const [endPosition, setEndPosition] = useState<LatLngExpression | null>(null);

  // Legacy marker-based selection (for waypoints)
  const [selectedWaypoints, setSelectedWaypoints] = useState<string[]>([]);

  const [optimizedRoute, setOptimizedRoute] = useState<RouteResult | null>(
    null
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [useRoadRouting, setUseRoadRouting] = useState(true); // Default to road routing
  const [roadRouteInfo, setRoadRouteInfo] = useState<{
    distance: number;
    time: number;
  } | null>(null);

  // Create graph for route calculation
  const graph = createSimpleGraph(availableNodes);

  // Convert available nodes to MapNode format (these will be waypoints now)
  const mapNodes: MapNode[] = availableNodes.map((node) => ({
    id: node.id,
    position: node.position,
    title: node.name,
    description: `Waypoint: ${node.name}`,
  }));

  // Create route visualization if route exists (for algorithm routing)
  const routes =
    optimizedRoute && !useRoadRouting
      ? [
          {
            id: "optimized-route",
            positions: optimizedRoute.coordinates,
            color: "#22c55e", // green-500
            weight: 4,
          },
        ]
      : [];

  const handleWaypointClick = (node: MapNode) => {
    // Toggle waypoint selection
    setSelectedWaypoints((prev) => {
      if (prev.includes(node.id)) {
        return prev.filter((id) => id !== node.id);
      } else {
        return [...prev, node.id];
      }
    });
  };

  const handleStartLocationSelect = (location: {
    name: string;
    position: LatLngExpression;
  }) => {
    console.log("Start location selected:", location);
    setStartPosition(location.position);
    setRoadRouteInfo(null); // Clear previous route
  };

  const handleEndLocationSelect = (location: {
    name: string;
    position: LatLngExpression;
  }) => {
    console.log("End location selected:", location);
    setEndPosition(location.position);
    setRoadRouteInfo(null); // Clear previous route
  };

  const handleStartLocationClear = () => {
    setStartPosition(null);
    setRoadRouteInfo(null);
  };

  const handleEndLocationClear = () => {
    setEndPosition(null);
    setRoadRouteInfo(null);
  };

  const handleNodeClick = (node: MapNode) => {
    // For waypoints selection in algorithm mode
    handleWaypointClick(node);
  };

  const calculateRoute = async () => {
    if (useRoadRouting) {
      // For road routing, check if we have coordinates
      if (!startPosition || !endPosition) {
        alert(
          "Please enter both start and end locations using the search inputs"
        );
        return;
      }
      // Road routing happens automatically via the RoadRoute component
      // This button click just validates that we have the required data
      console.log("Road routing will be handled by RoadRoute component");
      return;
    }

    // For algorithm routing, use waypoints
    if (selectedWaypoints.length < 2) {
      alert("Please select at least 2 waypoints for algorithm routing");
      return;
    }

    setIsCalculating(true);

    // Simulate some processing time for demo
    await new Promise((resolve) => setTimeout(resolve, 500));

    const startNodeId = selectedWaypoints[0];
    const endNodeId = selectedWaypoints[selectedWaypoints.length - 1];
    const result = findShortestPath(graph, startNodeId, endNodeId);

    if (result) {
      setOptimizedRoute(result);
    } else {
      alert("No route found between selected waypoints");
    }

    setIsCalculating(false);
  };

  const resetRoute = () => {
    console.log("Resetting route...");
    setStartLocationInput("");
    setEndLocationInput("");
    setStartPosition(null);
    setEndPosition(null);
    setSelectedWaypoints([]);
    setOptimizedRoute(null);
    setRoadRouteInfo(null);
    console.log("Route reset complete");
  };

  const handleRoadRouteFound = useCallback(
    (route: { distance: number; time: number }) => {
      setRoadRouteInfo(route);
    },
    []
  );

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
              🛣️ Road Routing: Use search inputs to find real driving routes
              between any locations
              <br />
              📐 Algorithm: Click waypoint markers for Dijkstra pathfinding
              optimization
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            {/* Routing Mode Toggle */}
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <label className="text-sm font-medium">Routing Mode:</label>
              <div className="flex gap-2">
                <Button
                  variant={useRoadRouting ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setUseRoadRouting(true);
                    setOptimizedRoute(null);
                  }}
                >
                  🛣️ Road Routing
                </Button>
                <Button
                  variant={!useRoadRouting ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setUseRoadRouting(false);
                    setRoadRouteInfo(null);
                  }}
                >
                  📐 Algorithm
                </Button>
              </div>
            </div>

            <MapView
              className="h-96 w-full"
              center={[6.9271, 79.8612]}
              zoom={11}
              nodes={mapNodes}
              routes={routes}
              onNodeClick={handleNodeClick}
              useRoadRouting={useRoadRouting}
              roadRouteStart={startPosition}
              roadRouteEnd={endPosition}
              onRoadRouteFound={handleRoadRouteFound}
            />

            {/* Route Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LocationInput
                value={startLocationInput}
                onChange={setStartLocationInput}
                onLocationSelect={handleStartLocationSelect}
                onClear={handleStartLocationClear}
                placeholder="Search for start location..."
                label="Start Location"
              />
              <LocationInput
                value={endLocationInput}
                onChange={setEndLocationInput}
                onLocationSelect={handleEndLocationSelect}
                onClear={handleEndLocationClear}
                placeholder="Search for end location..."
                label="End Location"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <div className="flex gap-2">
                  <Button
                    onClick={calculateRoute}
                    disabled={
                      isCalculating ||
                      (useRoadRouting
                        ? !startPosition || !endPosition
                        : selectedWaypoints.length < 2)
                    }
                    className="flex-1"
                  >
                    {isCalculating
                      ? "Calculating..."
                      : useRoadRouting
                      ? "Find Route"
                      : "Calculate Route"}
                  </Button>
                  <Button variant="outline" onClick={resetRoute}>
                    Reset
                  </Button>
                </div>
                {/* Debug info */}
                {process.env.NODE_ENV === "development" && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Debug: Start: {startPosition ? "✓" : "✗"}, End:{" "}
                    {endPosition ? "✓" : "✗"}, Mode:{" "}
                    {useRoadRouting ? "Road" : "Algorithm"}
                  </div>
                )}
              </div>
            </div>

            {/* Route Results */}
            {optimizedRoute && !useRoadRouting && (
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-800">
                      Algorithm Route Found!
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
                  <div className="text-green-500">📐</div>
                </div>
              </Card>
            )}

            {/* Road Route Results */}
            {roadRouteInfo &&
              useRoadRouting &&
              startLocationInput &&
              endLocationInput && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-800">
                        Road Route Found!
                      </h3>
                      <p className="text-sm text-blue-600">
                        Distance:{" "}
                        <span className="font-medium">
                          {roadRouteInfo.distance} km
                        </span>
                      </p>
                      <p className="text-sm text-blue-600">
                        Estimated Time:{" "}
                        <span className="font-medium">
                          {roadRouteInfo.time} minutes
                        </span>
                      </p>
                      <p className="text-sm text-blue-600">
                        Route: {startLocationInput} → {endLocationInput}
                      </p>
                    </div>
                    <div className="text-blue-500">🛣️</div>
                  </div>
                </Card>
              )}
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-medium mb-2">🎯 Smart Algorithms</h3>
              <p className="text-muted-foreground">
                Dijkstra pathfinding for optimal route calculation
              </p>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-medium mb-2">🛣️ Real Road Routing</h3>
              <p className="text-muted-foreground">
                OSRM-powered routing with actual road data and turn-by-turn
                directions
              </p>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-medium mb-2">� Smart Search</h3>
              <p className="text-muted-foreground">
                Autocomplete location search using OpenStreetMap geocoding
              </p>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-medium mb-2">📊 Route Analytics</h3>
              <p className="text-muted-foreground">
                Real-time distance and time calculation with multiple routing
                modes
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">How to Use</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>
              1. Choose your routing mode: 🛣️ Real Road Routing or 📐 Algorithm
            </li>
            <li>
              2. <strong>For Road Routing:</strong> Use the search inputs to
              find any location by typing (e.g., &quot;Galle Face Green,
              Colombo&quot;)
            </li>
            <li>
              3. <strong>For Algorithm Mode:</strong> Click on the blue waypoint
              markers to select nodes for pathfinding
            </li>
            <li>
              4. Click &quot;Find Route&quot; (Road) or &quot;Calculate
              Route&quot; (Algorithm) to generate your route
            </li>
            <li>
              5. Road routing shows real driving directions with time estimates,
              Algorithm shows optimized straight-line paths
            </li>
            <li>
              6. Click &quot;Reset&quot; to clear all selections and start over
            </li>
          </ol>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-600">
              <strong>🛣️ Road Routing:</strong> Uses OpenStreetMap geocoding and
              OSRM for real-world driving routes.
              <br />
              <strong>📐 Algorithm:</strong> Uses Dijkstra pathfinding between
              predefined waypoints in Colombo area.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
