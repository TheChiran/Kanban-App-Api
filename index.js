const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

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
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);
app.use('/api/project',projectRouter);
//set up port
const PORT = process.env.PORT || 3000;

//initialize app
app.listen(PORT,()=>{
    console.log(`Listening to port: ${PORT}`);
});