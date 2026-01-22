import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function SavedItineraryPage() {
  const { itineraryId } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [dayBoxes, setDayBoxes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itineraryId) return;

    // Fetch itinerary details
    fetch(`http://localhost:5001/api/itineraries/${itineraryId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch itinerary");
        return res.json();
      })
      .then((data) => {
        setItinerary(data);
        
        // Fetch itinerary items
        return fetch(`http://localhost:5001/api/itinerary-items?itinerary_id=${itineraryId}`);
      })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch itinerary items");
        return res.json();
      })
      .then((items) => {
        // Convert items to day boxes format
        const days = items.map((item) => {
          if (item.notes) {
            try {
              const data = JSON.parse(item.notes);
              return {
                title: data.title || `Day ${item.day}`,
                content: data.content || ""
              };
            } catch (err) {
              console.error("Failed to parse item notes:", err);
            }
          }
          return {
            title: `Day ${item.day}`,
            content: item.notes || ""
          };
        });
        
        setDayBoxes(days);
      })
      .catch((err) => {
        console.error("Failed to fetch itinerary:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [itineraryId]);

  const updateDayTitle = (index, title) => {
    setDayBoxes(prev => prev.map((day, i) => 
      i === index ? { ...day, title } : day
    ));
  };

  const updateDayContent = (index, content) => {
    setDayBoxes(prev => prev.map((day, i) => 
      i === index ? { ...day, content } : day
    ));
  };

  const saveChanges = async () => {
    try {
      // Update the itinerary items with new content
      const updatePromises = dayBoxes.map(async (day, index) => {
        const itemId = index + 1; // Assuming sequential day numbers
        const updatedNotes = JSON.stringify({
          title: day.title,
          content: day.content
        });

        return fetch(`http://localhost:5001/api/itinerary-items/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: updatedNotes })
        });
      });

      await Promise.all(updatePromises);
      alert("Changes saved!");
    } catch (err) {
      console.error("Failed to save changes:", err);
      alert("Failed to save changes");
    }
  };

  const extractToItems = async () => {
    if (!itineraryId) return;

    if (!window.confirm("Extract individual activities from the day content as separate items? This will replace the current day structure.")) {
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/destinations/extract-activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          itineraryId: parseInt(itineraryId)
        })
      });

      if (!res.ok) {
        throw new Error("Failed to extract activities");
      }

      const result = await res.json();
      alert(result.message);
      
      // Reload the page to show extracted items
      window.location.reload();
      
    } catch (err) {
      console.error("Failed to extract activities:", err);
      alert("Failed to extract activities. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading itinerary...</p>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Itinerary not found</p>
        <button onClick={() => navigate("/")} style={{ marginTop: "1rem" }}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center" }}>
          <button
            onClick={() => navigate("/home")}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "transparent",
              border: "1px solid #ddd",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            ← Back to Destinations
          </button>
          
          <button
            onClick={extractToItems}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#007acc",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "500"
            }}
          >
            🔄 Extract to Items
          </button>
        </div>
        
        <h1 className="h2-md" style={{ marginBottom: "0.5rem" }}>
          {itinerary?.title || "Saved Itinerary"}
        </h1>
      </div>

      {/* Itinerary Content */}
      <div className="panel" style={{ backgroundColor: "#ffffff", padding: "2rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 className="h2-md" style={{ margin: 0 }}>
            Itinerary Details
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{
              background: "linear-gradient(135deg, #fb923c, #f97316)",
              color: "white",
              padding: "0.4rem 1rem",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: 600
            }}>
              {dayBoxes.length} Days
            </span>
            <button
              onClick={saveChanges}
              style={{
                background: "#fb923c",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              💾 Save Changes
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>Loading itinerary...</p>
        ) : dayBoxes.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p style={{ color: "#666", fontStyle: "italic" }}>No itinerary content found</p>
          </div>
        ) : (
          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {dayBoxes.map((day, index) => (
              <div key={index} style={{ marginBottom: "2rem" }}>
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
                  <input
                    value={day.title}
                    onChange={(e) => updateDayTitle(index, e.target.value)}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "#fb923c",
                      outline: "none",
                      width: "100%"
                    }}
                    placeholder={`Day ${index + 1}`}
                  />
                </h3>
                <div style={{
                  padding: "1rem",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderLeft: "4px solid #fb923c",
                  borderRadius: "0.5rem",
                }}>
                  <textarea
                    value={day.content}
                    onChange={(e) => updateDayContent(index, e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: "150px",
                      background: "transparent",
                      border: "none",
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "inherit"
                    }}
                    placeholder="Add your itinerary details here..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}