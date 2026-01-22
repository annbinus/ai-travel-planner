import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import MapSection from "./MapSection";
import DestinationsPanel from "./DestinationPanel";
import AddDestinationModal from "./AddDestinationModal";
import AdventureBar from "./AdventureBar";

// Function to parse activities from day content
const parseActivitiesFromContent = (content) => {
  const activities = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && trimmed !== '-' && !trimmed.startsWith('-')) {
      // Look for time patterns and activity descriptions
      const timeMatch = trimmed.match(/^(\d{1,2}:\d{2}\s*(AM|PM)?)\s*-\s*(.+)/i);
      if (timeMatch) {
        const time = timeMatch[1];
        const activity = timeMatch[3];
        
        // Extract location and description
        const colonIndex = activity.indexOf(':');
        if (colonIndex > -1) {
          const location = activity.substring(0, colonIndex).trim();
          const description = activity.substring(colonIndex + 1).trim();
          
          activities.push({
            time,
            location,
            description,
            type: inferActivityType(location, description)
          });
        } else {
          activities.push({
            time,
            location: activity,
            description: '',
            type: inferActivityType(activity, '')
          });
        }
      } else if (trimmed.startsWith('-')) {
        // Handle bullet points without times
        const activityText = trimmed.substring(1).trim();
        const colonIndex = activityText.indexOf(':');
        if (colonIndex > -1) {
          const location = activityText.substring(0, colonIndex).trim();
          const description = activityText.substring(colonIndex + 1).trim();
          
          activities.push({
            time: '',
            location,
            description,
            type: inferActivityType(location, description)
          });
        }
      }
    }
  }
  
  return activities;
};

// Function to infer activity type based on keywords
const inferActivityType = (location, description) => {
  const text = (location + ' ' + description).toLowerCase();
  
  if (text.includes('restaurant') || text.includes('lunch') || text.includes('dinner') || text.includes('food') || text.includes('cuisine') || text.includes('market')) {
    return 'restaurant';
  } else if (text.includes('museum') || text.includes('temple') || text.includes('shrine') || text.includes('pavilion') || text.includes('art')) {
    return 'museum';
  } else if (text.includes('park') || text.includes('garden') || text.includes('nature') || text.includes('scenic')) {
    return 'park';
  } else if (text.includes('shopping') || text.includes('market') || text.includes('boutique') || text.includes('store')) {
    return 'shopping';
  } else if (text.includes('nightlife') || text.includes('bar') || text.includes('club') || text.includes('lounge')) {
    return 'nightlife';
  } else if (text.includes('hotel') || text.includes('accommodation') || text.includes('stay')) {
    return 'hotel';
  } else {
    return 'activity';
  }
};

export default function Home() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Handle destination selection - navigate to itinerary page
  const handleDestinationSelect = async (destination) => {
    setSelected(destination);
    
    // If it's an itinerary destination, navigate directly to the saved itinerary page
    if (destination.isItinerary) {
      navigate(`/saved-itinerary/${destination.itineraryId}`);
      return;
    }
    
    // For regular destinations, find associated itinerary
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

  // Handle destination deletion
  const handleDestinationDelete = async (destination) => {
    try {
      if (destination.isItinerary) {
        // Delete saved itinerary
        const res = await fetch(`http://localhost:5001/api/itineraries/${destination.itineraryId}`, {
          method: "DELETE"
        });
        
        if (!res.ok) {
          throw new Error("Failed to delete itinerary");
        }
        
        // Remove from local state
        setDestinations(prev => prev.filter(d => d.id !== destination.id));
      } else {
        // Delete regular destination
        const res = await fetch(`http://localhost:5001/api/destinations/${destination.id}`, {
          method: "DELETE"
        });
        
        if (!res.ok) {
          throw new Error("Failed to delete destination");
        }
        
        // Remove from local state
        setDestinations(prev => prev.filter(d => d.id !== destination.id));
      }
    } catch (err) {
      console.error("Failed to delete destination:", err);
      alert("Failed to delete destination. Please try again.");
    }
  };

  // Fetch destinations from backend
  const fetchAllData = async () => {
    try {
      // Fetch regular destinations
      const destRes = await fetch("http://localhost:5001/api/destinations");
      let destinations = [];
        if (destRes.ok) {
          const destData = await destRes.json();
          destinations = Array.isArray(destData)
            ? destData.map((dest) => ({
                ...dest,
                latitude: typeof dest.latitude === "string" ? parseFloat(dest.latitude) : dest.latitude,
                longitude: typeof dest.longitude === "string" ? parseFloat(dest.longitude) : dest.longitude,
                isItinerary: false
              }))
            : [];
        }

        // Fetch saved itineraries and convert them to destinations
        const itinRes = await fetch("http://localhost:5001/api/itineraries");
        if (itinRes.ok) {
          const itineraries = await itinRes.json();
          
          // Convert each itinerary to a destination-like object
          const itineraryDestinations = await Promise.all(
            itineraries.map(async (itinerary) => {
              // Get the first destination from the itinerary items to use coordinates
              try {
                const itemsRes = await fetch(`http://localhost:5001/api/itinerary-items?itinerary_id=${itinerary.id}`);
                if (itemsRes.ok) {
                  const items = await itemsRes.json();
                  let destinationNames = [];
                  let preferences = [];
                  let latitude = 40.7128; // Default NYC
                  let longitude = -74.0060;
                  
                  if (items.length > 0 && items[0].notes) {
                    try {
                      const data = JSON.parse(items[0].notes);
                      destinationNames = data.destinations || [];
                      preferences = data.preferences || [];
                      
                      // Extract individual activities from all days
                      const extractedItems = [];
                      items.forEach(item => {
                        if (item.notes) {
                          try {
                            const dayData = JSON.parse(item.notes);
                            if (dayData.content) {
                              // Parse the content to extract individual activities
                              const activities = parseActivitiesFromContent(dayData.content);
                              extractedItems.push(...activities.map(activity => ({
                                ...activity,
                                day: item.day
                              })));
                            }
                          } catch (dayError) {
                            console.warn('Could not parse day notes for day', item.day, dayError);
                          }
                        }
                      });
                      
                      // Store extracted items for potential use
                      console.log('Extracted activities from', itinerary.title, ':', extractedItems);
                      
                    } catch (jsonError) {
                      // Handle case where notes is not valid JSON (e.g., plain text)
                      console.warn('Could not parse notes as JSON for itinerary', itinerary.id, '- treating as plain text');
                      destinationNames = [itinerary.title]; // Use title as fallback destination
                      preferences = [];
                    }
                    
                    // Try to get coordinates for the first destination
                    if (destinationNames.length > 0) {
                      try {
                        const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || "pk.eyJ1IjoiYW5uYmludXMiLCJhIjoiY21rNHB3c2wxMDIxYjNlb3BzZnAyeHdqdiJ9.JBPzH4oT7DjWIMJaCjCuBw";
                        const geocodeRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destinationNames[0])}.json?access_token=${mapboxToken}&limit=1`);
                        if (geocodeRes.ok) {
                          const geocodeData = await geocodeRes.json();
                          if (geocodeData.features && geocodeData.features.length > 0) {
                            const [lng, lat] = geocodeData.features[0].center;
                            latitude = lat;
                            longitude = lng;
                          }
                        }
                      } catch (geocodeError) {
                        console.warn("Failed to geocode destination:", destinationNames[0], geocodeError);
                      }
                    }
                  }
                  
                  return {
                    id: `itinerary-${itinerary.id}`,
                    name: itinerary.title,
                    description: `${items.length} days • ${destinationNames.join(", ")}${preferences.length > 0 ? ` • ${preferences.slice(0,2).join(", ")}` : ""}`,
                    latitude,
                    longitude,
                    image_url: "/assets/pic1.webp", // Default image
                    created_at: itinerary.created_at,
                    isItinerary: true,
                    itineraryId: itinerary.id
                  };
                }
              } catch (err) {
                console.error("Error processing itinerary:", err);
              }
              
              return {
                id: `itinerary-${itinerary.id}`,
                name: itinerary.title,
                description: "Saved itinerary",
                latitude: 40.7128,
                longitude: -74.0060,
                image_url: "/assets/pic1.webp",
                created_at: itinerary.created_at,
                isItinerary: true,
                itineraryId: itinerary.id
              };
            })
          );
          
          // Combine regular destinations and itinerary destinations
          const allDestinations = [...destinations, ...itineraryDestinations];
          setDestinations(allDestinations);
        } else {
          setDestinations(destinations);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setDestinations([]);
      }
  };
    
  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="home-layout">
      {/* Navbar */}
      <Navbar onAdd={() => setShowModal(true)} />
      <AdventureBar onAdd={() => setShowModal(true)} 
        onGenerate={() => navigate("/generate")}/>


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
            onDelete={handleDestinationDelete}
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
