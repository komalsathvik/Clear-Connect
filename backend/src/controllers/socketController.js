const { activeMeetings } = require("../utils/MeetingStore");

function handleSocket(io, socket) {
  console.log("User is connected!!", socket.id);

  // ✅ Chat and join-meeting
  socket.on("join-meeting", ({ meetingId }) => {
    activeMeetings.add(meetingId);
    socket.join(meetingId);
    console.log(`User ${socket.id} joined meeting ${meetingId} for chat.`);
  });

  // ✅ Chat message
  socket.on("client-msg", ({ message, username, meetingId }) => {
    const data = { username, message };
    io.to(meetingId).emit("server-msg", data);
  });

  // ✅ WebRTC signaling — 🚨 move OUTSIDE join-room
  socket.on("signal", ({ to, from, signal }) => {
    io.to(to).emit("signal", { from, signal });
  });

  // ✅ Video/Audio join
  socket.on(
    "join-room",
    ({ meetingId, username, videoEnabled, audioEnabled }) => {
      activeMeetings.add(meetingId);
      socket.data.username = username;
      socket.data.videoEnabled = videoEnabled ?? true;
      socket.data.audioEnabled = audioEnabled ?? true;

      socket.join(meetingId);
      console.log(
        `User ${socket.id} joined room ${meetingId} (video: ${videoEnabled}, audio: ${audioEnabled})`
      );

      const usersInRoom = Array.from(
        io.sockets.adapter.rooms.get(meetingId) || []
      )
        .filter((id) => id !== socket.id)
        .map((id) => {
          const userSocket = io.sockets.sockets.get(id);
          return {
            userId: id,
            username: userSocket?.data?.username || "User",
            videoEnabled: userSocket?.data?.videoEnabled ?? true,
            audioEnabled: userSocket?.data?.audioEnabled ?? true,
          };
        });

      socket.emit("all-users", usersInRoom);

      socket.to(meetingId).emit("user-joined", {
        userId: socket.id,
        username,
        videoEnabled: socket.data.videoEnabled,
        audioEnabled: socket.data.audioEnabled,
      });
    }
  );

  // ✅ Handle video toggle
  socket.on("video-toggled", ({ meetingId, userId, isVideoEnabled }) => {
    if (socket.id === userId) {
      socket.data.videoEnabled = isVideoEnabled;
    }
    io.to(meetingId).emit("video-toggled", { userId, isVideoEnabled });
  });

  // ✅ Handle disconnect
  socket.on("disconnect", () => {
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    rooms.forEach((meetingId) => {
      socket.to(meetingId).emit("user-left", { userId: socket.id });

      const room = io.sockets.adapter.rooms.get(meetingId);
      if (!room || room.size === 0) {
        activeMeetings.delete(meetingId);
      }
    });
  });
}


module.exports = { handleSocket };
