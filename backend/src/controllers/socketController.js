function handleSocket(io, socket) {
  console.log("User is connected!!", socket.id);

  // Chat logic
  socket.on("join-meeting", ({ meetingId }) => {
    socket.join(meetingId);
    console.log("user joined meeting", socket.id);
  });

  socket.on("client-msg", ({ message, username, meetingId }) => {
    const data = { username, message };
    io.to(meetingId).emit("server-msg", data);
  });

  // Video call logic
  socket.on("join-room", ({ meetingId, username }) => {
    socket.join(meetingId);
    socket.data.username = username;

    const usersInRoom = Array.from(
      io.sockets.adapter.rooms.get(meetingId) || []
    );
    const usersData = usersInRoom
      .filter((id) => id !== socket.id)
      .map((id) => ({
        userId: id,
        username: io.sockets.sockets.get(id)?.data?.username || "User",
      }));
    socket.emit("all-users", usersData);

    socket.to(meetingId).emit("user-joined", {
      userId: socket.id,
      username,
    });

    socket.on("signal", ({ to, from, signal }) => {
      io.to(to).emit("signal", { from, signal });
    });

    socket.on("disconnect", () => {
      socket.to(meetingId).emit("user-left", { userId: socket.id });
    });
  });
}

module.exports = { handleSocket };
