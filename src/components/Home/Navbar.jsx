import { useNavigate } from "react-router-dom";
import "../../styles/themes.css";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo" onClick={() => navigate("/home")}>
        TravelAI
      </div>

      {/* AI Search */}
      <input placeholder="Ask AI to plan your trip..." />

      {/* Right Section */}
      <div className="icons flex items-center gap-4">
        <button>📍</button>
        <button>🔔</button>

        {/* Profile */}
        <div className="profile">
          <img
            src="https://i.pravatar.cc/40"
            alt="profile"
            className="w-10 h-10 rounded-full cursor-pointer border border-var(--beige)"
          />

          {/* Dropdown */}
          <div className="dropdown">
            <button>Profile</button>
            <button>Settings</button>
            <button
              className="logout"
              onClick={() => navigate("/login")}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
