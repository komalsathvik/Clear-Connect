import React, { useState } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
function LandingPage() {
  const [meetingId, setMeetingId] = useState("");
  const [username, setUsername] = useState("");
  const Navigate = useNavigate();

  function handleSubmit() {
    Navigate("/preview", { state: { meetingId, username } });
  }

  return (
    <>
      <Navbar />
      <div className="container mt-3">
        <div className="row">
          <div className="col-6">
            <h3 style={{ color: "var(--text-color)", marginTop: "-35px" }}>
              Clear-Connect - Where Conversations Drive Impact
            </h3>
            <p style={{ color: "var(--text-color)", fontSize: "large" }}>
              Your unified platform for secure, high-quality virtual meetings
              and meaningful connections — anytime, anywhere.
            </p>
          </div>
        </div>
        <br />
        <br />
        <div className="row mt-6">
          <div className="col-md-3 mb-3">
            <div className="card gradient-card border border-dark">
              <div className="card-body">
                <h5 className="card-title">Create A Meeting</h5>
                <p className="card-text">Create your own instant meeting</p>
                <button
                  type="button"
                  className="themed-btn border border-dark"
                  data-bs-toggle="modal"
                  data-bs-target="#createMeetingModal"
                >
                  Create a meeting
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card gradient-card border border-dark">
              <div className="card-body">
                <h5 className="card-title">Join A Meeting</h5>
                <p className="card-text">
                  Join a meeting quickly using meeting ID
                </p>
                <button
                  type="button"
                  className="themed-btn border border-dark"
                  data-bs-toggle="modal"
                  data-bs-target="#joinMeetingModal"
                >
                  Join a meeting
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card gradient-card border border-dark">
              <div className="card-body">
                <h5 className="card-title">Past Meetings</h5>
                <p className="card-text">Check your past meetings history</p>
                <a href="#" className="themed-btn border border-dark">
                  Past Meetings
                </a>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card gradient-card border border-dark">
              <div className="card-body">
                <h5 className="card-title">Edit your profile</h5>
                <p className="card-text">Edit and view your profile data</p>
                <a href="/profile" className="themed-btn border border-dark">
                  Edit
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="createMeetingModal"
        tabIndex="-1"
        aria-labelledby="createMeetingModalLabel"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="createMeetingModalLabel">
                Create a Meeting
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Meeting ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Create a meeting ID"
                    onChange={(e) => setMeetingId(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Join as name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Name"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="end">
                  <button
                    type="button"
                    className="themed-btn"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <button
                    type="button"
                    className="themed-btn"
                    onClick={handleSubmit}
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="joinMeetingModal"
        tabIndex="-1"
        aria-labelledby="joinMeetingModalLabel"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="joinMeetingModalLabel">
                Join a Meeting
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Meeting ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter meeting ID"
                    onChange={(e) => setMeetingId(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Name"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="themed-btn"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="themed-btn"
                onClick={handleSubmit}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LandingPage;
