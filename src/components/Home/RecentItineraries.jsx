import "../../styles/themes.css";

const trips = ["India", "Japan", "Brazil"];

export default function RecentItineraries() {
  return (
    <div className="card">
      <h2 className="text-lg mb-4">Recent Itineraries</h2>

      <div className="space-y-3">
        {trips.map((trip) => (
          <div key={trip} className="card-item">
            <span>{trip}</span>
            <span>→</span>
          </div>
        ))}
      </div>

      <button className="btn-dark">+ Add a trip</button>
    </div>
  );
}
