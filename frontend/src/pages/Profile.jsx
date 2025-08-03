import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { BackendURL } from "../config";
function Profile() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setNewProfilePic] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  const handleError = (err) => toast.error(err, { position: "bottom-left" });

  const handleSuccess = (msg) =>
    toast.success(msg, { position: "bottom-right" });

  function handleProfileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePic(file);
      const preview = URL.createObjectURL(file);
      setProfilePreview(preview);
    }
  }

  async function handleSave() {
    const token = localStorage.getItem("token");
    if (!token) return handleError("Please login first");

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("profilePic", profilePic);

    try {
      const res = await axios.put(`${BackendURL}/update-profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const data = res.data;

      if (data.username) localStorage.setItem("username", data.username);
      if (data.updatedProfilePic)
        localStorage.setItem("profilePic", data.updatedProfilePic);

      if (data.success) {
        handleSuccess("User profile updated");
        setTimeout(() => navigate("/"), 3000);
      } else {
        handleError("Failed to update profile");
      }
    } catch (error) {
      handleError("Error updating profile");
    }
  }

  async function handleDelete() {
    const token = localStorage.getItem("token");
    if (!token) return handleError("Please login first");

    try {
      const res = await axios.delete(`${BackendURL}/delete-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        handleSuccess("Account deleted successfully");
        localStorage.clear();
        setTimeout(() => navigate("/register"), 2500);
      } else {
        handleError("Failed to delete profile");
      }
    } catch (err) {
      handleError(err.response?.data?.message || "Error deleting profile");
    }
  }

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email");
    if (storedUsername) setUsername(storedUsername);
    if (storedEmail) setEmail(storedEmail);
  }, []);

  return (
    <div className="container mt-5">
      <div
        className="mx-auto p-4 border rounded shadow"
        style={{
          backgroundColor: "var(--bg-color)",
          color: "var(--text-color)",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <h3 className="text-center mb-4 fw-bold text-primary">
          View and Edit Your Profile
        </h3>

        <div className="mb-3">
          <label className="form-label fw-semibold">Username</label>
          <input
            className="form-control"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Email (read-only)</label>
          <input className="form-control" type="email" value={email} readOnly />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Update Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Set or change your password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">
            Upload Profile Picture
          </label>
          <input
            className="form-control"
            type="file"
            onChange={handleProfileChange}
          />
        </div>

        {profilePreview && (
          <div className="text-center mb-3">
            <p>Your profile pic preview</p>
            <img
              src={profilePreview}
              alt="Preview"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </div>
        )}

        <div className="d-flex flex-column flex-sm-row justify-content-between gap-2">
          <button className="btn btn-success w-100" onClick={handleSave}>
            Save Changes
          </button>
          <button className="btn btn-danger w-100" onClick={handleDelete}>
            Delete Account
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Profile;
