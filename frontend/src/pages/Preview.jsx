import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

function Preview() {
  const { state } = useLocation();
  const { meetingId, username } = state;
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.log(err);
      });
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
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
  const handleJoin = () => {};
  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <h1 style={{ marginTop: "-40px" }}>Preview</h1>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "530px",
          borderRadius: "10px",
          border: "2px solid #ccc",
        }}
      />
      <div style={{ marginTop: "20px" }}>
        <button
          className="btn btn-primary"
          onClick={toggleVideo}
          style={{ margin: "10px" }}
        >
          {videoEnabled ? "Turn Off Video" : "Turn On Video"}
        </button>
        <button
          className="btn btn-primary"
          onClick={toggleAudio}
          style={{ margin: "10px" }}
        >
          {audioEnabled ? "Mute Audio" : "Unmute Audio"}
        </button>
      </div>
      <div style={{ marginTop: "20px" }}>
        <button className="btn btn-success" onClick={handleJoin}>
          Join Now
        </button>
      </div>
    </div>
  );
}

export default Preview;
