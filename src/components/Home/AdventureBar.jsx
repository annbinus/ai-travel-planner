export default function AdventureBar({ onAdd, onGenerate }) {
  return (
    <div className="bg-[#d6bfa7] text-[#3b2f2f] py-16 px-8 shadow-md flex flex-col items-center gap-6">
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-center">
        Plan Your Adventure
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-[#3b2f2f]/80 max-w-xl text-center">
        Explore destinations and add trips to make your dream journey come alive!
      </p>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        {/* Add Destination */}
        <button
          onClick={onAdd}
          className="bg-white text-[#3b2f2f] px-8 py-3 rounded-2xl font-semibold shadow hover:scale-105 transition"
        >
          Add Destination
        </button>

        {/* Generate Itinerary */}
        <button
          onClick={onGenerate}
          className="bg-[#3b2f2f] text-white px-8 py-3 rounded-2xl font-semibold shadow hover:scale-105 transition"
        >
          Create My Adventure Plan
        </button>
      </div>
    </div>
  );
}
