import { useState } from "react";

const MAPBOX_TOKEN = "pk.eyJ1IjoiYW5uYmludXMiLCJhIjoiY21rNHB3c2wxMDIxYjNlb3BzZnAyeHdqdiJ9.JBPzH4oT7DjWIMJaCjCuBw";

export default function AddDestinationModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    tiktokUrl: "",
    tiktokFile: null,
  });
  const [suggestions, setSuggestions] = useState([]);

  const handleFileChange = (e) => {
    setForm({ ...form, tiktokFile: e.target.files[0] });
  };

  const handleNameChange = async (e) => {
    const value = e.target.value;
    setForm({ ...form, name: value });

    if (!value) {
      setSuggestions([]);
      return;
    }

    // Call Mapbox Places API
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        value
      )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5`
    );
    const data = await res.json();
    setSuggestions(data.features || []);
  };

  const handleSelectSuggestion = (place) => {
    setForm({
      ...form,
      name: place.place_name,
      latitude: place.center[1], // lat
      longitude: place.center[0], // lng
    });
    setSuggestions([]);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2 className="modal-title">Add Destination</h2>

        {/* Name input with autocomplete */}
        <div className="relative mb-3">
          <input
            placeholder="Name"
            className="modal-input"
            value={form.name}
            onChange={handleNameChange}
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border w-full rounded shadow-lg max-h-40 overflow-y-auto">
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSelectSuggestion(s)}
                >
                  {s.place_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <textarea
          placeholder="Description"
          className="modal-input"
          style={{ height: '6rem', marginBottom: '0.75rem' }}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* TikTok URL */}
        <input
          placeholder="TikTok URL"
          className="modal-input"
          value={form.tiktokUrl}
          onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
        />

        {/* TikTok File Upload */}
        <input
          type="file"
          accept="video/*"
          className="modal-input"
          onChange={handleFileChange}
        />

        <div className="modal-actions">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button
            onClick={() =>
              onAdd({
                id: Date.now(),
                name: form.name,
                description: form.description,
                latitude: form.latitude,
                longitude: form.longitude,
                tiktokUrl: form.tiktokUrl,
                tiktokFile: form.tiktokFile,
              })
            }
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
