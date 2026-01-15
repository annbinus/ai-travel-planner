export default function DestinationDetails({ destination }) {
  if (!destination) {
      return (
        <div className="panel panel-centered">
          <p>Select a destination to see details</p>
        </div>
      );
  }

  return (
    <div className="panel">
        <h2 className="h2-md" style={{ marginBottom: '0.5rem' }}>{destination.name}</h2>
        <p className="muted">{destination.description}</p>
    </div>
  );
}
