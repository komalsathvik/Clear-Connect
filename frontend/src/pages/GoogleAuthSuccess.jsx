import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function GoogleAuthSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Logging you in...");
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");
    const name = query.get("name");
    const picture = query.get("picture");
    const email = query.get("email");

    if (token) {
      localStorage.setItem("token", token);
      if (name) {
        localStorage.setItem("username", name);
        setUsername(name);
      }
      if (picture) {
        localStorage.setItem("profilePic", picture);
        setProfilePic(picture);
      } else {
        const defaultPic = "./images/2903-default-blue.png";
        localStorage.setItem("profilePic", defaultPic);
        setProfilePic(defaultPic);
      }
      if (email) localStorage.setItem("email", email);

      setStatus("✅ Google login successful! Redirecting...");
      setTimeout(() => navigate("/"), 2000);
    } else {
      setStatus("❌ Google login failed. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [navigate]);

  return (
    <div
      className="theme-container"
      style={{
        maxWidth: "480px",
        margin: "100px auto",
        textAlign: "center",
        borderRadius: "16px",
      }}
    >
      <div
        className="card-body"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          src={profilePic}
          alt="Profile"
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            marginBottom: "1rem",
            objectFit: "cover",
            border: "3px solid var(--primary-color)",
          }}
        />
        <h2 style={{ marginBottom: "0.5rem" }}>
          Welcome{username ? `, ${username}` : ""}!
        </h2>
        <p style={{ fontSize: "14px", opacity: 0.85 }}>{status}</p>
      </div>
    </div>
  );
}

export default GoogleAuthSuccess;
