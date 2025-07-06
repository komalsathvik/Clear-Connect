import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

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
      const { data } = await axios.post(
        "http://localhost:9000/register", 
        inputValue,
        { withCredentials: true }
      );

      const { success, message } = data;
      if (success) {
        handleSuccess(message);
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
    <div className="col">
      <div className="signup-container">
        <p style={{ color: "black", fontWeight: "bold", fontSize: "24px" }}>
          Create an Account
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="exampleUsername" className="form-label">
              Username
            </label>
            <input
              className="form-control"
              type="text"
              name="username"
              value={username}
              placeholder="Enter username"
              onChange={handleOnChange}
            />

            <label htmlFor="exampleInputEmail1" className="form-label mt-3">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={handleOnChange}
            />
            <div id="emailHelp" className="form-text">
              We'll never share your email with anyone else.
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="exampleInputPassword1" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={password}
              placeholder="Enter your password"
              onChange={handleOnChange}
            />
          </div>

          <div className="mb-3 form-check">
            <input type="checkbox" className="form-check-input" id="exampleCheck1" />
            <label className="form-check-label" htmlFor="exampleCheck1">
              I agree to terms and conditions
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Submit
          </button>
          <span className="d-block mt-3" style={{color:"white"}}>
            Already have an account? <Link to="/login">Login</Link>
          </span>
        </form>
        <ToastContainer />
          <button
  className="btn btn-danger w-100 mt-2"
  onClick={() => {
    window.open("http://localhost:9000/auth/google", "_self");
  }}
>
  Sign in with Google
</button>
      </div>
    </div>
  );
}

export default Register;
