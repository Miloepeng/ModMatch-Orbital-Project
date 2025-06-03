import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for Supabase to process the reset token in URL
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert("Failed to update password: " + error.message);
    } else {
      alert("Password successfully updated. Please log in.");
      navigate("/login");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Reset Your Password</h2>
      {loading ? (
        <p>Loading reset form...</p>
      ) : (
        <form onSubmit={handleReset}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit">Set New Password</button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
