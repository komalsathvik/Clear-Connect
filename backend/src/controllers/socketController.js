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

  // ✅ Video logic
  socket.on("join-room", ({ meetingId, username }) => {
    activeMeetings.add(meetingId);
    socket.data.username = username;
    socket.join(meetingId);
    console.log(activeMeetings);
    const usersInRoom = Array.from(
      io.sockets.adapter.rooms.get(meetingId) || []
    )
      .filter((id) => id !== socket.id)
      .map((id) => ({
        userId: id,
        username: io.sockets.sockets.get(id)?.data?.username || "User",
      }));

    socket.emit("all-users", usersInRoom);

    socket.to(meetingId).emit("user-joined", {
      userId: socket.id,
      username,
    });

    // Signaling
    socket.on("signal", ({ to, from, signal }) => {
      io.to(to).emit("signal", { from, signal });
    });

    // Disconnect logic
    socket.on("disconnect", () => {
      socket.to(meetingId).emit("user-left", { userId: socket.id });

      const room = io.sockets.adapter.rooms.get(meetingId);
      if (!room || room.size === 0) {
        activeMeetings.delete(meetingId);
      }
    });
  });
}

module.exports = { handleSocket };
