import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="h-16 bg-[#3b2f2f] text-[#f5f1eb] flex items-center justify-between px-8 shadow-md">
      {/* Logo */}
      <div
        className="text-2xl font-bold cursor-pointer"
        onClick={() => navigate("/home")}
      >
        TravelAI
      </div>

  
      {/* Right Section */}
      <div className="flex items-center gap-4 relative">
        <button className="text-xl px-2 py-1 rounded hover:bg-[#4a3a3a] transition">
          📍
        </button>
        <button className="text-xl px-2 py-1 rounded hover:bg-[#4a3a3a] transition">
          🔔
        </button>

        {/* Profile */}
        <div className="relative">
          <img
            src="https://i.pravatar.cc/40"
            alt="profile"
            className="w-10 h-10 rounded-full cursor-pointer border border-[#d6bfa7]"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white text-black rounded-md shadow-lg flex flex-col">
              <button className="px-3 py-2 hover:bg-gray-100 text-left">Profile</button>
              <button className="px-3 py-2 hover:bg-gray-100 text-left">Settings</button>
              <button
                className="px-3 py-2 hover:bg-gray-100 text-left text-red-500"
                onClick={() => navigate("/login")}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
