import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function GoogleAuthSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Logging you in...");
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");
    const username=query.get("name");
    const profilePic=query.get("picture");

    if (token) {
      localStorage.setItem("token", token);
      if(username)localStorage.setItem("username",username);
      if(profilePic)localStorage.setItem("profilePic",profilePic);
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
