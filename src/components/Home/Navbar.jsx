import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
  <nav className="navbar full-bleed">
      {/* Logo */}
      <div className="navbar-logo" onClick={() => navigate("/home")}>TravelAI</div>

      {/* Right Section */}
      <div className="navbar-right">
        <button className="navbar-icon-button">📍</button>
        <button className="navbar-icon-button">🔔</button>

        {/* Profile */}
        <div className="relative">
          <img
            src="https://i.pravatar.cc/40"
            alt="profile"
            className="profile-img"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="profile-dropdown">
              <button>Profile</button>
              <button>Settings</button>
              <button onClick={() => navigate("/login")} className="logout-btn">Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
