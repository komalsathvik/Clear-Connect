import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function GoogleAuthSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Logging you in...");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");

    if (token) {
      localStorage.setItem("token", token);
      setStatus("✅ Google login successful! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      setStatus("❌ Google login failed. Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  }, []);

  return (
    <div style={{ color: "white", textAlign: "center", marginTop: "2rem" }}>
      <h3>{status}</h3>
    </div>
  );
}

export default GoogleAuthSuccess;
