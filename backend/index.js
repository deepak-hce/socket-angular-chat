const { info } = require('console');
const express = require('express');
const app = express();
const cors = require('cors')
app.use(cors());
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies
const models = require('./models');
const http = require('http').createServer(app);
const { User } = require('./models');
const { message } = require('./models');
const userRoutes = require('./routes/users');

const io = require('socket.io')(http, {
  cors: {
    origin: '*',
  }
});

models.sequelize.sync().then(res => {
  console.log('Database looks nice.');
}).catch(err => {
  console.log(err)
  console.log('Oops, something went wrong with the database.');
})


let totalConnectedUsers = 0;
// app.get('/', (req, res) => {
//   res.send('<h1>Hey Socket.io</h1>');
// });

app.use('/users', userRoutes);


io.on('connection', (socket) => {
  totalConnectedUsers++;
  io.emit('totalUserCount', totalConnectedUsers);
  socket.on('disconnect', () => {
    totalConnectedUsers--;
    io.emit('totalUserCount', totalConnectedUsers);
  });

  socket.on('messageSent', (msg) => {
    io.emit('my broadcast', `server: ${msg}`);
  });

  socket.on('getAllUsers', () => {
    User.findAll({where: {isActive: '1', isDeleted: '0'}}).then(res => {
      io.emit('getAllUsers', res);
    })
  });

  socket.on('getUserInfo', (email) => {
    User.findOne({where: {email, isActive: '1', isDeleted: '0'}}).then(res => {
      io.emit('getUserInfo', res);
    })
  })

  socket.on('getMessages', (data) => {
    console.log('getMessages', data);
    message.findAll({ where: { senderId: [data.senderId,  data.receiverId], receiverId: [data.senderId,  data.receiverId], isActive: '1', isDeleted: '0' } }).then(res =>{
      io.emit('getMessages', res);
    })
  })

  socket.on('sendMessage', (data) => {
    message.create({ senderId: data.senderId, receiverId: data.receiverId, message: data.message}).then((res => {
        io.emit('newMessage', data);
    }));
  })
});


app.use((req, res, next)=>{
  return res.status(404).send({status: false, comments :"API Endpoint not found."});
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});