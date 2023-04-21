var express = require('express')
var path = require('path')
const http = require('http')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const favicon = require('serve-favicon')
const socketIO = require('socket.io')
const cors = require('cors');

var app = express()

const server = http.Server(app)

const io = socketIO(server)

const PORT = process.env.PORT || 3001

app.use(cors())

let users = [];

const addUser = (userId,socketId) => {
  !users.some(user=>user.userId === userId) &&
    users.push({userId: userId, socketId: socketId});
}

const removeUser = (socketId) => {
  users = users.filter(user=>user.socketId !== socketId)
}

const getUser = (userId)=>{
  return users.find(user=>user.userId === userId)
}

io.on("connection", (socket) => {
  socket.on("send-user", userId=>{
    addUser(userId, socket.id)
    io.emit("get-users", users)
  });

  socket.on("send-message", ({senderId, receiverId, text})=>{
    const receivedUser = getUser(receiverId);
    if (receivedUser) {
      io.to(receivedUser.socketId).emit("get-message", {
        senderId: senderId,
        text: text,
      })
    } 
  })

  socket.on("disconnect", ()=>{
    removeUser(socket.id)
    io.emit("get-users", users)
  })
})

require('dotenv').config()
require('./config/database.js')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(favicon(path.join(__dirname, 'build', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'build')));

app.use(require('./config/auth'))
app.use('/api/users', require('./routes/api/users'))
app.use('/api/friendships', require('./routes/api/friendships'));

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Express App running on ${PORT}`)
})