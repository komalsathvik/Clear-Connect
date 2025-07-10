import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    const token = localStorage.getItem("token");  
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-transparent" style={{ width: "90vw", marginTop: "-20px" }}>
        <div className="container-fluid">
          <a className="navbar-brand text-black fw-bold" href="#">CLEAR - CONNECT</a>

          {!isLoggedIn ? (
            <div className="ms-auto d-flex align-items-center gap-3">
              <a className="nav-link text-black" href="/guest">Join as Guest</a>
              <a className="nav-link text-black" href="/register">Register</a>
              <a href="/login"><button className="btn btn-outline-black">Login</button></a>
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
                style={{ width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer" }}
              />

              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton" data-bs-auto-close="outside">
                <li><a className="dropdown-item" href="/profile">Edit Profile</a></li>
                <li><button className="dropdown-item" onClick={logOut}>Logout</button></li>
              </ul>
            </div>
          )}
        </div>
      </nav>
      <div style={{ paddingTop: '80px' }}></div>
    </>
  );
}

export default Navbar;
