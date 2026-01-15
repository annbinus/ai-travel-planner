export default function AdventureBar({ onAdd, onGenerate }) {
  return (
    <div className="adventure-bar full-bleed">
      {/* Title */}
      <h1 className="adventure-title">Plan Your Adventure</h1>

      {/* Subtitle */}
      <p className="adventure-subtitle">Add destinations and generate a personalized travel plan</p>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        <button onClick={onAdd} className="adventure-btn btn-white">Add Destination</button>
        <button onClick={onGenerate} className="adventure-btn btn-dark-strong">Generate Trip Plan</button>
      </div>
    </div>
  );
}
