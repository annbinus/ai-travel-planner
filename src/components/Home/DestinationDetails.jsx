export default function DestinationDetails({ destination }) {
  if (!destination) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6 flex items-center justify-center text-gray-400">
        Select a destination
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-2">{destination.name}</h2>
      <p className="text-gray-600">{destination.description}</p>
    </div>
  );
}
