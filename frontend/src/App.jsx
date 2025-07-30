import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GoogleAuthSuccess from "./pages/GoogleAuthSuccess";
import Profile from "./pages/Profile";
import Preview from "./pages/Preview";
import Meeting from "./pages/Meeting";
import PastMeetings from "./pages/PastMeetings";

function ThemeWrapper({ children }) {
  const location = useLocation();

  useEffect(() => {
    const isMeetingPage = location.pathname === "/meeting";
    if (isMeetingPage) {
      document.body.classList.add("video-page");
    } else {
      document.body.classList.remove("video-page");
    }
  }, [location.pathname]);

  return children;
}

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "golden";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return (
    <BrowserRouter>
      <ThemeWrapper>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/google-auth-success" element={<GoogleAuthSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/meeting" element={<Meeting />} />
          <Route path="/past-meetings" element={<PastMeetings />} />
        </Routes>
      </ThemeWrapper>
    </BrowserRouter>
  );
}

export default App;
