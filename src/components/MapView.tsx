"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import NodeMarker from "./NodeMarker";
import RouteLine from "./RouteLine";

// Fix for default markers in Next.js
import L from "leaflet";
type LeafletIconDefault = L.Icon.Default & {
  _getIconUrl?: string;
};
delete (L.Icon.Default.prototype as LeafletIconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapNode {
  id: string;
  position: LatLngExpression;
  title: string;
  description?: string;
}

interface MapRoute {
  id: string;
  positions: LatLngExpression[];
  color?: string;
  weight?: number;
}

interface MapViewProps {
  center?: LatLngExpression;
  zoom?: number;
  className?: string;
  nodes?: MapNode[];
  routes?: MapRoute[];
  onNodeClick?: (node: MapNode) => void;
}

export default function MapView({
  center = [6.9271, 79.8612], // Colombo, Sri Lanka as default
  zoom = 13,
  className = "h-96 w-full",
  nodes = [],
  routes = [],
  onNodeClick,
}: MapViewProps) {
  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render route lines */}
        {routes.map((route) => (
          <RouteLine
            key={route.id}
            positions={route.positions}
            color={route.color}
            weight={route.weight}
          />
        ))}

        {/* Render nodes */}
        {nodes.map((node) => (
          <NodeMarker
            key={node.id}
            position={node.position}
            title={node.title}
            description={node.description}
            onClick={() => onNodeClick?.(node)}
          />
        ))}

        {/* Default marker at center if no nodes provided */}
        {nodes.length === 0 && (
          <Marker position={center}>
            <Popup>Default location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
