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
  socket.on("join-room", ({ meetingId, username }) => {
    socket.data.username = username;
    socket.join(meetingId);

    // Notify the joining user about existing users
    const usersInRoom = Array.from(
      io.sockets.adapter.rooms.get(meetingId) || []
    )
      .filter((id) => id !== socket.id)
      .map((id) => ({
        userId: id,
        username: io.sockets.sockets.get(id)?.data?.username || "User",
      }));
    socket.emit("all-users", usersInRoom);

    // Notify others that a new user joined
    socket.to(meetingId).emit("user-joined", {
      userId: socket.id,
      username,
    });

    // Forward signaling data to the intended peer
    socket.on("signal", ({ to, from, signal }) => {
      io.to(to).emit("signal", { from, signal });
    });

    // When someone leaves
    socket.on("disconnect", () => {
      socket.to(meetingId).emit("user-left", { userId: socket.id });
    });
  });
}

module.exports = { handleSocket };
