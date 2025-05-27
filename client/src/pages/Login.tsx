import React, { useState, FormEvent } from "react";
import { supabase } from "../supabaseClient";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      setErrorMsg("Invalid credentials or user not found.");
      return;
    }

    if (data.session?.access_token) {
      localStorage.setItem("token", data.session.access_token);
      alert("Login successful!");
      window.location.href = "/dashboard"; // Or navigate with React Router
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Log In</button>
      </form>
    </div>
  );
};

export default Login;
