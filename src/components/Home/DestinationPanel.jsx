export default function DestinationsPanel({ destinations, onSelect }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4">
        Destinations ({destinations.length})
      </h2>

      {destinations.map((dest) => (
        <div
          key={dest.id}
          onClick={() => onSelect(dest)}
          className="p-4 mb-3 rounded-xl border hover:bg-gray-50 cursor-pointer"
        >
          <h3 className="font-semibold">{dest.name}</h3>
          <p className="text-sm text-gray-600">{dest.description}</p>
        </div>
      ))}
    </div>
  );
}
