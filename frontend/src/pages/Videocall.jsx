import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://localhost:9000");

export default function VideoCall() {
  const { state } = useLocation();
  const { username, meetingId, isVideo, isAudio } = state;
  const [peers, setPeers] = useState([]);
  const [videoEnabled, setVideoEnabled] = useState(isVideo);
  const [audioEnabled, setAudioEnabled] = useState(isAudio);
  const userVideo = useRef();
  const peersRef = useRef([]);
  const streamRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        streamRef.current = stream;

        socket.emit("join-room", { meetingId, username });

        socket.on("all-users", (users) => {
          const peersArr = [];
          users.forEach(({ userId, username: otherusername }) => {
            const peer = createPeer(userId, socket.id, stream, otherusername);
            peersRef.current.push({
              peerID: userId,
              peer,
              username: otherusername,
            });
            peersArr.push({ peerID: userId, peer, username: otherusername });
          });
          setPeers(peersArr);
        });

        socket.on("user-joined", ({ userId, username: newusername }) => {
          const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: streamRef.current,
          });

          peer.on("signal", (signal) => {
            socket.emit("signal", { to: userId, from: socket.id, signal });
          });

          peersRef.current.push({
            peerID: userId,
            peer,
            username: newusername,
          });

          setPeers((users) => [
            ...users,
            { peerID: userId, peer, username: newusername },
          ]);
        });

        socket.on("signal", ({ from, signal }) => {
          const item = peersRef.current.find((p) => p.peerID === from);
          if (item) item.peer.signal(signal);
        });

        socket.on("user-left", ({ userId }) => {
          peersRef.current = peersRef.current.filter(
            (p) => p.peerID !== userId
          );
          setPeers((users) => users.filter((p) => p.peerID !== userId));
        });
      });

    return () => socket.disconnect();
  }, []);

  // Toggle video stream
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);

        // Update all peer connections
        peersRef.current.forEach(({ peer }) => {
          if (peer.streams && peer.streams[0]) {
            const newStream = new MediaStream(peer.streams[0].getTracks());
            newStream.getVideoTracks()[0].enabled = videoTrack.enabled;
            peer.replaceTrack(
              peer.streams[0].getVideoTracks()[0],
              newStream.getVideoTracks()[0],
              peer.streams[0]
            );
          }
        });
      }
    }
  };

  // Toggle audio stream
  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  function createPeer(userToSignal, callerID, stream, username) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });
    peer.on("signal", (signal) => {
      socket.emit("signal", { to: userToSignal, from: callerID, signal });
    });
    return peer;
  }

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Room: {meetingId}</h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 20,
          padding: 20,
        }}
      >
        <Video
          key={socket.id}
          peer={{ on: () => {}, off: () => {} }}
          stream={streamRef.current}
          username={`${username} (You)`}
          isSelf={true}
          userVideoRef={userVideo}
          videoEnabled={videoEnabled}
        />
        {peers.map(({ peer, peerID, username }) => (
          <Video key={peerID} peer={peer} username={username} />
        ))}
      </div>

      {/* Control buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <button
          onClick={toggleVideo}
          style={{
            padding: "10px 20px",
            backgroundColor: videoEnabled ? "#4CAF50" : "#f44336",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {videoEnabled ? "Video On" : "Video Off"}
        </button>

        <button
          onClick={toggleAudio}
          style={{
            padding: "10px 20px",
            backgroundColor: audioEnabled ? "#4CAF50" : "#f44336",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {audioEnabled ? "Mic On" : "Mic Off"}
        </button>
      </div>
    </div>
  );
}

function Video({ peer, username, isSelf = false, userVideoRef, videoEnabled }) {
  const ref = useRef();

  useEffect(() => {
    if (isSelf && userVideoRef) {
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = userVideoRef.current.srcObject;
      }
      return;
    }

    peer.on("stream", (stream) => {
      if (ref.current) ref.current.srcObject = stream;
    });
  }, [peer, isSelf, userVideoRef]);

  return (
    <div style={{ textAlign: "center" }}>
      <video
        playsInline
        autoPlay
        muted={isSelf}
        ref={isSelf ? userVideoRef : ref}
        width={300}
        style={{
          borderRadius: 10,
          border: "2px solid #ccc",
          display: videoEnabled || !isSelf ? "block" : "none",
        }}
      />
      {isSelf && !videoEnabled && (
        <div
          style={{
            width: 300,
            height: 225,
            borderRadius: 10,
            border: "2px solid #ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f0f0f0",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Video Disabled
        </div>
      )}
      <h3>{username}</h3>
    </div>
  );
}
