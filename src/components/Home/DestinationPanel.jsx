export default function DestinationsPanel({ destinations, onSelect }) {
  // Ensure destinations is always an array
  const safeDestinations = Array.isArray(destinations) ? destinations : [];

  return (
    <div className="panel fill-scroll pad-vertical-md pad-inner dest-panel">
      <h2 className="h2-md">Destinations ({safeDestinations.length})</h2>

      <div className="scroll-body">
        {safeDestinations.map((dest) => (
          <div
            key={dest.id}
            onClick={() => onSelect(dest)}
            className="card card-item"
          >
            <h3 className="fw-semibold">{dest.name}</h3>
            <p className="muted">{dest.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
