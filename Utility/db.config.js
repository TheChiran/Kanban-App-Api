const mongoose = require('mongoose');
//connect database
const DB_URI = process.env.DB_URI;

//function to connect to database
exports.module.connectDb = ()=>{
    mongoose.connect(DB_URI,()=>{
        console.log(`Connected to database`);
    });
}