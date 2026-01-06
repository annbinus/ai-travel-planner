const trips = ["India", "Japan", "Brazil"];

export default function RecentItineraries() {
  return (
    <div className="col-span-1 bg-white rounded-2xl p-6 shadow">
      <h2 className="text-lg mb-4">Recent Itineraries</h2>

      <div className="space-y-3">
        {trips.map((trip) => (
          <div
            key={trip}
            className="flex justify-between items-center bg-[#efe7dc] px-4 py-3 rounded-lg cursor-pointer"
          >
            <span>{trip}</span>
            <span>→</span>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 bg-[#4b4036] text-white py-3 rounded-xl">
        + Add a trip
      </button>
    </div>
  );
}
