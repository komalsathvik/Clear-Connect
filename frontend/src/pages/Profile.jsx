import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
function Profile() {
  let navigate = useNavigate();
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");
  let [email, setEmail] = useState("");
  let [profilePic, setNewProfilePic] = useState(null);
  let [profilePreview, setProfilePreview] = useState(null);
  const handleError = (err) =>
    toast.error(err, {
      position: "bottom-left",
    });
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "bottom-right",
    });
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
    if (!token) {
      handleError("please login first");
      return;
    }
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("profilePic", profilePic);
    const res = await axios.put(
      "http://localhost:9000/update-profile",
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-type": "multipart/form-data",
        },
      }
    );
    const data = await res.data;
    if (data.username) localStorage.setItem("username", data.username);
    if (data.updatedProfilePic)
      localStorage.setItem("profilePic", data.updatedProfilePic);
    if (data.success) {
      handleSuccess("User profile updated");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } else {
      handleError("failed to update profile");
    }
  }
  async function handleDelete() {
    const token = localStorage.getItem("token");
    console.log(token);
    if (!token) {
      handleError("please login first");
      return;
    }
    try {
      const res = await axios.delete("http://localhost:9000/delete-profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        handleSuccess("Account deleted successfully");
        localStorage.clear();
        setTimeout(() => {
          navigate("/register");
        }, 2500);
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
    <>
      <div
        className="container mt-5 p-4 border border-dark"
        style={{
          minHeight: "650px",
          width: "600px",
          height: "500px",
          backgroundColor: "var(--bg-color)",
          color: "var(--text-color)",
        }}
      >
        <h3 className="text-center mb-4 fw-bold text-blue">
          View and Edit Your Profile
        </h3>

        <div className="mb-3">
          <label className="form-label fw-semibold">Username</label>
          <input
            className="form-control form-control-lg"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">
            Cannot change your Email
          </label>
          <input
            className="form-control form-control-lg"
            type="text"
            value={email}
            readOnly
          />
        </div>

        <div className="mb-3">
          <label htmlFor="inputPassword5" className="form-label fw-semibold">
            Update Password
          </label>
          <input
            type="password"
            id="inputPassword5"
            className="form-control"
            placeholder="Set or change your password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="formFile" className="form-label fw-semibold">
            Upload Profile Picture
          </label>
          <input
            className="form-control"
            type="file"
            id="formFile"
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
        <div className="d-flex justify-content-between">
          <button className="btn btn-success px-4" onClick={handleSave}>
            Save Changes
          </button>
          <button className="btn btn-danger px-4" onClick={handleDelete}>
            Delete Account
          </button>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}

export default Profile;
