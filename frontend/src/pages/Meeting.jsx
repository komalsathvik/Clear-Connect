import React from "react";
import { useLocation } from "react-router-dom";
function Meeting() {
  const { state } = useLocation();
  const { meetingId, username } = state;
  return (
    <>
      <h1>Main meeting</h1>
      <h2>{meetingId}</h2>
      <h2>{username}</h2>
    </>
  );
}

export default Meeting;
