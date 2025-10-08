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

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-32 bg-muted rounded-md flex items-center justify-center">
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

export default function Home() {
  // Sample nodes for demonstration
  const sampleNodes: MapNode[] = [
    {
      id: "start",
      position: [6.9271, 79.8612] as [number, number],
      title: "Start Point",
      description: "Colombo Fort Railway Station",
    },
    {
      id: "waypoint",
      position: [6.9319, 79.8478] as [number, number],
      title: "Waypoint",
      description: "Intermediate stop",
    },
    {
      id: "end",
      position: [6.9355, 79.85] as [number, number],
      title: "End Point",
      description: "Destination - Pettah Market",
    },
  ];

  // Sample route connecting the nodes
  const sampleRoutes = [
    {
      id: "main-route",
      positions: [
        [6.9271, 79.8612] as [number, number],
        [6.9319, 79.8478] as [number, number],
        [6.9355, 79.85] as [number, number],
      ],
      color: "#ef4444", // red-500
      weight: 3,
    },
  ];

  const handleNodeClick = (node: MapNode) => {
    console.log("Node clicked:", node);
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">🧭 Way Forge</h1>
          <p className="text-xl text-muted-foreground">
            Route Optimizer & Map Intelligence App
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Route Optimization</CardTitle>
              <CardDescription>
                Find the shortest path between multiple nodes using advanced
                algorithms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Start location..." />
              <Input placeholder="End location..." />
              <Button className="w-full">Calculate Route</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Map Intelligence</CardTitle>
              <CardDescription>
                Visualize and manage your routes with interactive maps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MapView
                className="h-32 w-full"
                center={[6.9271, 79.8612]}
                zoom={12}
                nodes={sampleNodes}
                routes={sampleRoutes}
                onNodeClick={handleNodeClick}
              />
              <Button variant="outline" className="w-full">
                View Full Map
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-medium mb-2">🎯 Smart Algorithms</h3>
              <p className="text-muted-foreground">
                Dijkstra & A* pathfinding for optimal routes
              </p>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-medium mb-2">🗺️ Interactive Maps</h3>
              <p className="text-muted-foreground">
                Leaflet-powered visualization with real-time updates
              </p>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-medium mb-2">📊 Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Track performance and optimize your routes
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Button size="lg">Get Started</Button>
          <Button variant="outline" size="lg">
            Try Demo
          </Button>
        </div>
      </div>
    </div>
  );
}
