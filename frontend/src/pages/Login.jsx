import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export const BackendURL = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
  });

  const { email, password } = inputValue;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({ ...inputValue, [name]: value });
  };

  const handleError = (err) =>
    toast.error(err, {
      position: "bottom-left",
    });

  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "bottom-right",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${BackendURL}/login`, inputValue, {
        withCredentials: true,
      });

      const { success, message } = data;
      if (success) {
        handleSuccess(message);
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem(
          "profilePic",
          data.profilePic || "./images/2903-default-blue.png"
        );
        setTimeout(() => navigate("/"), 1000);
      } else {
        handleError(message);
      }
    } catch (error) {
      console.error(error);
      handleError("Login failed. Please try again.");
    }

    setInputValue({ email: "", password: "" });
  };

  return (
    <>
      <div className="col d-flex justify-content-center align-items-center vh-100">
        <div
          className="theme-container"
          style={{ width: "450px", height: "auto" }}
        >
          <p style={{ fontWeight: "bold", fontSize: "24px" }}>
            Login into your account
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={email}
                placeholder="Enter your email"
                onChange={handleOnChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={password}
                placeholder="Enter your password"
                onChange={handleOnChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Submit
            </button>

            <span className="d-block mt-3">
              Don’t have an account? <Link to="/register">Signup</Link>
            </span>
          </form>

          <ToastContainer />

          <button
            className="btn btn-danger w-100 mt-3"
            onClick={() => {
              window.open(`${BackendURL}/auth/google`, "_self");
            }}
          >
            <i className="fab fa-google me-2"></i> Login with Google
          </button>
        </div>
      </div>
    </>
  );
}

export default Login;

