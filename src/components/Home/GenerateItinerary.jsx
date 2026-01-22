import { useState, useRef, useEffect } from "react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

// Available preference options
const PREFERENCE_OPTIONS = [
  { id: "food", label: "🍜 Food & Cuisine", icon: "food" },
  { id: "museums", label: "🏛️ Museums", icon: "museums" },
  { id: "hiking", label: "🥾 Hiking", icon: "hiking" },
  { id: "beaches", label: "🏖️ Beaches", icon: "beaches" },
  { id: "nightlife", label: "🎉 Nightlife", icon: "nightlife" },
  { id: "shopping", label: "🛍️ Shopping", icon: "shopping" },
  { id: "history", label: "📜 History", icon: "history" },
  { id: "nature", label: "🌿 Nature", icon: "nature" },
  { id: "adventure", label: "🪂 Adventure", icon: "adventure" },
  { id: "relaxation", label: "🧘 Relaxation", icon: "relaxation" },
  { id: "photography", label: "📷 Photography", icon: "photography" },
  { id: "architecture", label: "🏰 Architecture", icon: "architecture" },
  { id: "local-culture", label: "🎭 Local Culture", icon: "culture" },
  { id: "budget", label: "💰 Budget-Friendly", icon: "budget" },
  { id: "luxury", label: "✨ Luxury", icon: "luxury" },
  { id: "family", label: "👨‍👩‍👧‍👦 Family-Friendly", icon: "family" },
];

export default function GenerateItinerary({ onSave }) {
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [dayBoxes, setDayBoxes] = useState([]); // Array of day content strings
  const abortRef = useRef(null);
  
  // Destination search state
  const [destinations, setDestinations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  
  // TikTok state
  const [tiktokUrls, setTiktokUrls] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search Mapbox for places
  const searchPlaces = async (query) => {
    if (!query.trim() || !MAPBOX_TOKEN) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&types=place,locality,region,country&limit=5`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.features) {
        setSearchResults(data.features.map(f => ({
          id: f.id,
          name: f.place_name,
          shortName: f.text,
          coordinates: f.center
        })));
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchPlaces(searchQuery);
        setShowResults(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addDestination = (place) => {
    if (!destinations.find(d => d.id === place.id)) {
      setDestinations(prev => [...prev, place]);
    }
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const removeDestination = (id) => {
    setDestinations(prev => prev.filter(d => d.id !== id));
  };

  // Parse itinerary text into separate days
  const parseIntoDays = (text) => {
    // Split by "Day X" pattern
    const dayPattern = /Day\s*\d+/gi;
    const parts = text.split(dayPattern);
    const matches = text.match(dayPattern) || [];
    
    const parsed = [];
    for (let i = 0; i < matches.length; i++) {
      const content = parts[i + 1] || "";
      parsed.push({
        title: matches[i],
        content: content.trim()
      });
    }
    
    // If no days found, treat whole text as one box
    if (parsed.length === 0 && text.trim()) {
      parsed.push({ title: "Day 1", content: text.trim() });
    }
    
    return parsed;
  };

  const handleGenerate = async () => {
    if (destinations.length === 0) {
      alert("Please add at least one destination");
      return;
    }

    setLoading(true);
    setStreamingText("");
    setDayBoxes([]);

    try {
      abortRef.current = new AbortController();
      
      // Convert destinations to format backend expects
      const destPayload = destinations.map(d => ({ name: d.name }));
      
      const res = await fetch("http://localhost:5001/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          destinations: destPayload, 
          preferences: selectedPreferences.join(", "), 
          days 
        }),
        signal: abortRef.current.signal
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Response not OK:", res.status, errText);
        alert("Server error: " + res.status);
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            
            if (parsed.error) {
              alert(parsed.error);
              setLoading(false);
              return;
            }
            
            if (parsed.content) {
              fullText += parsed.content;
              setStreamingText(fullText);
            }
            
            if (parsed.done) {
              const parsedDays = parseIntoDays(fullText);
              setDayBoxes(parsedDays);
              if (onSave) onSave({ days: parsedDays, destinations, numDays: days });
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Generate error:", err);
        alert("Failed to generate. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateDayContent = (index, newContent) => {
    setDayBoxes(prev => prev.map((day, i) => 
      i === index ? { ...day, content: newContent } : day
    ));
  };

  const updateDayTitle = (index, newTitle) => {
    setDayBoxes(prev => prev.map((day, i) => 
      i === index ? { ...day, title: newTitle } : day
    ));
  };

  // Extract info from TikTok URLs
  const handleExtractTikTok = async () => {
    const urls = tiktokUrls
      .split("\n")
      .map(url => url.trim())
      .filter(url => url.includes("tiktok.com"));
    
    if (urls.length === 0) {
      alert("Please enter at least one TikTok URL");
      return;
    }

    setExtracting(true);
    try {
      const res = await fetch("http://localhost:5001/api/extract-tiktok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls })
      });

      if (!res.ok) {
        throw new Error("Failed to extract");
      }

      const data = await res.json();
      setExtractedInfo(prev => [...prev, ...data.extracted]);
      
      // Auto-add extracted destinations to the destinations list
      if (data.extracted.length > 0) {
        const newDests = data.extracted
          .filter(info => info.destination && info.destination !== 'Could not extract')
          .map(info => ({
            id: 'tiktok-' + Date.now() + Math.random(),
            name: info.destination,
            shortName: info.destination.split(',')[0]
          }));
        
        setDestinations(prev => [...prev, ...newDests]);
        
        // Extract tips and add relevant ones as preferences
        const newTips = data.extracted
          .map(info => info.tips)
          .filter(t => t && t !== 'Could not extract');
        
        // Add any matching preset preferences based on tips
        if (newTips.length > 0) {
          const tipText = newTips.join(" ").toLowerCase();
          const matchingPrefs = PREFERENCE_OPTIONS
            .filter(opt => tipText.includes(opt.id) || tipText.includes(opt.icon))
            .map(opt => opt.id)
            .filter(id => !selectedPreferences.includes(id));
          
          if (matchingPrefs.length > 0) {
            setSelectedPreferences(prev => [...prev, ...matchingPrefs]);
          }
        }
      }
      
      setTiktokUrls("");
    } catch (err) {
      console.error("Extract error:", err);
      alert("Failed to extract info from TikTok videos");
    } finally {
      setExtracting(false);
    }
  };

  const removeExtractedItem = (index) => {
    setExtractedInfo(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="generate-layout-split">
      {/* Left side - Form */}
      <div className="generate-left">
        <div className="generate-card">
          <h1 className="generate-title">Generate Trip Plan</h1>
          <p className="generate-subtitle">Enter your destinations and preferences</p>

          {/* TikTok Import Section */}
          <div className="tiktok-section">
            <div className="tiktok-header">
              <span className="tiktok-icon">🎵</span>
              <span>Import from TikTok</span>
            </div>
            <textarea
              className="textarea tiktok-input"
              value={tiktokUrls}
              onChange={(e) => setTiktokUrls(e.target.value)}
              rows={2}
              placeholder="Paste TikTok URLs (one per line)&#10;https://www.tiktok.com/@user/video/..."
            />
            <button
              onClick={handleExtractTikTok}
              className="extract-btn"
              disabled={extracting || !tiktokUrls.trim()}
            >
              {extracting ? "Extracting..." : "Extract Travel Info"}
            </button>
            
            {/* Extracted info cards */}
            {extractedInfo.length > 0 && (
              <div className="extracted-list">
                {extractedInfo.map((info, idx) => (
                  <div key={idx} className="extracted-card">
                    <button 
                      className="remove-extracted"
                      onClick={() => removeExtractedItem(idx)}
                    >×</button>
                    <div className="extracted-destination">{info.destination || "Unknown location"}</div>
                    {info.tips && <div className="extracted-tips">{info.tips}</div>}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="divider">
          <span>or search places</span>
        </div>

        {/* Mapbox Destination Search */}
        <label className="block mb-2 font-semibold">Destinations</label>
        <div className="destination-search" ref={searchRef}>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="input search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Search cities, countries..."
            />
            {searching && <span className="search-spinner">⏳</span>}
          </div>
          
          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((place) => (
                <div
                  key={place.id}
                  className="search-result-item"
                  onClick={() => addDestination(place)}
                >
                  <span className="result-icon">📍</span>
                  <span className="result-name">{place.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Destinations */}
        {destinations.length > 0 && (
          <div className="selected-destinations">
            {destinations.map((dest) => (
              <div key={dest.id} className="destination-tag">
                <span>{dest.shortName || dest.name}</span>
                <button onClick={() => removeDestination(dest.id)}>×</button>
              </div>
            ))}
          </div>
        )}

        <label className="block mb-2 font-semibold" style={{ marginTop: '1rem' }}>Preferences</label>
        <div className="preferences-grid">
          {PREFERENCE_OPTIONS.map((pref) => (
            <button
              key={pref.id}
              type="button"
              className={`preference-chip ${selectedPreferences.includes(pref.id) ? 'selected' : ''}`}
              onClick={() => {
                setSelectedPreferences(prev => 
                  prev.includes(pref.id)
                    ? prev.filter(p => p !== pref.id)
                    : [...prev, pref.id]
                );
              }}
            >
              {pref.label}
            </button>
          ))}
        </div>

        <label className="block mb-2 font-semibold">Number of days</label>
        <input
          type="number"
          className="input"
          style={{ width: "5rem" }}
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          min={1}
          max={14}
        />

        <button
          onClick={handleGenerate}
          className="adventure-btn btn-dark-strong"
          style={{ marginTop: "1rem", width: "100%" }}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Itinerary"}
        </button>
        </div>
      </div>

      {/* Right side - Response */}
      <div className="generate-right">
        {/* Empty state */}
        {!loading && !streamingText && dayBoxes.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🗺️</div>
            <h3>Your itinerary will appear here</h3>
            <p>Fill in the form and click Generate to create your travel plan</p>
          </div>
        )}

        {/* Streaming text display */}
        {(loading || streamingText) && dayBoxes.length === 0 && (
          <div className="streaming-container">
            <div className="streaming-header">
              <span className="streaming-icon">✨</span>
              <span>Creating your perfect itinerary...</span>
            </div>
            <div className="streaming-content">
              {streamingText || "Thinking..."}
              {loading && <span className="cursor">▌</span>}
            </div>
          </div>
        )}

        {/* Editable day boxes */}
        {dayBoxes.length > 0 && (
          <div className="result-container">
            <div className="result-header">
              <h2 className="result-title">Your Itinerary</h2>
              <div className="result-actions">
                <span className="result-badge">{dayBoxes.length} Days</span>
                <button 
                  className="save-btn"
                  onClick={async () => {
                    try {
                      const payload = {
                        title: `Trip to ${destinations.map(d => d.name).join(", ")}`,
                        destinations: destinations.map(d => d.name),
                        preferences: selectedPreferences,
                        days: dayBoxes.length,
                        itinerary: dayBoxes
                      };
                      
                      const res = await fetch("http://localhost:5001/api/itineraries", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                      });
                      
                      if (!res.ok) {
                        const err = await res.json();
                        throw new Error(err.error || "Failed to save");
                      }
                      
                      const data = await res.json();
                      alert(`Itinerary saved! ID: ${data.itinerary.id}`);
                      
                      // Also call onSave prop if provided
                      if (onSave) {
                        onSave(data);
                      }
                    } catch (err) {
                      console.error("Save error:", err);
                      alert("Failed to save itinerary: " + err.message);
                    }
                  }}
                >
                  💾 Save
                </button>
              </div>
            </div>
            
            <div className="day-boxes">
              {dayBoxes.map((day, index) => (
                <div key={index} className="day-box">
                  <input
                    className="day-title-input"
                    value={day.title}
                    onChange={(e) => updateDayTitle(index, e.target.value)}
                  />
                  <textarea
                    className="day-content-input"
                    value={day.content}
                    onChange={(e) => updateDayContent(index, e.target.value)}
                    rows={8}
                  />
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => { setDayBoxes([]); setStreamingText(""); }}
              className="new-trip-btn"
            >
              Generate Another Trip
            </button>
          </div>
        )}
      </div>

      <style>{`
        /* Split layout */
        .generate-layout-split {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 2rem;
          height: 100vh;
          background: #f6f1ea;
          padding: 1.5rem;
          overflow: hidden;
          box-sizing: border-box;
        }
        .generate-left {
          height: calc(100vh - 3rem);
          overflow-y: auto;
          padding-right: 0.5rem;
        }
        .generate-left::-webkit-scrollbar {
          width: 5px;
        }
        .generate-left::-webkit-scrollbar-track {
          background: transparent;
        }
        .generate-left::-webkit-scrollbar-thumb {
          background: #d4c4b5;
          border-radius: 3px;
        }
        .generate-card {
          background: #fffaf4;
          padding: 1.25rem;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(59, 47, 47, 0.08);
        }
        .generate-right {
          height: calc(100vh - 3rem);
          overflow-y: auto;
        }
        .generate-right::-webkit-scrollbar {
          width: 5px;
        }
        .generate-right::-webkit-scrollbar-track {
          background: transparent;
        }
        .generate-right::-webkit-scrollbar-thumb {
          background: #d4c4b5;
          border-radius: 3px;
        }
        
        /* Empty state */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 300px;
          background: #fffaf4;
          border-radius: 16px;
          color: #9a8a7c;
          text-align: center;
          padding: 2rem;
        }
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.6;
        }
        .empty-state h3 {
          color: #6b5b53;
          margin: 0 0 0.5rem;
          font-size: 1.2rem;
        }
        .empty-state p {
          margin: 0;
          font-size: 0.9rem;
        }
        
        .cursor {
          animation: blink 1s infinite;
          color: #8b5c3e;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        /* TikTok section */
        .tiktok-section {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 14px;
          padding: 1rem 1.25rem;
          margin-bottom: 1rem;
        }
        .tiktok-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #fff;
          font-weight: 600;
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
        }
        .tiktok-icon {
          font-size: 1.1rem;
        }
        .tiktok-input {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          font-size: 0.85rem;
        }
        .tiktok-input::placeholder {
          color: rgba(255,255,255,0.5);
        }
        .extract-btn {
          width: 100%;
          margin-top: 0.5rem;
          padding: 0.6rem 1rem;
          background: linear-gradient(135deg, #fe2c55, #ff0050);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
        }
        .extract-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .extract-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .extracted-list {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          max-height: 120px;
          overflow-y: auto;
          padding-right: 0.25rem;
        }
        .extracted-list::-webkit-scrollbar {
          width: 4px;
        }
        .extracted-list::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
        }
        .extracted-list::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
        }
        .extracted-card {
          background: rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 0.4rem 0.6rem;
          position: relative;
          flex-shrink: 0;
        }
        .extracted-destination {
          color: #fff;
          font-weight: 600;
          font-size: 0.75rem;
          padding-right: 1.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .extracted-tips {
          color: rgba(255,255,255,0.7);
          font-size: 0.65rem;
          margin-top: 0.15rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .remove-extracted {
          position: absolute;
          top: 0.3rem;
          right: 0.4rem;
          background: none;
          border: none;
          color: rgba(255,255,255,0.5);
          font-size: 0.9rem;
          cursor: pointer;
          line-height: 1;
          padding: 0;
        }
        .remove-extracted:hover {
          color: #fe2c55;
        }
        
        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.25rem 0;
          color: #9a8a7c;
          font-size: 0.8rem;
        }
        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #d8cfc4;
        }
        .divider span {
          padding: 0 0.75rem;
        }
        
        /* Destination Search */
        .destination-search {
          position: relative;
          margin-bottom: 0.5rem;
        }
        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 0.75rem;
          font-size: 0.9rem;
          opacity: 0.6;
        }
        .search-input {
          padding-left: 2.25rem !important;
        }
        .search-spinner {
          position: absolute;
          right: 0.75rem;
          font-size: 0.8rem;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid #d8cfc4;
          border-radius: 10px;
          margin-top: 4px;
          box-shadow: 0 4px 16px rgba(59, 47, 47, 0.15);
          z-index: 100;
          max-height: 200px;
          overflow-y: auto;
        }
        .search-result-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 0.75rem;
          cursor: pointer;
          transition: background 0.15s;
          font-size: 0.85rem;
        }
        .search-result-item:hover {
          background: #f6f1ea;
        }
        .search-result-item:first-child {
          border-radius: 10px 10px 0 0;
        }
        .search-result-item:last-child {
          border-radius: 0 0 10px 10px;
        }
        .result-icon {
          font-size: 0.9rem;
        }
        .result-name {
          color: #3b2f2f;
        }
        
        /* Selected Destinations */
        .selected-destinations {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .destination-tag {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: linear-gradient(135deg, #8b5c3e, #a67c52);
          color: white;
          padding: 0.35rem 0.6rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .destination-tag button {
          background: none;
          border: none;
          color: rgba(255,255,255,0.8);
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          padding: 0;
          margin-left: 0.1rem;
        }
        .destination-tag button:hover {
          color: #fff;
        }
        
        /* Preferences Grid */
        .preferences-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 0.75rem;
          max-height: 130px;
          overflow-y: auto;
          padding-right: 0.25rem;
        }
        .preferences-grid::-webkit-scrollbar {
          width: 4px;
        }
        .preferences-grid::-webkit-scrollbar-track {
          background: transparent;
        }
        .preferences-grid::-webkit-scrollbar-thumb {
          background: #d4c4b5;
          border-radius: 2px;
        }
        .preference-chip {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.7rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1.5px solid #d4c4b5;
          background: #faf6f1;
          color: #5a4a42;
          white-space: nowrap;
        }
        .preference-chip:hover {
          background: #f0e8df;
          border-color: #8b5c3e;
        }
        .preference-chip.selected {
          background: linear-gradient(135deg, #8b5c3e, #a67c52);
          border-color: #8b5c3e;
          color: white;
          box-shadow: 0 2px 8px rgba(139, 92, 62, 0.25);
        }
        .preference-chip.selected:hover {
          background: linear-gradient(135deg, #7a5035, #956c45);
        }
        
        /* Streaming container */
        .streaming-container {
          background: linear-gradient(135deg, #fffaf4 0%, #f9f3eb 100%);
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(59, 47, 47, 0.08);
          height: fit-content;
        }
        .streaming-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #8b5c3e;
          font-weight: 600;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }
        .streaming-icon {
          font-size: 1.2rem;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .streaming-content {
          color: #5a4a42;
          line-height: 1.7;
          font-size: 0.95rem;
          white-space: pre-wrap;
          max-height: calc(100vh - 200px);
          overflow-y: auto;
        }
        
        /* Result container */
        .result-container {
        }
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .result-title {
          font-size: 1.6rem;
          color: #3b2f2f;
          font-weight: 700;
          margin: 0;
        }
        .result-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .result-badge {
          background: linear-gradient(135deg, #8b5c3e, #a67c52);
          color: white;
          padding: 0.4rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .save-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 1rem;
          background: #3b2f2f;
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .save-btn:hover {
          background: #4a3d3d;
          transform: translateY(-1px);
        }
        
        /* Day boxes */
        .day-boxes {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .day-box {
          background: #fffaf4;
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          box-shadow: 0 2px 12px rgba(59, 47, 47, 0.08);
          transition: box-shadow 0.2s;
        }
        .day-box:hover {
          box-shadow: 0 4px 20px rgba(59, 47, 47, 0.12);
        }
        .day-title-input {
          width: 100%;
          font-size: 1.15rem;
          font-weight: 700;
          color: #3b2f2f;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 0.25rem 0;
          margin-bottom: 0.75rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .day-title-input:focus {
          border-bottom-color: #8b5c3e;
        }
        .day-content-input {
          width: 100%;
          font-size: 0.9rem;
          color: #5a4a42;
          background: #faf6f1;
          border: 1px solid transparent;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          line-height: 1.7;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          font-family: inherit;
        }
        .day-content-input:focus {
          border-color: #d4c4b5;
          background: #fff;
        }
        
        /* New trip button */
        .new-trip-btn {
          display: block;
          width: 100%;
          max-width: 300px;
          margin: 2rem auto 0;
          padding: 0.9rem 1.5rem;
          background: transparent;
          border: 2px solid #3b2f2f;
          color: #3b2f2f;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .new-trip-btn:hover {
          background: #3b2f2f;
          color: white;
        }
        
        /* Responsive - stack on smaller screens */
        @media (max-width: 900px) {
          .generate-layout-split {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            height: auto;
            min-height: 100vh;
            overflow: auto;
          }
          .generate-left {
            height: auto;
            overflow: visible;
          }
          .generate-right {
            height: auto;
            min-height: 300px;
          }
        }
      `}</style>
    </div>
  );
}
