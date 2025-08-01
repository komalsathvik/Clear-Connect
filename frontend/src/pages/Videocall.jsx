import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Peer from "simple-peer";
import { ToastContainer, toast } from "react-toastify";
import socket from "./socket";
import "../Videocall.css";
import "react-toastify/dist/ReactToastify.css";

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

  const userVideo = useRef();
  const streamRef = useRef();
  const peersRef = useRef([]);

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
      setPeers((prevPeers) =>
        prevPeers.map((peer) =>
          peer.peerID === userId
            ? { ...peer, videoEnabled: isVideoEnabled }
            : peer
        )
      );
    });

    // ✅ Always request both tracks
    navigator.mediaDevices
      .getUserMedia({
        video: isVideo,
        audio: isAudio,
      })
      .then((stream) => {
        // ✅ Enable or disable them after getting stream
        stream.getVideoTracks().forEach((track) => (track.enabled = isVideo));
        stream.getAudioTracks().forEach((track) => (track.enabled = isAudio));

        userVideo.current.srcObject = stream;
        streamRef.current = stream;
        setMyStream(stream);

        // ✅ Send current video status
        socket.emit("join-room", {
          meetingId,
          username,
          videoEnabled: isVideo,
        });

        // ✅ When all users are returned
        socket.on("all-users", (users) => {
          const newPeers = [];

          users.forEach(
            ({
              userId,
              username: otherUsername,
              videoEnabled: otherVideoEnabled,
            }) => {
              const peer = createPeer(userId, socket.id, stream);
              const peerObj = {
                peerID: userId,
                peer,
                username: otherUsername,
                videoEnabled: otherVideoEnabled ?? true,
              };

              peersRef.current.push(peerObj);

              peer.on("stream", (remoteStream) => {
                setPeers((prev) => [
                  ...prev,
                  { ...peerObj, stream: remoteStream },
                ]);
              });

              newPeers.push(peerObj);
            }
          );
        });

        socket.on(
          "user-joined",
          ({
            userId,
            username: newUsername,
            videoEnabled: newVideoEnabled,
          }) => {
            const peer = addPeer(userId, stream);
            const peerObj = {
              peerID: userId,
              peer,
              username: newUsername,
              videoEnabled: newVideoEnabled ?? true,
            };

            peersRef.current.push(peerObj);

            peer.on("stream", (remoteStream) => {
              setPeers((prev) => [
                ...prev,
                { ...peerObj, stream: remoteStream },
              ]);
            });
          }
        );

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
      })
      .catch((err) => {
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

  const createPeer = (userToSignal, callerID, stream) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on("signal", (signal) => {
      socket.emit("signal", { to: userToSignal, from: callerID, signal });
    });
    return peer;
  };

  const addPeer = (incomingSignalUserId, stream) => {
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on("signal", (signal) => {
      socket.emit("signal", {
        to: incomingSignalUserId,
        from: socket.id,
        signal,
      });
    });
    return peer;
  };

  const toggleVideo = () => {
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);

      if (userVideo.current) {
        userVideo.current.srcObject = null;
        userVideo.current.srcObject = streamRef.current;
      }

      socket.emit("video-toggled", {
        meetingId,
        userId: socket.id,
        isVideoEnabled: videoTrack.enabled,
      });

      setVideoRefreshKey((prev) => prev + 1);
    }
  };

  const toggleAudio = () => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };

  const toggleChat = () => {
    setIsParticipantsEnabled(false);
    setChatOpen((prev) => !prev);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit("client-msg", {
        message: newMessage,
        username,
        meetingId,
      });
      setNewMessage("");
    }
  };

  const handleSuccess = (msg) =>
    toast.success(msg, { position: "bottom-right" });

  const handleParticipants = () => {
    setChatOpen(false);
    setIsParticipantsEnabled((prev) => !prev);
  };

  const handleDisconnect = () => {
    peersRef.current.forEach(({ peer }) => peer.destroy());
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
  };

  const handleScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      const myVideo = document.getElementById("my-video");

      if (myVideo) {
        myVideo.srcObject = screenStream;
      }

      screenTrack.onended = () => {
        if (myStream) {
          const webcamTrack = myStream.getVideoTracks()[0];
          if (myVideo) {
            myVideo.srcObject = myStream;
          }
        }
      };
    } catch (err) {
      console.error("Error sharing screen:", err);
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
      videoElement.srcObject = stream;
    }
  }, [stream]);

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
    <div className="video-box">
      {showVideo ? (
        <video
          playsInline
          autoPlay
          muted={isSelf}
          ref={isSelf ? userVideoRef : ref}
        />
      ) : (
        <div
          className="video-disabled"
          style={{
            background: gradient.current,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "5em",
            fontWeight: "bold",
            width: "100%",
            height: "100%",
            borderRadius: "1rem",
          }}
        >
          {getInitials(username)}
        </div>
      )}
      <h4 className="username">{username}</h4>
    </div>
  );
}
