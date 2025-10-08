"use client";

import { Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";

interface NodeMarkerProps {
  position: LatLngExpression;
  title: string;
  description?: string;
  onClick?: () => void;
}

export default function NodeMarker({
  position,
  title,
  description,
  onClick,
}: NodeMarkerProps) {
  return (
    <Marker
      position={position}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold text-sm">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
