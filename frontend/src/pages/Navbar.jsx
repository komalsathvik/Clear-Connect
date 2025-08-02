import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BackendURL } from "../config";
function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleError = (err) =>
    toast.error(err, {
      position: "bottom-left",
    });

  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "bottom-right",
    });

  const baseUrl = `${BackendURL}`;
  const rawProfilePic = localStorage.getItem("profilePic");

  const profilePic = rawProfilePic
    ? rawProfilePic.startsWith("http") || rawProfilePic.startsWith("/images/")
      ? rawProfilePic
      : `${baseUrl}${rawProfilePic}`
    : "/images/2903-default-blue.png";

  function logOut() {
    localStorage.clear();
    handleSuccess("Logged out successfully");
    setTimeout(() => (window.location.href = "/"), 3000);
  }

  function toggleTheme(theme) {
    localStorage.setItem("theme", theme.toLowerCase());
    document.documentElement.setAttribute("data-theme", theme.toLowerCase());
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedTheme = localStorage.getItem("theme") || "golden";
    document.documentElement.setAttribute("data-theme", savedTheme);
    if (token) setIsLoggedIn(true);
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-transparent px-4">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* Brand */}
          <a
            className="navbar-brand fw-bold"
            style={{ color: "var(--text-color)" }}
            href="/"
          >
            CLEAR - CONNECT
          </a>

          {/* Right section: Theme + Auth/Profile */}
          <div className="d-flex align-items-center gap-3">
            {/* Theme Dropdown */}
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
                type="button"
                id="themeDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-palette me-2"></i> Theme
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="themeDropdown"
              >
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => toggleTheme("light")}
                  >
                    🌞 Light
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => toggleTheme("dark")}
                  >
                    🌙 Dark
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => toggleTheme("golden")}
                  >
                    🌇 Golden Hour
                  </button>
                </li>
              </ul>
            </div>

            {/* Auth/Profile */}
            {!isLoggedIn ? (
              <div className="d-flex align-items-center gap-2">
                <a href="/register">
                  <button className="btn themed-btn">Register</button>
                </a>
                <a href="/login">
                  <button className="btn themed-btn">Login</button>
                </a>
              </div>
            ) : (
              <div className="dropdown">
                <img
                  src={profilePic}
                  alt="Profile"
                  className="dropdown-toggle"
                  role="button"
                  referrerPolicy="no-referrer"
                  id="profileDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                />
                <ul
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="profileDropdown"
                >
                  <li>
                    <a className="dropdown-item" href="/profile">
                      Edit Profile
                    </a>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={logOut}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>
      <ToastContainer />
      <div style={{ paddingTop: "80px" }}></div>
    </>
  );
}

export default Navbar;
