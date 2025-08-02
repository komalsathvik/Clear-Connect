import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Peer from "simple-peer";
import { ToastContainer, toast } from "react-toastify";
import socket from "./socket";
import "../Videocall.css";
import "react-toastify/dist/ReactToastify.css";

const iceServers = [
  {
    urls: "stun:bn-turn2.xirsys.com",
  },
  {
    urls: [
      "turn:bn-turn2.xirsys.com:80?transport=udp",
      "turn:bn-turn2.xirsys.com:3478?transport=udp",
      "turn:bn-turn2.xirsys.com:80?transport=tcp",
      "turn:bn-turn2.xirsys.com:3478?transport=tcp",
      "turns:bn-turn2.xirsys.com:443?transport=tcp",
      "turns:bn-turn2.xirsys.com:5349?transport=tcp",
    ],
    username:
      "coD4CDDm9AGcJ_iSuDPjCHqRmP8eMXGFQ-9_AGRQ23oUu2WTy5z1fW-8dzRzBiWNAAAAAGiN4y1yb2hpdGg=",
    credential: "606472fc-6f88-11f0-8048-0242ac140004",
  },
];

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
  const [myStream, setMyStream] = useState(null);
  const [isParticipantsEnabled, setIsParticipantsEnabled] = useState(false);
  const [videoRefreshKey, setVideoRefreshKey] = useState(0);

  // Refs for video and peers persistent values
  const userVideo = useRef();
  const streamRef = useRef();
  const peersRef = useRef([]);

  const shouldFloatMyVideo =
    peers.length >= 1 && !chatOpen && !isParticipantsEnabled;

  // Handlers to keep stable references
  const handleServerMsg = useCallback(
    ({ username: sender, message }) => {
      setMessages((prev) => [...prev, { sender, text: message }]);
    },
    [setMessages]
  );

  useEffect(() => {
  const onConnect = () => {
    setMySocketId(socket.id);
    socket.emit("join-meeting", { meetingId, username, videoEnabled: isVideo });
  };

  socket.on("connect", onConnect);
  socket.on("meeting-exists", ({ success, message }) => {
    if (!success) {
      toast.error(message || "Meeting conflict", { position: "bottom-center" });
      setTimeout(() => navigate("/"), 3000);
    }
  });

  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      stream.getVideoTracks()[0].enabled = isVideo;
      stream.getAudioTracks()[0].enabled = isAudio;

      userVideo.current.srcObject = stream;
      streamRef.current = stream;

      socket.emit("join-room", { meetingId, username, videoEnabled: isVideo });

      socket.once("all-users", users => {
        users.forEach(({ userId, username: otherName }) => {
          const peer = new Peer({ initiator: true, trickle: false, stream, config: { iceServers } });
          peer.on("signal", signal =>
            socket.emit("signal", { to: userId, from: socket.id, signal })
          );
          peer.on("stream", remoteStream => {
            setPeers(prev => [...prev, { peerID: userId, stream: remoteStream, username: otherName }]);
          });
        });
      });

      socket.on("user-joined", ({ userId, username: otherName }) => {
        if (peersRef.current.find(p => p.peerID === userId)) return;
        const peer = new Peer({ initiator: false, trickle: false, stream, config: { iceServers } });
        peer.on("signal", signal =>
          socket.emit("signal", { to: userId, from: socket.id, signal })
        );
        peer.on("stream", remoteStream => {
          setPeers(prev => [...prev, { peerID: userId, stream: remoteStream, username: otherName }]);
        });
        peersRef.current.push({ peerID: userId, peer });
      });

      socket.on("signal", data => {
        const item = peersRef.current.find(p => p.peerID === data.from);
        if (item && item.peer && data.signal) {
          try {
            item.peer.signal(data.signal);
          } catch (err) {
            console.error("peer.signal error:", err);
          }
        } else {
          console.warn("Invalid signal packet or missing peer:", data);
        }
      });

      socket.on("user-left", ({ userId }) => {
        peersRef.current = peersRef.current.filter(p => p.peerID !== userId);
        setPeers(prev => prev.filter(p => p.peerID !== userId));
      });
    })
    .catch(err => {
      toast.error("Please grant camera/mic access", { position: "bottom-center" });
      navigate("/");
    });

  return () => {
    socket.off("connect", onConnect);
    socket.disconnect();
  };
}, [meetingId, username]);


  // Create initiator peer
  const createPeer = useCallback((userToSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: { iceServers },
    });
    peer.on("signal", (signal) => {
      socket.emit("signal", { to: userToSignal, from: callerID, signal });
    });
    return peer;
  }, []);

  // Add peer as a receiver
  const addPeer = useCallback((incomingSignalUserId, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: { iceServers },
    });

    peer.on("signal", (signal) => {
      socket.emit("signal", {
        to: incomingSignalUserId,
        from: socket.id,
        signal,
      });
    });

    return peer;
  }, []);

  // Toggle local video track enabled state without resetting srcObject
  const toggleVideo = useCallback(() => {
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);

      socket.emit("video-toggled", {
        meetingId,
        userId: socket.id,
        isVideoEnabled: videoTrack.enabled,
      });

      setVideoRefreshKey((prev) => prev + 1);
    }
  }, [meetingId]);

  // Toggle local audio track enabled state
  const toggleAudio = useCallback(() => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  }, []);

  const toggleChat = useCallback(() => {
    setIsParticipantsEnabled(false);
    setChatOpen((prev) => !prev);
  }, []);

  const sendMessage = useCallback(() => {
    if (newMessage.trim()) {
      socket.emit("client-msg", {
        message: newMessage,
        username,
        meetingId,
      });
      setNewMessage("");
    }
  }, [newMessage, meetingId, username]);

  const handleSuccess = useCallback(
    (msg) => toast.success(msg, { position: "bottom-right" }),
    []
  );

  const handleParticipants = useCallback(() => {
    setChatOpen(false);
    setIsParticipantsEnabled((prev) => !prev);
  }, []);

  const handleDisconnect = useCallback(() => {
    peersRef.current.forEach(({ peer }) => {
      peer.removeAllListeners();
      peer.destroy();
    });
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (socket.connected) {
      socket.disconnect();
    }
    peersRef.current = [];
    setPeers([]);
    setChatOpen(false);
    setIsParticipantsEnabled(false);
    handleSuccess("Ending the meeting");
    setTimeout(() => navigate("/"), 3000);
  }, [navigate, handleSuccess]);

  const handleScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace track in all peer connections
      peersRef.current.forEach(({ peer }) => {
        const sender = peer._pc
          .getSenders()
          .find((s) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      // Replace local video display
      const myVideo = document.getElementById("my-video");
      if (myVideo) {
        myVideo.srcObject = screenStream;
      }

      // When screen sharing ends, revert to original webcam
      screenTrack.onended = () => {
        const webcamTrack = streamRef.current.getVideoTracks()[0];

        peersRef.current.forEach(({ peer }) => {
          const sender = peer._pc
            .getSenders()
            .find((s) => s.track?.kind === "video");
          if (sender) {
            sender.replaceTrack(webcamTrack);
          }
        });

        if (myVideo) {
          myVideo.srcObject = streamRef.current;
        }
      };
    } catch (err) {
      console.error("Error sharing screen:", err);
      toast.error("Screen sharing failed.", { position: "bottom-center" });
    }
  }, []);

  useEffect(() => {
    // Toggle body classes only when chat or participants open state changes
    document.body.classList.toggle("chat-open", chatOpen);
    document.body.classList.toggle("participants-open", isParticipantsEnabled);
  }, [chatOpen, isParticipantsEnabled]);

  return (
    <div className="video-wrapper">
      <h2 className="room-title">Meeting Id: {meetingId}</h2>

      <div
        className={`main-content ${
          chatOpen || isParticipantsEnabled ? "chat-open" : ""
        }`}
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
            <div className="chat-messages" role="log" aria-live="polite">
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
                aria-label="Chat message input"
              />
              <button onClick={sendMessage} aria-label="Send message">
                Send
              </button>
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

      <div
        className="controls-row"
        role="toolbar"
        aria-label="meeting controls"
      >
        {[
          {
            onClick: toggleAudio,
            srcOn: "https://img.icons8.com/ios-filled/50/microphone--v1.png",
            srcOff:
              "https://img.icons8.com/ios-filled/50/no-microphone--v1.png",
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
            srcOn:
              "https://img.icons8.com/ios-filled/50/conference-foreground-selected.png",
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
            aria-pressed={enabled}
            aria-label={alt.replace(/-/g, " ")}
          >
            <img
              src={enabled ? srcOn : srcOff || srcOn}
              alt={alt}
              width={40}
              height={40}
              draggable={false}
            />
          </button>
        ))}
      </div>
      <ToastContainer />
    </div>
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
  const [showVideo, setShowVideo] = useState(videoEnabled);
  const gradient = useRef(
    `radial-gradient(circle at center, hsl(${
      Math.random() * 360
    }, 70%, 60%), #333)`
  );

  useEffect(() => {
    const videoElement = isSelf ? userVideoRef?.current : ref.current;
    if (videoElement && stream) {
      // Only set srcObject if changed to avoid flicker
      if (videoElement.srcObject !== stream) {
        videoElement.srcObject = stream;
      }
    }
  }, [stream, isSelf, userVideoRef]);

  useEffect(() => {
    setShowVideo(videoEnabled);
  }, [videoEnabled]);

  const getInitials = (name) =>
    name
      .replace(/\(.*?\)/g, "")
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="video-box" style={{ position: "relative" }}>
      <video
        id={isSelf ? "my-video" : undefined}
        playsInline
        autoPlay
        muted={isSelf}
        ref={isSelf ? userVideoRef : ref}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "1rem",
          objectFit: "cover",
          background: !showVideo ? gradient.current : undefined,
        }}
        data-testid={`${username}-video`}
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
          aria-label={`${username} video is off`}
        >
          {getInitials(username)}
        </div>
      )}

      <h4 className="username">{username}</h4>
    </div>
  );
}
