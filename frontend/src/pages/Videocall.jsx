import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://localhost:9000");

export default function Videocall() {
  const { state } = useLocation();
  const { username, meetingId, isVideo, isAudio } = state;

  const [peers, setPeers] = useState([]);
  const [videoEnabled, setVideoEnabled] = useState(isVideo);
  const [audioEnabled, setAudioEnabled] = useState(isAudio);
  const [mySocketId, setMySocketId] = useState("");

  const userVideo = useRef();
  const streamRef = useRef();
  const peersRef = useRef([]);

  useEffect(() => {
    socket.on("connect", () => {
      setMySocketId(socket.id);
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        streamRef.current = stream;

        socket.emit("join-room", { meetingId, username });

        socket.on("all-users", (users) => {
          users.forEach(({ userId, username: otherUsername }) => {
            const peer = createPeer(userId, socket.id, stream);
            const peerObj = { peerID: userId, peer, username: otherUsername };

            peersRef.current.push(peerObj);

            peer.on("stream", (remoteStream) => {
              setPeers((prev) => [
                ...prev,
                { ...peerObj, stream: remoteStream },
              ]);
            });
          });
        });

        socket.on("user-joined", ({ userId, username: newUsername }) => {
          const peer = addPeer(userId, stream);

          const peerObj = { peerID: userId, peer, username: newUsername };

          peersRef.current.push(peerObj);

          peer.on("stream", (remoteStream) => {
            setPeers((prev) => [...prev, { ...peerObj, stream: remoteStream }]);
          });
        });

        socket.on("signal", ({ from, signal }) => {
          const item = peersRef.current.find((p) => p.peerID === from);
          if (item) item.peer.signal(signal);
        });

        socket.on("user-left", ({ userId }) => {
          peersRef.current = peersRef.current.filter(
            (p) => p.peerID !== userId
          );
          setPeers((prev) => prev.filter((p) => p.peerID !== userId));
        });
      });

    return () => {
      socket.disconnect();
    };
  }, []);

  function createPeer(userToSignal, callerID, stream) {
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

  function addPeer(incomingSignalUserId, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("signal", {
        to: incomingSignalUserId,
        from: socket.id,
        signal,
      });
    });

    return peer;
  }

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

  return (
    <>
      <div className="row">
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
            key={mySocketId}
            stream={streamRef.current}
            username={`${username} (You)`}
            isSelf={true}
            userVideoRef={userVideo}
            videoEnabled={videoEnabled}
          />
          {peers.map(({ peerID, stream, username }) => (
            <Video key={peerID} stream={stream} username={username} />
          ))}
        </div>
      </div>
      <div className="row">
        <div className="col-2 p-5 mt-2">
          <button
            onClick={toggleAudio}
            style={{
              padding: "10px 20px",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {audioEnabled ? (
              <img
                width="50"
                height="50"
                src="https://img.icons8.com/ios-filled/50/microphone--v1.png"
                alt="microphone--v1"
              />
            ) : (
              <img
                width="50"
                height="50"
                src="https://img.icons8.com/ios-filled/50/no-microphone--v1.png"
                alt="no-microphone--v1"
              />
            )}
          </button>
        </div>
        <div className="col-2 p-5 mt-2">
          <button
            onClick={toggleVideo}
            style={{
              padding: "10px 20px",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {videoEnabled ? (
              <img
                width="50"
                height="50"
                src="https://img.icons8.com/ios-filled/50/video-call.png"
                alt="video-call"
              />
            ) : (
              <img
                width="50"
                height="50"
                src="https://img.icons8.com/ios-filled/50/no-video--v1.png"
                alt="no-video--v1"
              />
            )}
          </button>
        </div>
        <div className="col-2 p-5 mt-2">
          <button
            style={{
              padding: "10px 20px",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            <img
              width="50"
              height="50"
              src="https://img.icons8.com/ios-filled/50/present-to-all.png"
              alt="present-to-all"
            />
          </button>
        </div>
        <div className="col-2 p-5 mt-2">
          <button
            style={{
              padding: "10px 20px",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            <img
              width="50"
              height="50"
              src="https://img.icons8.com/ios-filled/50/conference-foreground-selected.png"
              alt="conference-foreground-selected"
            />
          </button>
        </div>
        <div className="col-2 p-5 mt-2">
          <button
            style={{
              padding: "10px 20px",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            <img
              width="50"
              height="50"
              src="https://img.icons8.com/ios-glyphs/50/chat.png"
              alt="chat"
            />
          </button>
        </div>
        <div className="col-2 p-5 mt-2">
          <button
            style={{
              padding: "10px 20px",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            <img
              width="50"
              height="50"
              src="https://img.icons8.com/android/24/end-call.png"
              alt="end-call"
            />
          </button>
        </div>
      </div>
    </>
  );
}

function Video({
  stream,
  username,
  isSelf = false,
  userVideoRef,
  videoEnabled = true,
}) {
  const ref = useRef();

  useEffect(() => {
    if (isSelf && userVideoRef?.current) {
      userVideoRef.current.srcObject = userVideoRef.current.srcObject;
    } else if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

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
          display: isSelf ? (videoEnabled ? "block" : "none") : "block",
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
