import { useState } from "react";

export default function LoginForm({ view, setView }) {
  const [data, setData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = {};

    if (!data.email) err.email = "Email is required";
    else if (!validateEmail(data.email)) err.email = "Invalid email";

    if (!data.password) err.password = "Password is required";
    else if (data.password.length < 6)
      err.password = "Minimum 6 characters";

    setErrors(err);

    if (Object.keys(err).length === 0) {
      console.log("Login success", data);
    }
  };

  return (
    <div
      className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 transition-all duration-700
      ${view === "login" ? "-translate-y-1/2 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-72">
        <input
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          className="border border-gray-800 px-4 py-2 bg-transparent focus:outline-none"
        />
        {errors.email && <span className="text-xs">{errors.email}</span>}

        <input
          type="password"
          placeholder="Password"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
          className="border border-gray-800 px-4 py-2 bg-transparent focus:outline-none"
        />
        {errors.password && <span className="text-xs">{errors.password}</span>}

        <button className="border border-gray-800 py-2 mt-2 hover:bg-gray-200">
          SIGN IN
        </button>

        <p className="text-sm text-center">
          Don’t have an account?{" "}
          <span
            onClick={() => setView("register")}
            className="underline cursor-pointer"
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
}
