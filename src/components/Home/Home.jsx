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
    <div className="h-screen w-full bg-[#f5f1eb] flex flex-col">
      {/* Navbar */}
      <Navbar onAdd={() => setShowModal(true)} />
        <AdventureBar onAdd={() => setShowModal(true)} />


      {/* Main content */}
      <main className="flex-1 flex gap-6 p-6">
        {/* Left: Map */}
        <div className="flex-1 rounded-3xl overflow-hidden shadow-lg">
          <MapSection destinations={destinations} onSelect={setSelected} />
        </div>

        {/* Right: Panels */}
        <div className="flex flex-col gap-6 w-1/2">
          <DestinationsPanel destinations={destinations} onSelect={setSelected} />
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
