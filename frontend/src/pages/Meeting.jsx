import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Chats from "./Chats";
import Videocall from "./Videocall";
function Meeting() {
  const { state } = useLocation();
  const { meetingId, username, isAudio, isVideo } = state;
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <Videocall />
          </div>
          {/* <div className="col-6">
            <Chats meetingId={meetingId} username={username} />
          </div> */}
        </div>
      </div>
    </>
  );
}

export default Meeting;
