import React, { useState, useEffect } from "react";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const baseUrl = "http://localhost:9000";
  const rawProfilePic = localStorage.getItem("profilePic");

  const profilePic = rawProfilePic
    ? rawProfilePic.startsWith("http") || rawProfilePic.startsWith("/images/")
      ? rawProfilePic
      : `${baseUrl}${rawProfilePic}`
    : "/images/2903-default-blue.png";

  function logOut() {
    localStorage.clear();
    window.location.href = "/";
  }

  // ✅ Theme handler
  function toggleTheme(theme) {
    localStorage.setItem("theme", theme.toLowerCase()); // store as lowercase
    document.documentElement.setAttribute("data-theme", theme.toLowerCase());
  }

  // ✅ On first load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedTheme = localStorage.getItem("theme") || "golden";
    document.documentElement.setAttribute("data-theme", savedTheme);
    if (token) setIsLoggedIn(true);
  }, []);

  return (
    <>
      <nav
        className="navbar navbar-expand-lg bg-transparent"
        style={{ width: "90vw", marginTop: "-20px" }}
      >
        <div className="container-fluid">
          <a
            className="navbar-brand fw-bold"
            style={{ color: "var(--text-color)" }}
            href="#"
          >
            CLEAR - CONNECT
          </a>
          <div
            style={{ marginLeft: "auto", marginRight: "-590px" }}
            className="dropdown"
          >
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
                  onClick={() => toggleTheme("Dark")}
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

          {/* 🔐 Login / Profile */}
          {!isLoggedIn ? (
            <div className="ms-auto d-flex align-items-center gap-3">
              <a href="/guest">
                <button className="btn themed-btn">Join as Guest</button>
              </a>
              <a href="/register">
                <button className="btn themed-btn">Register</button>
              </a>
              <a href="/login">
                <button className="btn themed-btn">Login</button>
              </a>
            </div>
          ) : (
            <div className="dropdown ms-auto">
              <img
                src={profilePic}
                alt="Profile"
                className="dropdown-toggle"
                role="button"
                id="dropdownMenuButton"
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
                aria-labelledby="dropdownMenuButton"
                data-bs-auto-close="outside"
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
      </nav>
      <div style={{ paddingTop: "80px" }}></div>
    </>
  );
}

export default Navbar;
