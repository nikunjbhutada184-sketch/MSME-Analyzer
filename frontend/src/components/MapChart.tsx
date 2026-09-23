import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type DistrictData = {
  district: string;
  count: number;
  competition_level: string;
};

export default function MapChart({ districts }: { districts: DistrictData[] }) {
  // Center of Maharashtra
  const position: [number, number] = [19.7515, 75.7139];
  
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="font-semibold mb-4">Maharashtra Competition Map</h3>
      <p className="text-xs text-gray-500 mb-2">Note: To render accurate district boundaries, add Maharashtra GeoJSON locally.</p>
      <div className="h-[400px] rounded-lg overflow-hidden border">
        <MapContainer center={position} zoom={6} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {/* We would render <GeoJSON /> here with the district boundary data */}
        </MapContainer>
      </div>
    </div>
  );
}
