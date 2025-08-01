import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "./socket";
import axios from "axios";
import { BackendURL } from "../config";
function Preview() {
  const { state } = useLocation();
  const { meetingId, username } = state;
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const navigate = useNavigate();
  document.body.classList.remove("modal-open");

  useEffect(() => {
    const backdrop = document.querySelector(".modal-backdrop");
    if (backdrop) {
      backdrop.remove();
    }

    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
      } catch (error) {
        console.log(error);
      }
    };
    getVideo();
  }, []);

  const toggleVideo = () => {
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };

  const handleJoin = async () => {
    const admin = localStorage.getItem("username");
    const isVideo = videoEnabled;
    const isAudio = audioEnabled;
    try {
      const res = await axios.post(`${BackendURL}/past-meeting`, {
        meetingId,
        username,
        admin,
      });
      console.log(res);
      navigate("/meeting", {
        state: { meetingId, username, isVideo, isAudio },
      });
    } catch (error) {
      console.error("Failed to join:", error);
    }
  };

  return (
    <div className="container text-center mt-4 px-3">
      <h1 className="mb-4">Preview</h1>

      <div className="d-flex justify-content-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            maxWidth: "550px",
            borderRadius: "10px",
            border: "2px solid #ccc",
          }}
        />
      </div>

      <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center mt-4 gap-2">
        <button className="btn btn-primary" onClick={toggleVideo}>
          {videoEnabled ? "Turn Off Video" : "Turn On Video"}
        </button>
        <button className="btn btn-primary" onClick={toggleAudio}>
          {audioEnabled ? "Mute Audio" : "Unmute Audio"}
        </button>
      </div>

      <div className="mt-4">
        <button className="btn btn-success px-4 py-2" onClick={handleJoin}>
          Join Now
        </button>
      </div>
    </div>
  );
}

export default Preview;
