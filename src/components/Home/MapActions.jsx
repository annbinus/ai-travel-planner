import "../../styles/themes.css";

export default function MapActions() {
  return (
    <div className="card flex flex-col gap-4 h-full">
      <h3 className="text-lg font-semibold">Next steps</h3>

      <button className="btn-dark">✨ Generate itinerary</button>
      <button className="btn-dark">✈️ Find flights</button>
      <button className="btn-dark">🏨 View stays</button>
      <button className="btn-dark">Upload travel videos</button>

      <p className="text-sm opacity-70 mt-2">
        Select a destination on the map to continue
      </p>
    </div>
  );
}
