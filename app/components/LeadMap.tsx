"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Lead } from "@/lib/types";

export interface LeadMapProps {
  leads: Lead[];
  activeLeadId?: string | null;
  onSelectLead?: (id: string) => void;
}

export default function LeadMap({ leads, activeLeadId, onSelectLead }: LeadMapProps) {
  if (leads.length === 0) {
    return (
      <div className="h-[340px] rounded-2xl border border-dashed border-border/80 flex flex-col items-center justify-center text-xs font-mono text-muted-foreground bg-secondary/20">
        <span>Map pin markers appear once leads are scraped</span>
      </div>
    );
  }

  const center: [number, number] = [
    leads.reduce((s, l) => s + l.lat, 0) / leads.length,
    leads.reduce((s, l) => s + l.lng, 0) / leads.length,
  ];

  return (
    <div className="h-[340px] rounded-2xl overflow-hidden border border-border/60 shadow-2xl relative z-10">
      <MapContainer center={center} zoom={14} className="h-full w-full bg-background" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {leads.map((l) => {
          const isActive = activeLeadId === l.id;
          return (
            <CircleMarker
              key={l.id}
              center={[l.lat, l.lng]}
              radius={isActive ? 12 : 8}
              eventHandlers={{
                click: () => onSelectLead && onSelectLead(l.id),
              }}
              pathOptions={{
                color: isActive ? "#34d399" : "#10b981",
                fillColor: isActive ? "#6ee7b7" : "#10b981",
                fillOpacity: isActive ? 0.95 : 0.75,
                weight: isActive ? 3 : 1.5,
              }}
            >
              <Tooltip className="custom-leaflet-tooltip font-mono text-xs font-medium">
                <div>
                  <strong className="text-emerald-400">{l.name}</strong>
                  <div className="text-[10px] text-muted-foreground">{l.category} · {l.rating}★</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
