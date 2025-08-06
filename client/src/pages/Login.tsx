import React, { useState, FormEvent, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import './Login.css';
import logo from '../assets/Logo3.png';


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
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
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
    redirectTo: `https://modmatch.netlify.app/ResetPassword`,
  });

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Password reset email sent!");
  }
};

const handleResendConfirmation = async () => {
  const emailPrompt = prompt("Enter your email to resend confirmation link:");
  if (!emailPrompt) return;

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: emailPrompt,
  });

  if (error) {
    alert("Failed to resend confirmation: " + error.message);
  } else {
    alert("Confirmation email resent! Check your inbox.");
  }
};


  return (
    <>
    <div className="login-container">
    <img src={logo} className="logo"/>
    <form onSubmit={handleSubmit} className="login-form">
      <div className="email-row">
        <label>Email</label>
        <input
          type="email"
          placeholder=""
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-email"
        />
      </div>

      <div className="password-row">
        <label>Password</label>
        <input
          type="password"
          placeholder=""
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className ="input-password"
        />
        <span className="forgot-password" onClick={handleResetPassword}>
          Forget password
        </span>

      </div>

      <div className="center-align">
        {errorMsg && <p className="error-msg">{errorMsg}</p>}
      </div>

      <div className="center-align">
        <button type="submit" className="rounded-button">
          {isRegistering ? "Register" : "Login"}
        </button>
      </div>

      <div className="center-align">
      {!isRegistering && (
        <>
          <p className="register-text">
            <span onClick={() => setIsRegistering(true)}>Register here</span>
          </p>
          <p className="or">or</p>
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
      </div>

      {isRegistering && (
        <div className="center-align">
        <p className="register-text">
          <span onClick={() => setIsRegistering(false)}>Already have an account? Login</span>
        </p>
         <button
            type="button"
            onClick={handleResendConfirmation}
            className="rounded-button"
          >
      Resend Confirmation Email
    </button>
        </div>
      )}
    </form>
  </div>
  </>
  );
};

export default Login;
