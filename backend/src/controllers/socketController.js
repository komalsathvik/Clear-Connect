let usersInRoom = {};
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
  console.log("User is connected!!", socket.id);

  socket.on("join-meeting", ({ meetingId }) => {
    socket.join(meetingId);
    console.log("user joined meeting", socket.id);
  });

  socket.on("client-msg", ({ message, username, meetingId }) => {
    io.to(meetingId).emit("server-msg", { username, message });
  });

  socket.on("join-room", ({ username, meetingId }) => {
    socket.join(meetingId);
    socket.data.username = username;
    socket.data.meetingId = meetingId;

    if (!usersInRoom[meetingId]) usersInRoom[meetingId] = [];
    usersInRoom[meetingId].push(socket.id);

    const usersData = usersInRoom[meetingId]
      .filter((id) => id !== socket.id)
      .map((id) => ({
        userId: id,
        username: io.sockets.sockets.get(id)?.data?.username || "user",
      }));

    socket.emit("all-users", usersData);
    socket.to(meetingId).emit("user-joined", { userId: socket.id, username });

    socket.on("signal", ({ to, from, signal }) => {
      io.to(to).emit("signal", { from, signal });
    });

    socket.on("disconnect", () => {
      const meetingId = socket.data.meetingId;
      if (meetingId) {
        usersInRoom[meetingId] = usersInRoom[meetingId]?.filter(
          (id) => id !== socket.id
        );
        socket.to(meetingId).emit("user-left", { userId: socket.id });
        if (usersInRoom[meetingId]?.length === 0) delete usersInRoom[meetingId];
      }
    });
  });
}

module.exports = { handleSocket };
