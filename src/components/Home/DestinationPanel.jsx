export default function DestinationsPanel({ destinations, onSelect, onDelete }) {
  // Ensure destinations is always an array
  const safeDestinations = Array.isArray(destinations) ? destinations : [];

  const handleDelete = (e, dest) => {
    e.stopPropagation(); // Prevent triggering onSelect
    if (window.confirm(`Delete "${dest.name}"?`)) {
      onDelete(dest);
    }
  };

  return (
    <div className="panel fill-scroll pad-vertical-md pad-inner dest-panel">
      <h2 className="h2-md">Destinations ({safeDestinations.length})</h2>

      <div className="scroll-body">
        {safeDestinations.map((dest) => (
          <div
            key={dest.id}
            onClick={() => onSelect(dest)}
            className="card card-item destination-card"
            style={{ position: 'relative' }}
          >
            <h3 className="fw-semibold">{dest.name}</h3>
            <p className="muted">{dest.description}</p>
            
            <button
              onClick={(e) => handleDelete(e, dest)}
              className="delete-btn"
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                background: 'transparent',
                color: '#999',
                border: 'none',
                borderRadius: '0',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '300',
                lineHeight: '1',
                opacity: '0.5',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '1';
                e.target.style.color = '#666';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '0.5';
                e.target.style.color = '#999';
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
