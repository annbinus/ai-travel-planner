import { Link } from "react-router-dom";

export default function Navbar({ onAdd }) {
  return (
    <nav className="navbar full-bleed bg-white shadow-md p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-xl font-bold">AI Travel Planner</Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onAdd}
          className="btn btn-primary px-4 py-2 rounded"
        >
          Add Destination
        </button>
        <Link to="/generate" className="btn btn-secondary px-4 py-2 rounded">Generate</Link>
      </div>
    </nav>
  );
}
