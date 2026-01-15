import { useState } from "react";
import Navbar from "./Navbar";
import MapSection from "./MapSection";
import DestinationsPanel from "./DestinationPanel";
import DestinationDetails from "./DestinationDetails";
import AddDestinationModal from "./AddDestinationModal";
import AdventureBar from "./AdventureBar";

export default function Home() {
  const [destinations, setDestinations] = useState([
    {
      id: 1,
      name: "Paris",
      description: "City of lights and cafes",
      latitude: 48.8566,
      longitude: 2.3522,
      tiktokUrl: "",
      tiktokFile: null,
    },
    {
      id: 2,
      name: "Tokyo",
      description: "Tradition meets technology",
      latitude: 35.6762,
      longitude: 139.6503,
      tiktokUrl: "",
      tiktokFile: null,
    },
  ]);

  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="home-layout">
      {/* Navbar */}
      <Navbar onAdd={() => setShowModal(true)} />
      <AdventureBar onAdd={() => setShowModal(true)} />


      {/* Main content */}
  <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 pad-inner pad-vertical-md main-fixed">
        {/* Left: Map */}
        <div className="map-fixed">
          <MapSection destinations={destinations} onSelect={setSelected} />
        </div>

        {/* Right: Panels */}
        <div className="fill-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingRight: '1rem', overflow: 'hidden' }}>
          <DestinationsPanel
            destinations={destinations}
            onSelect={setSelected}
          />
          <DestinationDetails destination={selected} />
        </div>
      </main>

      {/* Add Destination Modal */}
      {showModal && (
        <AddDestinationModal
          onClose={() => setShowModal(false)}
          onAdd={(dest) => {
            setDestinations((prev) => [...prev, dest]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
