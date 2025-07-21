import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const handleJoin = () => {
    const isVideo = videoEnabled;
    const isAudio = audioEnabled;
    navigate("/meeting", { state: { meetingId, username, isVideo, isAudio } });
  };
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
