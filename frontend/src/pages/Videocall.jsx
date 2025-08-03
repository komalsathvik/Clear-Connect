// Videocall.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import socket from "./socket";
import "../Videocall.css";
import "react-toastify/dist/ReactToastify.css";

const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];

export default function Videocall() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { username, meetingId, isVideo, isAudio } = state;

  const [peers, setPeers] = useState([]);
  const [videoEnabled, setVideoEnabled] = useState(isVideo);
  const [audioEnabled, setAudioEnabled] = useState(isAudio);
  const [mySocketId, setMySocketId] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isParticipantsEnabled, setIsParticipantsEnabled] = useState(false);
  const [videoRefreshKey, setVideoRefreshKey] = useState(0);

  const userVideo = useRef();
  const streamRef = useRef();
  const peerConnections = useRef({});

  const shouldFloatMyVideo =
    peers.length >= 1 && !chatOpen && !isParticipantsEnabled;

  useEffect(() => {
    socket.on("connect", () => {
      setMySocketId(socket.id);
      socket.emit("join-meeting", { meetingId });
    });

    socket.on("meeting-exists", ({ success, message }) => {
      if (!success) {
        toast.error(message || "Meeting already running with same ID", {
          position: "bottom-center",
        });
        setTimeout(() => navigate("/"), 3000);
      }
    });

    const handleServerMsg = ({ username: sender, message }) => {
      setMessages((prev) => [...prev, { sender, text: message }]);
    };
    socket.on("server-msg", handleServerMsg);

    socket.on("video-toggled", ({ userId, isVideoEnabled }) => {
      setPeers((prev) =>
        prev.map((p) =>
          p.peerID === userId ? { ...p, videoEnabled: isVideoEnabled } : p
        )
      );
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        stream.getVideoTracks().forEach((track) => (track.enabled = isVideo));
        stream.getAudioTracks().forEach((track) => (track.enabled = isAudio));

        userVideo.current.srcObject = stream;
        streamRef.current = stream;

        socket.emit("join-room", {
          meetingId,
          username,
          videoEnabled: isVideo,
          audioEnabled: isAudio,
        });

        socket.on("all-users", (users) => {
          users.forEach((user) => {
            const peer = createPeer(user.userId, stream);
            peerConnections.current[user.userId] = peer;
            setPeers((prev) => [
              ...prev,
              {
                peerID: user.userId,
                username: user.username,
                stream: null,
                videoEnabled: user.videoEnabled ?? true,
              },
            ]);
          });
        });

        socket.on("user-joined", ({ userId, username, videoEnabled }) => {
          const peer = addPeer(userId, stream);
          peerConnections.current[userId] = peer;
          setPeers((prev) => [
            ...prev,
            {
              peerID: userId,
              username,
              stream: null,
              videoEnabled: videoEnabled ?? true,
            },
          ]);
        });

        socket.on("signal", async ({ from, signal }) => {
          const peer = peerConnections.current[from];
          if (peer) {
            try {
              if (signal.sdp) {
                await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                if (signal.sdp.type === "offer") {
                  const answer = await peer.createAnswer();
                  await peer.setLocalDescription(answer);
                  socket.emit("signal", {
                    to: from,
                    from: socket.id,
                    signal: { sdp: peer.localDescription },
                  });
                }
              } else if (signal.candidate) {
                await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
              }
            } catch (err) {
              console.error("Signal error:", err);
            }
          }
        });

        socket.on("user-left", ({ userId }) => {
          if (peerConnections.current[userId]) {
            peerConnections.current[userId].close();
            delete peerConnections.current[userId];
          }
          setPeers((prev) => prev.filter((p) => p.peerID !== userId));
        });
      })
      .catch(() => {
        toast.error("Media access denied. Please allow camera and mic.", {
          position: "bottom-center",
        });
        navigate("/");
      });

    return () => {
      socket.off("server-msg", handleServerMsg);
      socket.disconnect();
    };
  }, []);

  function createPeer(userId, stream) {
    const peer = new RTCPeerConnection({ iceServers });
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("signal", {
          to: userId,
          from: socket.id,
          signal: { candidate: event.candidate },
        });
      }
    };

    peer.ontrack = (event) => {
      setPeers((prev) =>
        prev.map((p) =>
          p.peerID === userId && !p.stream ? { ...p, stream: event.streams[0] } : p
        )
      );
    };

    peer.createOffer()
      .then((offer) => peer.setLocalDescription(offer))
      .then(() => {
        socket.emit("signal", {
          to: userId,
          from: socket.id,
          signal: { sdp: peer.localDescription },
        });
      });

    return peer;
  }

  function addPeer(fromId, stream) {
    const peer = new RTCPeerConnection({ iceServers });
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("signal", {
          to: fromId,
          from: socket.id,
          signal: { candidate: event.candidate },
        });
      }
    };

    peer.ontrack = (event) => {
      setPeers((prev) =>
        prev.map((p) =>
          p.peerID === fromId && !p.stream ? { ...p, stream: event.streams[0] } : p
        )
      );
    };

    return peer;
  }

  const toggleVideo = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setVideoEnabled(track.enabled);
      socket.emit("video-toggled", {
        meetingId,
        userId: socket.id,
        isVideoEnabled: track.enabled,
      });
      setVideoRefreshKey((k) => k + 1);
    }
  };

  const toggleAudio = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setAudioEnabled(track.enabled);
    }
  };

  const toggleChat = () => {
    setIsParticipantsEnabled(false);
    setChatOpen((prev) => !prev);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit("client-msg", { message: newMessage, username, meetingId });
      setNewMessage("");
    }
  };

  const handleParticipants = () => {
    setChatOpen(false);
    setIsParticipantsEnabled((prev) => !prev);
  };

  const handleDisconnect = () => {
    Object.values(peerConnections.current).forEach((p) => p.close());
    streamRef.current.getTracks().forEach((t) => t.stop());
    socket.disconnect();
    setPeers([]);
    setChatOpen(false);
    setIsParticipantsEnabled(false);
    toast.success("Ending the meeting", { position: "bottom-right" });
    setTimeout(() => navigate("/"), 3000);
  };

  const handleScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      Object.values(peerConnections.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track.kind === "video");
        if (sender) sender.replaceTrack(screenTrack);
      });
      userVideo.current.srcObject = screenStream;
      screenTrack.onended = () => {
        const webcamTrack = streamRef.current.getVideoTracks()[0];
        Object.values(peerConnections.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track.kind === "video");
          if (sender) sender.replaceTrack(webcamTrack);
        });
        userVideo.current.srcObject = streamRef.current;
      };
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  useEffect(() => {
    document.body.classList.toggle("chat-open", chatOpen);
    document.body.classList.toggle("participants-open", isParticipantsEnabled);
  }, [chatOpen, isParticipantsEnabled]);

  return (
    <div className="video-wrapper">
      <h2 className="room-title">Meeting Id: {meetingId}</h2>

      <div
        className={`main-content ${chatOpen || isParticipantsEnabled ? "chat-open" : ""}`}
      >
        <div
          className={`remote-grid users-${peers.length + 1} ${
            chatOpen || isParticipantsEnabled ? "centered" : ""
          }`}
        >
          {!shouldFloatMyVideo && (
            <Video
              key={`self-${videoRefreshKey}`}
              stream={streamRef.current}
              username={`${username} (You)`}
              isSelf={true}
              userVideoRef={userVideo}
              videoEnabled={videoEnabled}
            />
          )}
          {peers.map(({ peerID, stream, username, videoEnabled }) => (
            <Video
              key={peerID}
              stream={stream}
              username={username}
              videoEnabled={videoEnabled}
            />
          ))}
        </div>

        {chatOpen && (
          <div className="chat-box">
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chat-message ${
                    msg.sender === username ? "my-message" : "other-message"
                  }`}
                >
                  <strong>{msg.sender}:</strong> {msg.text}
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        )}

        {isParticipantsEnabled && (
          <div className="participants-box">
            <h3>Participants</h3>
            <ul>
              <li key={mySocketId}>{username} (You)</li>
              {peers.map((peer) => (
                <li key={peer.peerID}>{peer.username}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {shouldFloatMyVideo && (
        <div className="floating-self-video">
          <Video
            key={`self-floating-${videoRefreshKey}`}
            stream={streamRef.current}
            username={`${username} (You)`}
            isSelf={true}
            userVideoRef={userVideo}
            videoEnabled={videoEnabled}
          />
        </div>
      )}

      <div className="controls-row">
        {[
          {
            onClick: toggleAudio,
            srcOn: "https://img.icons8.com/ios-filled/50/microphone--v1.png",
            srcOff: "https://img.icons8.com/ios-filled/50/no-microphone--v1.png",
            enabled: audioEnabled,
            alt: "toggle-audio",
          },
          {
            onClick: toggleVideo,
            srcOn: "https://img.icons8.com/ios-filled/50/video-call.png",
            srcOff: "https://img.icons8.com/ios-filled/50/no-video--v1.png",
            enabled: videoEnabled,
            alt: "toggle-video",
          },
          {
            onClick: handleScreenShare,
            srcOn: "https://img.icons8.com/ios-filled/50/present-to-all.png",
            alt: "present",
          },
          {
            onClick: handleParticipants,
            srcOn: "https://img.icons8.com/ios-filled/50/conference-foreground-selected.png",
            alt: "participants",
          },
          {
            onClick: toggleChat,
            srcOn: "https://img.icons8.com/ios-glyphs/50/chat.png",
            alt: "chat",
          },
          {
            onClick: handleDisconnect,
            srcOn: "https://img.icons8.com/android/24/end-call.png",
            alt: "end-call",
          },
        ].map(({ onClick, srcOn, srcOff, enabled = true, alt }, i) => (
          <button
            key={i}
            onClick={onClick}
            className="control-btn"
            type="button"
          >
            <img
              src={enabled ? srcOn : srcOff || srcOn}
              alt={alt}
              width={40}
              height={40}
            />
          </button>
        ))}
      </div>
      <ToastContainer />
    </div>
  );
}

function Video({ stream, username, isSelf = false, userVideoRef, videoEnabled = true }) {
  const ref = useRef();
  const [showVideo, setShowVideo] = useState(videoEnabled);

  useEffect(() => {
    const videoElement = isSelf ? userVideoRef?.current : ref.current;
    if (videoElement && stream) videoElement.srcObject = stream;
  }, [stream]);

  useEffect(() => setShowVideo(videoEnabled), [videoEnabled]);

  const getInitials = (name) =>
    name.replace(/\(.*?\)/g, "").trim().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="video-box" style={{ position: "relative" }}>
      <video
        playsInline
        autoPlay
        muted={isSelf}
        ref={isSelf ? userVideoRef : ref}
        style={{ width: "100%", height: "100%", borderRadius: "1rem", objectFit: "cover" }}
      />
      {!showVideo && (
        <div
          className="video-disabled-overlay"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            background: "#000",
            width: "100%",
            height: "100%",
            borderRadius: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "5em",
            fontWeight: "bold",
          }}
        >
          {getInitials(username)}
        </div>
      )}
      <h4 className="username">{username}</h4>
    </div>
  );
}
