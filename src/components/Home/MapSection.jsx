import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1IjoiYW5uYmludXMiLCJhIjoiY21rNHB3c2wxMDIxYjNlb3BzZnAyeHdqdiJ9.JBPzH4oT7DjWIMJaCjCuBw";

// Optional: random colors for pins
const PIN_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

function getRandomColor() {
  return PIN_COLORS[Math.floor(Math.random() * PIN_COLORS.length)];
}

function normalizeCoordinates(lat, lng) {
  // Map lat/lng to % for absolute positioning (optional if using Mapbox Marker)
  return { lat, lng };
}

export default function MapSection({ destinations, onSelect }) {
  return (
    <div className="rounded-3xl overflow-hidden shadow-lg w-full h-[550px]">
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          latitude: 20,
          longitude: 0,
          zoom: 1.4,
        }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        className="w-full h-[550px] md:h-full"
      >
        {destinations.map((dest) => (
          <Marker
            key={dest.id}
            latitude={dest.latitude}
            longitude={dest.longitude}
            anchor="bottom"
          >
            <div
              onClick={() => onSelect(dest)}
              className="w-6 h-6 rounded-full cursor-pointer flex items-center justify-center hover:scale-125 transition-transform shadow-lg"
              style={{ backgroundColor: dest.color || getRandomColor() }}
              title={dest.destination}
            >
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </Marker>
        ))}
      </Map>

      {destinations.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-400 pointer-events-none">
          <h2 className="text-3xl font-semibold mb-2">World Map</h2>
          <p>Add destinations to see them here</p>
        </div>
      )}
    </div>
  );
}
