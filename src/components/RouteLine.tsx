"use client";

import { Polyline } from "react-leaflet";
import { LatLngExpression } from "leaflet";

interface RouteLineProps {
  positions: LatLngExpression[];
  color?: string;
  weight?: number;
  opacity?: number;
}

export default function RouteLine({
  positions,
  color = "#3b82f6", // blue-500
  weight = 4,
  opacity = 0.7,
}: RouteLineProps) {
  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color,
        weight,
        opacity,
      }}
    />
  );
}
