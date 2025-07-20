import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Chats from "./Chats";
function Meeting() {
  const { state } = useLocation();
  const { meetingId, username, isVideo, isAudio } = state;
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-6">
            <h1>Main meeting</h1>
          </div>
          <div className="col-6">
            <Chats meetingId={meetingId} username={username} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Meeting;
