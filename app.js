const express = require('express');
const path = require('path');
const app = express();

const server = app.listen(3000, () => {
  console.log('listening on port 3000');
});

const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));

const totalUsers = new Set();

io.on('connection', onConnected);
function onConnected(socket) {

  totalUsers.add(socket.id);

  io.emit('totalUsers', totalUsers.size);

  socket.on('disconnect', () => {
    totalUsers.delete(socket.id);
    io.emit('totalUsers', totalUsers.size);
  });

  socket.on('message', (message) => {
    socket.broadcast.emit('chat-data', message);
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);
  });
}
