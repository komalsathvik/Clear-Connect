import React, { useState, useEffect } from "react";
import axios from "axios";
function PastMeetings() {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const past = async () => {
      try {
        const admin = localStorage.getItem("username");
        const response = await axios.get(
          `http://localhost:9000/history?admin=${admin}`
        );

        setMeetings(response.data.data);
      } catch (error) {
        console.error("Error fetching past meetings:", error);
      }
    };

    past();
  }, []);

  return (
    <div className="past-meetings-container">
      <h1 className="title">Past Meetings</h1>
      {meetings.length === 0 ? (
        <p className="no-meetings">No meetings found.</p>
      ) : (
        <div className="meetings-list">
          {meetings.map((meeting, index) => (
            <div key={index} className="meeting-card">
              <p>
                <strong>Username:</strong> {meeting.username}
              </p>
              <p>
                <strong>Meeting ID:</strong> {meeting.meetingId}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PastMeetings;
