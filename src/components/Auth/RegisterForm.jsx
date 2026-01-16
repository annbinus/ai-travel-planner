import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ import navigator
import "../../styles/themes.css";

export default function RegisterForm() {
  const navigate = useNavigate(); // ✅ initialize
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = {};

    if (!data.name) err.name = "Name is required";
    if (!data.email) err.email = "Email is required";
    else if (!validateEmail(data.email)) err.email = "Invalid email";
    if (!data.password) err.password = "Password is required";
    else if (data.password.length < 6)
      err.password = "Minimum 6 characters";

    setErrors(err);

    if (Object.keys(err).length === 0) {
      // Call backend register
      fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      })
        .then((res) => {
          if (!res.ok) return res.json().then((b) => Promise.reject(b));
          return res.json();
        })
        .then((body) => {
          console.log("Register success", body);
          navigate("/login");
        })
        .catch((errResp) => {
          console.error("Register failed:", errResp);
          setErrors({ form: errResp.error || "Registration failed" });
        });
    }
  };

  return (
    <div className="form-container form-visible">
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Full Name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
        {errors.name && <span>{errors.name}</span>}

        <input
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />
        {errors.email && <span>{errors.email}</span>}

        <input
          type="password"
          placeholder="Password"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />
        {errors.password && <span>{errors.password}</span>}

        <button>CREATE ACCOUNT</button>

        <p>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")} // ✅ navigate on click
            className="cursor-pointer underline"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
