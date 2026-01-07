import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Title from "./Title";
import BackButton from "./BackButton";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState("landing"); // landing | login | register

  useEffect(() => {
    if (location.pathname === "/login") setView("login");
    else if (location.pathname === "/register") setView("register");
    else setView("landing");
  }, [location.pathname]);

  const isAuthView = view !== "landing";

  return (
    <div className="min-h-screen bg-[#f6f1ea] relative overflow-hidden">
      {isAuthView && <BackButton onClick={() => navigate("/auth")} />}

      {/* Title */}
      <Title view={view} />

      {/* Landing buttons BELOW the title */}
      {view === "landing" && (
        <div className="absolute left-1/2 transform -translate-x-1/2 top-[55%] flex flex-col gap-4 w-64">
          <button
            onClick={() => navigate("/login")}
            className="form-button"
          >
            LOGIN
          </button>
          <button
            onClick={() => navigate("/register")}
            className="form-button"
          >
            REGISTER
          </button>
        </div>
      )}

      {/* Forms */}
      {view === "login" && <LoginForm />}
      {view === "register" && <RegisterForm />}
    </div>
  );
}
