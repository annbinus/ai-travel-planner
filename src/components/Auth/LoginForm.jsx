import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/themes.css";

export default function LoginForm() {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = {};
    if (!data.email) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      err.email = "Invalid email";
    if (!data.password) err.password = "Password is required";
    else if (data.password.length < 6) err.password = "Minimum 6 characters";

    setErrors(err);

    if (Object.keys(err).length === 0) {
      console.log("Login success", data);
      navigate("/home"); // go to home after login
    }
  };

  return (
    <div className="form-container form-visible">
      <form onSubmit={handleSubmit} className="form">
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

        <button className="form-button">SIGN IN</button>

        {/* Register link */}
       <p>
        Don’t have an account?{" "}
        <span
          onClick={() => navigate("/register")} // ✅ navigate on click
          className="cursor-pointer underline"
        >
          Register
        </span>
      </p>
      </form>
    </div>
  );
}
