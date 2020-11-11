const mongoose = require('mongoose');
const projectSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    teamLeader:{
        type:String
    },
    teamMembers: [String],
    totalComplete:{
        type: String
    },
    projectTitleList:[
        {
            name: String,
            contents: [String]
        }
    ]
});

module.exports = mongoose.model('Project',projectSchema);