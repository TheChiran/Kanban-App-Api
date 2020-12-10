const cors = require('cors');
const app = require('express')();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
//set up port
const PORT = process.env.PORT || 3000;
//initialize server
//initialize app
const server = http.listen(PORT,()=>{
  // console.log(`Listening to port: ${PORT}`);
});
//set up socket server
const io = require('socket.io')(server,{
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
      }
});
dotenv.config();

//get routes
const authRouter = require('./Authentication/auth.route');
const userRouter = require('./User/user.route');
const projectRouter = require('./Project/project.route');


//connect database
const DB_URI = process.env.DB_URI;
mongoose.connect(DB_URI,()=>{
    console.log(`Connected to database`);
});


//initialize helper libraries
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

//initialize app routers
app.get('/',(req,res)=>{
    res.send({message: 'Hello World'});
});

app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);
app.use('/api/project',projectRouter);

const {v4: uid} = require('uuid');

//socket live messages
// io.on('connection', (socket) => {
//     console.log('a user connected');
//     socket.on('disconnect', () => {
//       console.log('user disconnected');
//     });
//     socket.on('new-message', (message,user) => {
//         // io.emit('new-message',message);
//         io.emit('message-broadcast',message,user);
//         // console.log(message);
//         // socket.send(message);
//     });
//   });
io.on('connection',(socket)=>{

    // console.log('new connection made.');


    socket.on('join', function(data){
      //joining
      socket.join(data.room);

    //   console.log(data.user + ' joined the room : ' + data.room);

      socket.broadcast.to(data.room).emit('new user joined', {user:`${data.user} joined chat`});
    });


    socket.on('leave', function(data){
    
      console.log(data.user + 'left the room : ' + data.room);

      socket.broadcast.to(data.room).emit('left room', {user:data.user, message:'has left this room.'});

      socket.leave(data.room);
    });

    socket.on('message',function(data){

      io.in(data.room).emit('new message', {user:data.user, message:data.message});
    });
});
