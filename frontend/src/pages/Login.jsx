import React, { useEffect, useState } from "react";
import { Link, useNavigate,useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

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
      const { data } = await axios.post(
        "http://localhost:9000/login",
        inputValue,
        { withCredentials: true }
      );

      const { success, message } = data;
      if (success) {
        handleSuccess(message);
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    localStorage.setItem("profilePic", data.profilePic || "./images/2903-default-blue.png");
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
      <div className="col">
        <div className="login-container" style={{ background: "linear-gradient(to right,rgb(243, 226, 193), #90ee90)" ,width:"450px",height:"400px"}}>
          <p style={{ color: "black", fontWeight: "bold", fontSize: "24px" }}>
            Login into your account
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">
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
            <button type="submit" className="btn btn-primary w-100">
              Submit
            </button>

            <span className="d-block mt-3">
              Don’t have an account? <Link to="/signup">Signup</Link>
            </span>
          </form>

          <ToastContainer />
          <button
  className="btn btn-danger w-100 mt-2"
  onClick={() => {
    window.open("http://localhost:9000/auth/google", "_self");
  }}
>
  Login with Google
</button>
        </div>
      </div>
    </>
  );
}

export default Login;
