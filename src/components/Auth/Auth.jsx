import { useState } from "react";
import Title from "./Title";
import BackButton from "./BackButton";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function Auth() {
  const [view, setView] = useState("landing"); // landing | login | register
  const isAuthView = view !== "landing";

  return (
    <div className="min-h-screen bg-[#f6f1ea] relative overflow-hidden">
      {isAuthView && <BackButton onClick={() => setView("landing")} />}

      <Title view={view} setView={setView} />

      <LoginForm view={view} setView={setView} />
      <RegisterForm view={view} setView={setView} />
    </div>
  );
}