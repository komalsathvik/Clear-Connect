const { activeMeetings } = require("../utils/MeetingStore");

function handleSocket(io, socket) {
  console.log("User is connected!!", socket.id);

  // ✅ Chat room join
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

  // ✅ Video/Audio join logic
  socket.on(
    "join-room",
    ({ meetingId, username, videoEnabled, audioEnabled }) => {
      activeMeetings.add(meetingId);
      socket.data.username = username;

      // ✅ Store client media state on socket
      socket.data.videoEnabled = videoEnabled ?? true;
      socket.data.audioEnabled = audioEnabled ?? true;

      socket.join(meetingId);
      console.log(
        `User ${socket.id} joined room ${meetingId} (video: ${videoEnabled}, audio: ${audioEnabled})`
      );

      // ✅ Collect info of other users already in the room
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

      // ✅ Send the list of existing users to newly joined user
      socket.emit("all-users", usersInRoom);

      // ✅ Notify other users in the room about the new user
      socket.to(meetingId).emit("user-joined", {
        userId: socket.id,
        username,
        videoEnabled: socket.data.videoEnabled,
        audioEnabled: socket.data.audioEnabled,
      });

      // ✅ Signaling for WebRTC (peer connection)
      socket.on("signal", ({ to, from, signal }) => {
        io.to(to).emit("signal", { from, signal });
      });

      // ✅ Disconnection logic
      socket.on("disconnect", () => {
        socket.to(meetingId).emit("user-left", { userId: socket.id });

        const room = io.sockets.adapter.rooms.get(meetingId);
        if (!room || room.size === 0) {
          activeMeetings.delete(meetingId);
        }
      });
    }
  );

  // ✅ Optional: Handle video toggle events
  socket.on("video-toggled", ({ meetingId, userId, isVideoEnabled }) => {
    if (socket.id === userId) {
      socket.data.videoEnabled = isVideoEnabled;
    }
    io.to(meetingId).emit("video-toggled", { userId, isVideoEnabled });
  });
}

module.exports = { handleSocket };
