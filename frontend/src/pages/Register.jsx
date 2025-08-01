import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BackendURL } from "../config";
function Register() {
  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
    username: "",
  });

  const { email, password, username } = inputValue;

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
      const { data } = await axios.post(`${BackendURL}/register`, inputValue, {
        withCredentials: true,
      });

      const { success, message } = data;
      if (success) {
        handleSuccess(message);
        localStorage.setItem("token", data.user.token);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem(
          "profilePic",
          data.user.profilePic || "/images/2903-default-blue.png"
        );
        setTimeout(() => navigate("/"), 1000);
      } else {
        handleError(message);
      }
    } catch (error) {
      console.error(error);
      handleError("Registration failed. Please try again.");
    }

    setInputValue({ email: "", password: "", username: "" });
  };

  return (
    <div className="col d-flex justify-content-center align-items-center vh-100">
      <div
        className="theme-container"
        style={{ width: "460px", height: "auto" }}
      >
        <p style={{ fontWeight: "bold", fontSize: "24px" }}>
          Create an Account
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              className="form-control"
              type="text"
              name="username"
              value={username}
              placeholder="Enter username"
              onChange={handleOnChange}
              required
            />

            <label htmlFor="email" className="form-label mt-3">
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
            <div id="emailHelp" className="form-text">
              We'll never share your email with anyone else.
            </div>
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

          <div className="mb-3 form-check">
            <input type="checkbox" className="form-check-input" id="agree" />
            <label className="form-check-label" htmlFor="agree">
              I agree to terms and conditions
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Submit
          </button>
          <span className="d-block mt-3">
            Already have an account? <Link to="/login">Login</Link>
          </span>
        </form>

        <ToastContainer />

        <button
          className="btn btn-danger w-100 mt-3"
          onClick={() => {
            window.open(`${BackendURL}/auth/google`, "_self");
          }}
        >
          <i className="fab fa-google me-2"></i> Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Register;
