import React, { useRef, useEffect, useState } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiYW5uYmludXMiLCJhIjoiY21rNHB3c2wxMDIxYjNlb3BzZnAyeHdqdiJ9.JBPzH4oT7DjWIMJaCjCuBw";

const savedDestinations = [
  { name: "New York", lat: 40.7128, lng: -74.006 },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  { name: "Chicago", lat: 41.8781, lng: -87.6298 },
];

export default function SavedDestinations() {
  const mapRef = useRef(null);
  const [search, setSearch] = useState("");
  const [markers, setMarkers] = useState([...savedDestinations]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  // Fit map to show all markers
  useEffect(() => {
    if (!mapRef.current || markers.length === 0) return;
    const map = mapRef.current.getMap();

    const bounds = markers.reduce(
      (b, dest) => b.extend([dest.lng, dest.lat]),
      new mapboxgl.LngLatBounds(
        [markers[0].lng, markers[0].lat],
        [markers[0].lng, markers[0].lat]
      )
    );

    map.fitBounds(bounds, { padding: 80, maxZoom: 10 });
  }, [markers]);

  // Fetch autocomplete suggestions as user types
  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5`
      );
      const data = await response.json();
      if (data.features) {
        setSuggestions(data.features);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  // Add the selected suggestion as a marker
  const handleAddMarker = () => {
    if (!selectedSuggestion) return;
    const [lng, lat] = selectedSuggestion.center;
    const newMarker = { name: selectedSuggestion.place_name, lat, lng };
    setMarkers((prev) => [...prev, newMarker]);
    setSearch("");
    setSuggestions([]);
    setSelectedSuggestion(null);
    mapRef.current.getMap().flyTo({ center: [lng, lat], zoom: 12 });
  };

  return (
    <div className="flex flex-col w-full p-4">
      <h2 className="text-xl font-semibold mb-4 text-brown-primary">
        Saved Destinations
      </h2>

      {/* Search bar above the map */}
      <div className="w-full max-w-7xl mx-auto mb-4 bg-brown-primary p-3 rounded-2xl flex flex-col relative">
        <div className="flex items-center justify-center">
          <input
            type="text"
            placeholder="Search for a place"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchSuggestions(e.target.value);
              setSelectedSuggestion(null); // reset selected
            }}
            className="p-2 w-64 rounded-l border border-gray-300 focus:outline-none"
          />
          <button
            onClick={handleAddMarker}
            className="bg-white text-brown-primary px-4 py-2 rounded-r"
          >
            Add
          </button>
        </div>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <ul className="absolute top-12 left-1/2 transform -translate-x-1/2 w-64 bg-white rounded shadow-md z-20 max-h-60 overflow-y-auto">
            {suggestions.map((feature, idx) => (
              <li
                key={idx}
                className={`p-2 cursor-pointer hover:bg-gray-100 ${
                  selectedSuggestion === feature ? "bg-gray-200" : ""
                }`}
                onClick={() => setSelectedSuggestion(feature)}
              >
                {feature.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map container */}
      <div className="w-full max-w-7xl rounded-2xl overflow-hidden shadow-md bg-trip-box-bg mx-auto">
        <div style={{ width: "100%", height: "400px" }}>
          <Map
            ref={mapRef}
            initialViewState={{
              latitude: 39.8283,
              longitude: -98.5795,
              zoom: 3,
            }}
            style={{ width: "100%", height: "100%" }}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            interactive={true}
          >
            {markers.map((dest, idx) => (
              <Marker
                key={idx}
                latitude={dest.lat}
                longitude={dest.lng}
                color="#4A3F3A"
              />
            ))}
          </Map>
        </div>
      </div>
    </div>
  );
}