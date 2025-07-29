const activeMeetings = new Set();

function handleSocket(io, socket) {
  console.log("User is connected!!", socket.id);

  // Chat logic
  socket.on("join-meeting", ({ meetingId }) => {
    socket.join(meetingId);
    console.log(`User ${socket.id} joined meeting ${meetingId} for chat.`);
  });

  socket.on("client-msg", ({ message, username, meetingId }) => {
    const data = { username, message };
    io.to(meetingId).emit("server-msg", data);
  });

  // Video call logic
  socket.on("create-or-join-room", ({ meetingId, username, isCreating }) => {
    if (isCreating && activeMeetings.has(meetingId)) {
      // Meeting already running — reject creation
      socket.emit("meeting-exists", {
        success: false,
        message: "Meeting ID already in use. Try a different one.",
      });
      return;
    }

    // First time creation or join
    activeMeetings.add(meetingId);
    socket.data.username = username;
    socket.join(meetingId);

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

    socket.on("signal", ({ to, from, signal }) => {
      io.to(to).emit("signal", { from, signal });
    });

    socket.on("disconnect", () => {
      socket.to(meetingId).emit("user-left", { userId: socket.id });

      const room = io.sockets.adapter.rooms.get(meetingId);
      if (!room || room.size === 0) {
        activeMeetings.delete(meetingId); // Clean up if room is empty
      }
    });
  });
}

module.exports = { handleSocket };
