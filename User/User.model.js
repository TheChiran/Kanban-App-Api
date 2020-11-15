const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        min: 6,
        max: 20
    },
    email:{
        type: String,
        required: true,
        min: 6,
        max: 20
    },
    password:{
        type: String,
        required: true,
        min: 6,
        max: 20
    },
    image:{
        type: String
    },
    projectRequestList:[
        {
            invitedBy:String,
            projectName: String,
            projectId: String
        }
    ],
    workingProjectList: [String]
});

module.exports = mongoose.model('User',userSchema);