// src/pages/GoogleAuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function GoogleAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Store token in cookies or localStorage
      document.cookie = `token=${token}; path=/;`; // optional
      localStorage.setItem("token", token); // recommended

      toast.success("Google login successful! Redirecting...", {
        position: "top-right",
      });

      // Navigate after short delay
      setTimeout(() => {
        navigate("/"); // or your dashboard
      }, 1500);
    } else {
      toast.error("Token not found from Google Auth.");
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Logging you in with Google...</h2>
    </div>
  );
}

export default GoogleAuthSuccess;
