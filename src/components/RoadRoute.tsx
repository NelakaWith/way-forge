"use client";

import { useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

interface RouteInfo {
  distance: number; // in kilometers
  time: number; // in minutes
  instructions?: L.Routing.IInstruction[];
  coordinates?: L.LatLng[];
}

interface RoadRouteProps {
  startPoint: L.LatLngExpression | null;
  endPoint: L.LatLngExpression | null;
  onRouteFound?: (route: RouteInfo) => void;
}

export default function RoadRoute({
  startPoint,
  endPoint,
  onRouteFound,
}: RoadRouteProps) {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const onRouteFoundRef = useRef(onRouteFound);
  const lastRouteRef = useRef<{
    start: L.LatLngExpression | null;
    end: L.LatLngExpression | null;
  }>({ start: null, end: null });

  // Update the ref when the callback changes
  useEffect(() => {
    onRouteFoundRef.current = onRouteFound;
  }, [onRouteFound]);

  useEffect(() => {
    console.log("RoadRoute useEffect triggered:", { startPoint, endPoint });

    if (!startPoint || !endPoint) {
      console.log("Missing start or end point, removing existing route");
      // Remove existing route if points are not set
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      lastRouteRef.current = { start: null, end: null };
      return;
    }

    // Check if the route points are the same as last time
    const isSameRoute =
      lastRouteRef.current.start &&
      lastRouteRef.current.end &&
      JSON.stringify(startPoint) ===
        JSON.stringify(lastRouteRef.current.start) &&
      JSON.stringify(endPoint) === JSON.stringify(lastRouteRef.current.end);

    if (isSameRoute) {
      console.log("Route points unchanged, skipping recreation");
      return;
    }

    console.log("Creating new route from", startPoint, "to", endPoint);

    // Update the last route reference
    lastRouteRef.current = { start: startPoint, end: endPoint };

    // Remove existing route before creating new one
    if (routingControlRef.current) {
      console.log("Removing existing routing control");
      map.removeControl(routingControlRef.current);
    }

    // Create new routing control
    const routingControl = L.Routing.control({
      waypoints: [L.latLng(startPoint), L.latLng(endPoint)],
      routeWhileDragging: false,
      addWaypoints: false,
      lineOptions: {
        styles: [
          {
            color: "#22c55e", // green-500
            weight: 6,
            opacity: 0.8,
          },
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: "driving",
      }),
      show: false, // Hide the turn-by-turn instructions panel
      fitSelectedRoutes: false, // Disable auto-fit to prevent map jumping
      plan: L.Routing.plan([L.latLng(startPoint), L.latLng(endPoint)], {
        addWaypoints: false,
        draggableWaypoints: false,
      }),
    });

    // Add event listener for when route is found
    routingControl.on("routesfound", (e: L.Routing.RoutingResultEvent) => {
      console.log("Route found!", e);
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0];
        if (route.summary) {
          const distance = route.summary.totalDistance / 1000; // Convert to km
          const time = Math.round(route.summary.totalTime / 60); // Convert to minutes

          console.log("Route details:", { distance, time });

          if (onRouteFoundRef.current) {
            onRouteFoundRef.current({
              distance: parseFloat(distance.toFixed(2)),
              time: time,
              instructions: route.instructions,
              coordinates: route.coordinates,
            });
          }
        }
      }
    });

    // Add error handler
    routingControl.on("routingerror", (e: L.LeafletEvent) => {
      console.error("Routing error:", e);
    });

    // Add routing control to map
    console.log("Adding routing control to map");
    try {
      routingControl.addTo(map);
      routingControlRef.current = routingControl;
      console.log("Routing control added successfully");
    } catch (error) {
      console.error("Error adding routing control:", error);
    }

    // Cleanup function
    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [map, startPoint, endPoint]); // onRouteFound now handled via ref

  return null; // This component doesn't render anything directly
}
