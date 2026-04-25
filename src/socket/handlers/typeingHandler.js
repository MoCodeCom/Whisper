const register = (io, socket, userSocketMap) => {

  socket.on('typing', ({ to }) => {
    const s = userSocketMap.get(to);
    if (s) io.to(s).emit('typing', { from: socket.userId });
  });

  socket.on('stop_typing', ({ to }) => {
    const s = userSocketMap.get(to);
    if (s) io.to(s).emit('stop_typing', { from: socket.userId });
  });
};

module.exports = { register };
