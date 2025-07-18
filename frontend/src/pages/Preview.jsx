import React from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://localhost:9000");
function Preview() {
  const { state } = useLocation();
  const { meetingId, username } = state;

  return (
    <>
      <h1>Preview for your Meeting Video and Audio</h1>
      <p>User name : {username}</p>
      <p>Meeting Id : {meetingId}</p>
    </>
  );
}

export default Preview;
