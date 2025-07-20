import React, { useEffect, useState } from "react";
import  io from "socket.io-client";
const socket = io("http://localhost:9000");
function Chats({ username, meetingId }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.emit("join-meeting", { meetingId });
  });

  useEffect(() => {
    socket.on("server-msg", (msg) => {
      setChat((prev) => [...prev, msg]);
    });
    return () => {
      socket.off("server-msg");
    };
  }, []);

  const sentMsg = () => {
    if (message.trim() !== "") {
      socket.emit("client-msg", {
        message: message,
        username: username,
        meetingId: meetingId,
      });
      setMessage("");
    }
  };

  return (
    <>
      <h1>Chat</h1>
      <div className="div">
        {chat.map((msg) => {
          return (
            <p>
              {" "}
              <b>{msg.username}</b> : {msg.message}
            </p>
          );
        })}
      </div>

      <p>{username}</p>
      <input
        type="text"
        placeholder="Enter message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sentMsg}>send</button>
    </>
  );
}

export default Chats;
