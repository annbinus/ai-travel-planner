import { useState } from "react";

export default function AddItineraryItemModal({ 
  onClose, 
  onAdd, 
  itineraryId, 
  destinationId,
  defaultDay = 1 
}) {
  const [form, setForm] = useState({
    type: "restaurant", // restaurant, museum, activity
    name: "",
    day: defaultDay || 1,
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter a name");
      return;
    }

    setLoading(true);

    // Get the next position for this day
    const maxPosition = 100; // Default position, can be improved later

    const itemData = {
      itinerary_id: itineraryId,
      destination_id: destinationId,
      day: parseInt(form.day) || 1,
      position: maxPosition,
      notes: `${form.type === "restaurant" ? "🍽️ Restaurant: " : form.type === "museum" ? "🏛️ Museum: " : "🎯 Activity: "}${form.name}${form.notes ? ` - ${form.notes}` : ""}`,
    };

    try {
      const res = await fetch("http://localhost:5001/api/itinerary-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

      if (!res.ok) {
        throw new Error("Failed to add item");
      }

      const newItem = await res.json();
      onAdd(newItem);
      onClose();
    } catch (err) {
      console.error("Failed to add itinerary item:", err);
      alert("Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div 
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: "0.5rem",
          padding: "2rem",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: 600 }}>
          Add to Itinerary
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Type Selection */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Type:
            </label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "restaurant" })}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: form.type === "restaurant" ? "2px solid #fb923c" : "1px solid #ddd",
                  backgroundColor: form.type === "restaurant" ? "#fff7ed" : "white",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: form.type === "restaurant" ? 600 : 400,
                }}
              >
                🍽️ Restaurant
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "museum" })}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: form.type === "museum" ? "2px solid #fb923c" : "1px solid #ddd",
                  backgroundColor: form.type === "museum" ? "#fff7ed" : "white",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: form.type === "museum" ? 600 : 400,
                }}
              >
                🏛️ Museum
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "activity" })}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: form.type === "activity" ? "2px solid #fb923c" : "1px solid #ddd",
                  backgroundColor: form.type === "activity" ? "#fff7ed" : "white",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: form.type === "activity" ? 600 : 400,
                }}
              >
                🎯 Activity
              </button>
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={form.type === "restaurant" ? "Restaurant name" : form.type === "museum" ? "Museum name" : "Activity name"}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #ddd",
                fontSize: "1rem",
              }}
            />
          </div>

          {/* Day */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Day:
            </label>
            <input
              type="number"
              min="1"
              value={form.day}
              onChange={(e) => setForm({ ...form, day: parseInt(e.target.value) || 1 })}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #ddd",
                fontSize: "1rem",
              }}
            />
          </div>

          {/* Notes (Optional) */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Notes (Optional):
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional details..."
              rows="3"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #ddd",
                fontSize: "1rem",
                resize: "vertical",
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #ddd",
                backgroundColor: "white",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                border: "none",
                backgroundColor: "#fb923c",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
