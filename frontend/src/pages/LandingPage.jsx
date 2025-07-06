import React from 'react';
import Navbar from './Navbar';

function LandingPage() {
  return (
    <>
      <Navbar />
      <div className="container mt-3">
  <div className="row">
    <div className="col-6">
      <h1 style={{ color: 'black' ,marginTop:"-35px"}}>Connect with your loved ones</h1>
      <p style={{ color: 'black', fontSize: 'large' }}>
        Cover a distance by clear-connect. A platform to connect, talk, and spend time!
      </p>
    </div>
  </div>
  <br></br><br></br>
  <div className="row mt-6">
    <div className="col-md-3 mb-3">
      <div className="card gradient-card">
        <div className="card-body">
          <h5 className="card-title">Create A meeting</h5>
          <p className="card-text">Create your own instant meeting</p>
          <button
        type="button"
        className="btn btn-outline-dark"
        data-bs-toggle="modal"
        data-bs-target="#createMeetingModal"
      >
        Create a meeting
      </button>
        </div>
      </div>
    </div>

    <div className="col-md-3 mb-3">
      <div className="card gradient-card">
        <div className="card-body">
          <h5 className="card-title">Join A Meeting</h5>
          <p className="card-text">Join a meeting quickly using meeting id</p>
          <button
        type="button"
        className="btn btn-outline-dark"
        data-bs-toggle="modal"
        data-bs-target="#joinMeetingModal"
      >
        Join a meeting
      </button>
        </div>
      </div>
    </div>

    <div className="col-md-3 mb-3">
      <div className="card gradient-card">
        <div className="card-body">
          <h5 className="card-title">Past Meetings</h5>
          <p className="card-text">Check your past meetings history</p>
          <a href="#" className="btn btn-outline-dark">PAST MEETINGS</a>
        </div>
      </div>
    </div>

    <div className="col-md-3 mb-3">
      <div className="card gradient-card">
        <div className="card-body">
          <h5 className="card-title">Edit your profile</h5>
          <p className="card-text">Edit and view your profile data </p>
          <a href="#" className="btn btn-outline-dark">EDIT</a>
        </div>
      </div>
    </div>
  </div>
</div>

      {/* Create Meeting Modal */}
      <div
        className="modal fade"
        id="createMeetingModal"
        tabIndex="-1"
        aria-labelledby="createMeetingModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content text-dark">
            <div className="modal-header">
              <h5 style={{color:"white"}} className="modal-title" id="createMeetingModalLabel">Create a Meeting</h5>
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
                  <label style={{color:"white"}} className="form-label">Meeting ID</label>
                  <input type="text" className="form-control" placeholder="Enter meeting ID" />
                </div>
                <div className="mb-3">
                  <label style={{color:"white"}} className="form-label">Scheduled Time</label>
                  <input type="datetime-local" className="form-control" />
                </div>
                <div className='end'>
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <button type="button" className="btn btn-primary">Create</button>
                </div>
              </form>
            </div>
            </div>
          </div>
        </div>

      {/* Join Meeting Modal */}
      <div
        className="modal fade"
        id="joinMeetingModal"
        tabIndex="-1"
        aria-labelledby="joinMeetingModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content text-dark">
            <div className="modal-header">
              <h5 style={{color:"white"}}  className="modal-title" id="joinMeetingModalLabel">Join a Meeting</h5>
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
                  <label style={{color:"white"}} className="form-label">Meeting ID</label>
                  <input type="text" className="form-control" placeholder="Enter meeting ID" />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-success">Join</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LandingPage;
