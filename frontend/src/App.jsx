import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Guest from "./pages/Guest";
import GoogleAuthSuccess from "./pages/GoogleAuthSuccess";
import Profile from "./pages/Profile";
import Preview from "./pages/Preview";
import Meeting from "./pages/Meeting";

function App() {
  const setTheme = (theme) => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "golden";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/guest" element={<Guest />} />
        <Route path="/google-auth-success" element={<GoogleAuthSuccess />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/meeting" element={<Meeting />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
