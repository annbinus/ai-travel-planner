import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import MapSection from "./MapSection";
import DestinationsPanel from "./DestinationPanel";
import AddDestinationModal from "./AddDestinationModal";
import AdventureBar from "./AdventureBar";

export default function Home() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Handle destination selection - navigate to itinerary page
  const handleDestinationSelect = async (destination) => {
    setSelected(destination);
    
    // Fetch itinerary items for this destination to get the itinerary ID
    try {
      const res = await fetch(`http://localhost:5001/api/itinerary-items?destination_id=${destination.id}`);
      if (res.ok) {
        const items = await res.json();
        let itineraryId;
        
        if (items.length > 0) {
          // Use the itinerary from the first item
          itineraryId = items[0].itinerary_id;
        } else {
          // If no items, try to get the first available itinerary
          // This allows navigating to itinerary page even if destination has no items yet
          const itineraryRes = await fetch("http://localhost:5001/api/itineraries/1");
          if (itineraryRes.ok) {
            itineraryId = 1; // Default to itinerary 1
          } else {
            // No itinerary exists, stay on home page and show details
            return;
          }
        }
        
        navigate(`/itinerary/${itineraryId}?destinationId=${destination.id}`);
      }
    } catch (err) {
      console.error("Failed to fetch itinerary items:", err);
    }
  };

  // Fetch destinations from backend on mount
  useEffect(() => {
    fetch("http://localhost:5001/api/destinations")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch destinations");
        }
        return res.json();
      })
      .then((data) => {
        // Ensure data is always an array and convert coordinates to numbers
        const normalizedData = Array.isArray(data)
          ? data.map((dest) => ({
              ...dest,
              latitude: typeof dest.latitude === "string" ? parseFloat(dest.latitude) : dest.latitude,
              longitude: typeof dest.longitude === "string" ? parseFloat(dest.longitude) : dest.longitude,
            }))
          : [];
        setDestinations(normalizedData);
      })
      .catch((err) => {
        console.error("Failed to fetch destinations:", err);
        setDestinations([]); // Set to empty array on error
      });
  }, []);

  return (
    <div className="home-layout">
      {/* Navbar */}
      <Navbar onAdd={() => setShowModal(true)} />
      <AdventureBar onAdd={() => setShowModal(true)} />


      {/* Main content */}
  <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 pad-inner pad-vertical-md main-fixed">
        {/* Left: Map */}
        <div className="map-fixed">
          <MapSection destinations={destinations} onSelect={handleDestinationSelect} />
        </div>

        {/* Right: Panels */}
        <div className="fill-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingRight: '1rem', overflow: 'hidden' }}>
          <DestinationsPanel
            destinations={destinations}
            onSelect={handleDestinationSelect}
          />
        </div>
      </main>

      {/* Add Destination Modal */}
      {showModal && (
        <AddDestinationModal
          onClose={() => setShowModal(false)}
          onAdd={async (dest) => {
            try {
              const res = await fetch("http://localhost:5001/api/destinations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: dest.name,
                  description: dest.description,
                  latitude: dest.latitude,
                  longitude: dest.longitude,
                  image_url: dest.tiktokUrl || "",
                }),
              });

              if (!res.ok) {
                throw new Error("Failed to save destination");
              }

              const savedDest = await res.json();
              setDestinations((prev) => [...prev, savedDest]);
              setShowModal(false);
            } catch (err) {
              console.error("Failed to add destination:", err);
              alert("Failed to add destination. Please try again.");
            }
          }}
        />
      )}
    </div>
  );
}
