export default function DestinationsPanel({ destinations, onSelect }) {
  return (
    <div className="panel fill-scroll pad-vertical-md pad-inner dest-panel">
      <h2 className="h2-md">Destinations ({destinations.length})</h2>

      <div className="scroll-body">
        {destinations.map((dest) => (
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
