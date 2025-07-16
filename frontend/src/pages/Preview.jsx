import React from "react";
import { useLocation } from "react-router-dom";
function Preview() {
  const { state } = useLocation();
  const { meetingId, username } = state;

  return (
    <>
      <h1>Preview for your Meeting</h1>
      <p>User name : {username}</p>
      <p>Meeting Id : {meetingId}</p>
    </>
  );
}

export default Preview;
