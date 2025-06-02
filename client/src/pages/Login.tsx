import React, { useState, FormEvent, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";


const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session && data.session.user) {
      navigate("/Home");
    }
  };

  checkSession();
}, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

  if (isRegistering) {
      // Register new user
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        alert("Check your email to confirm your account.");
      }
    } else {
      // Login existing user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg("Invalid credentials");
      } else {
        localStorage.setItem("token", data.session?.access_token || "");
        navigate("/Home");
      }
    }
  };

  const handleResetPassword = async () => {
  const emailPrompt = prompt("Enter your email to reset your password:");
  if (!emailPrompt) return;

  const { error } = await supabase.auth.resetPasswordForEmail(emailPrompt, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Password reset email sent!");
  }
};



  return (
     <div className="login-container">
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-row">
        <label>Username</label>
        <input
          type="email"
          placeholder=""
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-row password-row">
        <label>Password</label>
        <input
          type="password"
          placeholder=""
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span className="forgot-password" onClick={handleResetPassword}>
          Forget password
        </span>
      </div>

      {errorMsg && <p className="error-msg">{errorMsg}</p>}

      <button type="submit" className="rounded-button">
        {isRegistering ? "Register" : "Login"}
      </button>

      {!isRegistering && (
        <>
          <p className="register-text">
            <span onClick={() => setIsRegistering(true)}>Register here</span>
          </p>
          <p>or</p>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem("guest", "true");
              navigate("/Home");
              }}
            className="rounded-button"
          >
            Guest Login
          </button>
        </>
      )}

      {isRegistering && (
        <p className="register-text">
          <span onClick={() => setIsRegistering(false)}>Already have an account? Login</span>
        </p>
      )}
    </form>
  </div>
  );
};

export default Login;
