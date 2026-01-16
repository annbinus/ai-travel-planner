import { useState, useEffect } from "react";

export default function DestinationItinerary({ destination }) {
  const [itineraryItems, setItineraryItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!destination || !destination.id) {
      setItineraryItems([]);
      return;
    }

    setLoading(true);
    fetch(`http://localhost:5001/api/itinerary-items?destination_id=${destination.id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch itinerary items");
        }
        return res.json();
      })
      .then((data) => {
        setItineraryItems(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to fetch itinerary items:", err);
        setItineraryItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [destination]);

  if (!destination) {
    return (
      <div className="panel panel-centered">
        <p>Select a destination to see itinerary</p>
      </div>
    );
  }

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
    <div className="panel">
      <div style={{ marginBottom: "1rem" }}>
        <h2 className="h2-md" style={{ marginBottom: "0.5rem" }}>
          {destination.name}
        </h2>
        {destination.description && (
          <p className="muted" style={{ marginBottom: "0.5rem" }}>
            {destination.description}
          </p>
        )}
      </div>

      {loading ? (
        <p className="muted">Loading itinerary...</p>
      ) : itineraryItems.length === 0 ? (
        <div style={{ padding: "1rem", textAlign: "center" }}>
          <p className="muted">No itinerary items yet</p>
          <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.5rem" }}>
            Add museums, restaurants, and activities to plan your trip
          </p>
        </div>
      ) : (
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {sortedDays.map((day) => (
            <div key={day} style={{ marginBottom: "1.5rem" }}>
              <h3
                className="fw-semibold"
                style={{
                  fontSize: "1rem",
                  marginBottom: "0.75rem",
                  color: "#fb923c",
                  borderBottom: "2px solid #fb923c",
                  paddingBottom: "0.25rem",
                }}
              >
                Day {day}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {itemsByDay[day].map((item) => (
                  <div
                    key={item.id}
                    className="card card-item"
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#f9fafb",
                      borderLeft: "3px solid #fb923c",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div style={{ flex: 1 }}>
                        {item.notes ? (
                          <p style={{ margin: 0, fontSize: "0.9rem" }}>{item.notes}</p>
                        ) : (
                          <p className="muted" style={{ margin: 0, fontSize: "0.875rem" }}>
                            Itinerary item #{item.position || item.id}
                          </p>
                        )}
                        {item.itinerary_title && (
                          <p
                            className="muted"
                            style={{ marginTop: "0.25rem", fontSize: "0.75rem" }}
                          >
                            From: {item.itinerary_title}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
