import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import AddItineraryItemModal from "./AddItineraryItemModal";

export default function ItineraryPage() {
  const { itineraryId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDestinationId = searchParams.get("destinationId");

  const [itinerary, setItinerary] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [selectedDestinationId, setSelectedDestinationId] = useState(null);
  const [itineraryItems, setItineraryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch itinerary details
  useEffect(() => {
    if (!itineraryId) return;

    fetch(`http://localhost:5001/api/itineraries/${itineraryId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch itinerary");
        return res.json();
      })
      .then((data) => {
        setItinerary(data);
      })
      .catch((err) => {
        console.error("Failed to fetch itinerary:", err);
      });
  }, [itineraryId]);

  // Fetch destinations in this itinerary
  useEffect(() => {
    if (!itineraryId) return;

    fetch(`http://localhost:5001/api/itineraries/${itineraryId}/destinations`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch destinations");
        return res.json();
      })
      .then((data) => {
        const normalizedData = Array.isArray(data)
          ? data.map((dest) => ({
              ...dest,
              latitude: typeof dest.latitude === "string" ? parseFloat(dest.latitude) : dest.latitude,
              longitude: typeof dest.longitude === "string" ? parseFloat(dest.longitude) : dest.longitude,
            }))
          : [];
        setDestinations(normalizedData);
        
        // Set initial selected destination
        if (normalizedData.length > 0) {
          const destId = initialDestinationId 
            ? parseInt(initialDestinationId)
            : normalizedData[0].id;
          setSelectedDestinationId(destId);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch destinations:", err);
        setDestinations([]);
      });
  }, [itineraryId, initialDestinationId]);

  // Fetch itinerary items for selected destination
  useEffect(() => {
    if (!selectedDestinationId) {
      setItineraryItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`http://localhost:5001/api/itinerary-items?destination_id=${selectedDestinationId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch itinerary items");
        return res.json();
      })
      .then((data) => {
        // Filter items that belong to this itinerary
        const filteredItems = Array.isArray(data)
          ? data.filter((item) => item.itinerary_id === parseInt(itineraryId))
          : [];
        setItineraryItems(filteredItems);
      })
      .catch((err) => {
        console.error("Failed to fetch itinerary items:", err);
        setItineraryItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedDestinationId, itineraryId]);

  const selectedDestination = destinations.find((d) => d.id === selectedDestinationId);

  // Group items by day
  const itemsByDay = itineraryItems.reduce((acc, item) => {
    const day = item.day || "Unassigned";
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(item);
    return acc;
  }, {});

  const sortedDays = Object.keys(itemsByDay).sort((a, b) => {
    if (a === "Unassigned") return 1;
    if (b === "Unassigned") return -1;
    return Number(a) - Number(b);
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => navigate("/home")}
          style={{
            padding: "0.5rem 1rem",
            marginBottom: "1rem",
            backgroundColor: "transparent",
            border: "1px solid #ddd",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          ← Back to Destinations
        </button>
        
        <h1 className="h2-md" style={{ marginBottom: "0.5rem" }}>
          {itinerary?.title || "Itinerary"}
        </h1>
      </div>

      {/* Destination Selector */}
      {destinations.length > 1 && (
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
            Select Destination:
          </label>
          <select
            value={selectedDestinationId || ""}
            onChange={(e) => setSelectedDestinationId(parseInt(e.target.value))}
            style={{
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #ddd",
              fontSize: "1rem",
              minWidth: "250px",
              backgroundColor: "white",
            }}
          >
            {destinations.map((dest) => (
              <option key={dest.id} value={dest.id}>
                {dest.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Destination Info */}
      {selectedDestination && (
        <div className="panel" style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>
            {selectedDestination.name}
          </h2>
          {selectedDestination.description && (
            <p className="muted">{selectedDestination.description}</p>
          )}
        </div>
      )}

      {/* Add Button */}
      {selectedDestinationId && (
        <div style={{ marginBottom: "1rem" }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: "#fb923c",
              color: "white",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            + Add Item
          </button>
        </div>
      )}

      {/* Itinerary Items by Day */}
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 className="h2-md" style={{ margin: 0 }}>
            Itinerary Items
          </h2>
        </div>

        {loading ? (
          <p className="muted">Loading itinerary...</p>
        ) : itineraryItems.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p className="muted">No itinerary items yet for this destination</p>
            <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.5rem" }}>
              Add museums, restaurants, and activities to plan your trip
            </p>
          </div>
        ) : (
          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {sortedDays.map((day) => (
              <div key={day} style={{ marginBottom: "2rem" }}>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                    color: "#fb923c",
                    borderBottom: "2px solid #fb923c",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Day {day}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {itemsByDay[day]
                    .sort((a, b) => (a.position || 0) - (b.position || 0))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="card card-item"
                        style={{
                          padding: "1rem",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderLeft: "4px solid #fb923c",
                          borderRadius: "0.5rem",
                        }}
                      >
                        <div>
                          {item.notes ? (
                            <p style={{ margin: 0, fontSize: "1rem", lineHeight: "1.5" }}>
                              {item.notes}
                            </p>
                          ) : (
                            <p className="muted" style={{ margin: 0, fontSize: "0.875rem" }}>
                              Itinerary item #{item.position || item.id}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && selectedDestinationId && (
        <AddItineraryItemModal
          onClose={() => setShowAddModal(false)}
          onAdd={(newItem) => {
            // Refetch to get updated list with full data
            fetch(`http://localhost:5001/api/itinerary-items?destination_id=${selectedDestinationId}`)
              .then((res) => res.json())
              .then((data) => {
                const filteredItems = Array.isArray(data)
                  ? data.filter((item) => item.itinerary_id === parseInt(itineraryId))
                  : [];
                setItineraryItems(filteredItems);
              })
              .catch((err) => {
                console.error("Failed to refresh itinerary items:", err);
              });
          }}
          itineraryId={parseInt(itineraryId)}
          destinationId={selectedDestinationId}
          defaultDay={sortedDays.length > 0 && sortedDays[0] !== "Unassigned" ? parseInt(sortedDays[0]) : 1}
        />
      )}
    </div>
  );
}
