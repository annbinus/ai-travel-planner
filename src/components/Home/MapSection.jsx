import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1IjoiYW5uYmludXMiLCJhIjoiY21rNHB3c2wxMDIxYjNlb3BzZnAyeHdqdiJ9.JBPzH4oT7DjWIMJaCjCuBw";
export default function MapSection({ destinations, onSelect }) {
  return (
    <div className="map-section">
      <div className="panel card-wide" style={{ height: '100%' }}>
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{
            latitude: 20,
            longitude: 0,
            zoom: 1.4,
          }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          style={{ width: "100%", height: "100%" }}
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
                className="map-marker"
              />
            </Marker>
          ))}
        </Map>
      </div>
    </div>
  );
}

