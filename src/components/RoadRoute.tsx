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

  useEffect(() => {
    if (!startPoint || !endPoint) {
      // Remove existing route if points are not set
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      return;
    }

    // Remove existing route before creating new one
    if (routingControlRef.current) {
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
            weight: 4,
            opacity: 0.8,
          },
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      show: false, // Hide the turn-by-turn instructions panel
      fitSelectedRoutes: false,
    });

    // Add event listener for when route is found
    routingControl.on("routesfound", (e: L.Routing.RoutingResultEvent) => {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0];
        if (route.summary) {
          const distance = route.summary.totalDistance / 1000; // Convert to km
          const time = Math.round(route.summary.totalTime / 60); // Convert to minutes

          if (onRouteFound) {
            onRouteFound({
              distance: parseFloat(distance.toFixed(2)),
              time: time,
              instructions: route.instructions,
              coordinates: route.coordinates,
            });
          }
        }
      }
    });

    // Add routing control to map
    routingControl.addTo(map);
    routingControlRef.current = routingControl;

    // Cleanup function
    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [map, startPoint, endPoint, onRouteFound]);

  return null; // This component doesn't render anything directly
}
