const User = require('./../User/User.model');
const Project = require('./Project.model');

//method to invite a member to ptoject
module.exports.inviteProject = async(req,res)=>{
    const {recieverEmail,projectName,projectId} = req.body;
    const {_id} = req.user;
    
    //get user mail
    const senderEmail = await User.findOne({_id}).select('email');
    if(!senderEmail) return res.send({message: 'invalid Credentials'});
    //to check if sender email and reciever email are same or not
    if(senderEmail.email == recieverEmail) return res.send({message: `Sorry! you cant invite yourself`});
    //check if reciever user exists or not
    const receiver = await User.findOne({email: recieverEmail});
    if(!receiver) return res.send({message: `Invalid User Email`});

    

    try{
        await User.findOneAndUpdate(
            {email: recieverEmail},
            {$push:{
                projectRequestList:{
                    invitedBy: senderEmail.email, 
                    projectName: projectName,
                    projectId: projectId
                }
            }});
        // await receiver.save();
        res.send({message: `User Request was succesfully sent!`});
    }
    catch(err){
        res.status(400).send(`Something went wrong! Please try again`);
        // console.log(err);
    }
};

//method to retrive user project request list
module.exports.projectRequestList = async(req,res)=>{
    const {_id} = req.user;
    const requestList = await User.findOne({_id}).select('projectRequestList');
    res.send(requestList);
};

//method to accept invitation
module.exports.acceptInvitation = async(req,res)=>{
    const {projectId} = req.body;
    const {_id} = req.user;

    //get user
    const user = await User.findOne({_id}).select('email');
    const pushUserToTeamMember = await addTeamMember(projectId,user.email);
    if(!pushUserToTeamMember) return res.send({message: 'Sorry! Invalid user email or user already exists'});


    const result = await pushToWorkingProject(projectId,_id);
    if(!result) return res.send({message: 'Unable to push to working project'});

    try{
        await User.findOneAndUpdate(
            {_id},
            {$pull:{
                projectRequestList:{
                    projectId: projectId
                }
            }});
        res.send({message: `Succesfully updated`});
        
    }
    catch(err){
        res.status(400).send('Something went wrong');
    }

};
//push team member to project
const addTeamMember = async(projectId,teamMemberEmail)=>{
    // const {projectId,teamMemberEmail} = req.body;
    //get username 
    const user = await checkIfEmailIsValid(teamMemberEmail);
    // if(!user) return res.status(400).send({message: `Invalid User Email`});
    if(!user) return 0;
    
    //check if user already exists
    const userExists = await checkIfuserExistsOnProject(projectId,user.username);
    // if(userExists) return res.status(400).send({message: 'This User Already Exits in this project'});
    if(userExists) return 0;

    //push to user working project list before adding member to a project

    try{
        await Project.findOneAndUpdate(
            {_id: projectId},
            {$push:{
                teamMembers: user.username
            }});
        // res.status(200).send({message: 'New member added to project'});
        return 1;
    }
    catch(err){
        // res.status(400).send('Something went wrong');
        return 0;
    }
};

//method to push to working project list
const pushToWorkingProject = async(projectId,userId)=>{
    try{
        await User.findOneAndUpdate(
            {_id: userId},
            {$push:{workingProjectList:projectId}
        });
        return 1;
    }
    catch(err){
        //verify this error
        return 0;
    }
    
};

//method to reject invitation
module.exports.rejectInvitation = async(req,res)=>{
    const {projectId} = req.body;

    const {_id} = req.user;

    try{
        await User.findOneAndUpdate(
            {_id},
            {$pull:{
                projectRequestList:{
                    _id: projectId
                }
            }});
        res.send({message: `Succesfully Rejected Project`});
        
    }
    catch(err){
        res.status(400).send('Something went wrong');
    }

};

//method to get working project list
module.exports.workingProjectList = async(req,res)=>{
    const {_id} = req.user;
    const workingProjectList = await User.findOne({_id}).select('workingProjectList');

    const workingProjects = await Project.find({_id: workingProjectList.workingProjectList}).select('name');
    res.send(workingProjects);
    // console.log(workingProjectList);
};

//method to create a project/board
module.exports.createProject = async(req,res)=>{
    const {_id} = req.user;
    const {projectName} = req.body;

    //get username
    const teamLeader = await User.findOne({_id}).select('username');

    //create project object
    const project = new Project();
    project.name = projectName;
    project.teamMembers = teamLeader.username;
    project.teamLeader = teamLeader.username;

    try{
        await project.save();
        await pushToWorkingProject(project.id,_id);
        res.status(200).send({message: 'New Project Created'});
    }
    catch(err){
        res.status(400).send('Something went wrong');
    }

};
//method to check if user already exits or not
const checkIfEmailIsValid = async(email)=>{
    const user = await User.findOne({email: email}).select('username');
    if(!user) return 0;
    return user;
};
//method to assign team member
const checkIfuserExistsOnProject = async(projectId,username)=>{
    const userCount = await Project.findOne({_id: projectId,teamMembers: {$in: [username]}}).count();
    return userCount;
};


//method to create title for the creaeted project
module.exports.createTitle = async(req,res)=>{
    const {projectId,titleName} = req.body;

    try{
        await Project.findOneAndUpdate(
            {_id: projectId},
            {
                $push: {
                    projectTitleList:{
                        name: titleName
                    }
                }
            });
        res.status(200).send({message: 'New Title Created'});
    }
    catch(err){
        res.status(400).send('Something went wrong');
    }
};

//method to delete title of a project
module.exports.deleteProjectTitle = async(req,res)=>{
    const {projectId,titleId} = req.body;

    try{
        await Project.findOneAndUpdate({_id: projectId},{
            $pull:{
                projectTitleList:{
                    _id: titleId
                }
            }
        });
        res.status(200).send({message: "Project Title Succesfully Deleted"});
    }
    catch(err){
        res.status(400).send({message: "Something went wrong"});
    }
};

//method to create content creaeted project title
module.exports.addContentToTitle = async(req,res)=>{
    const {projectId,titleId,titleContent} = req.body;
    //check if content exists or not
    const contentResult = await checkIsContentExists(projectId,titleId,titleContent);
    // console.log(checkResult);
    if(contentResult) return res.send({message: 'Unable to insert Content! already exists inside this title'});
    
    try{
        await pushContentIntoTitle(projectId,titleId,titleContent);
        res.status(200).send({message: 'Content Added To Title'});
        // res.send(result);
        // console.log(result);
    }
    catch(err){
        res.status(400).send('Something went wrong');
        // console.log(err);
    }
};

//method to check if content already exists under that title or not
const checkIsContentExists = async(projectId,titleId,titleContent)=>{
    //top check whether title content already in the array or not
    const result = await Project.findOne({_id: projectId,
        projectTitleList:
        {$elemMatch:
            {_id: titleId,
                contents: {$in: [titleContent]}}}}).count();
    return result;
};

//push content to new title
const pushContentIntoTitle = async(projectId,titleId,titleContent)=>{
    try{
        await Project.findOneAndUpdate(
            {"_id": projectId,"projectTitleList._id": titleId},{
                $push:{
                    "projectTitleList.$.contents": titleContent
                }
            });
    }
    catch(err){
        res.status(400).send({message: 'Push to new content failed'});
    }
};

//method to shift content of one title to another
module.exports.changeContentTitle = async(req,res)=>{
    const {projectId,previousTitleId,newTitleId,titleContent} = req.body;
    //first try to pull from current array
    const result = await removeContentFromTitle(previousTitleId,titleContent,projectId);
    // console.log(result);
    if(result != 1) return res.status(400).send({message: 'Failed to remove content, please try agian'});
    // res.send({message: result});

    try{
        await pushContentIntoTitle(projectId,newTitleId,titleContent);
        res.status(200).send({message: 'Succesfully added content into new title'});
    }
    catch(err){
        res.status(400).send({message: 'Something went wrong'});
    }
};

//method to pull from previous title
const removeContentFromTitle = async(titleId,titleContent,projectId)=>{
    try{
       //query to remove array item from previous title
        await Project.findOneAndUpdate(
            {"_id": projectId,"projectTitleList._id": titleId},{
                    $pull:{
                        "projectTitleList.$.contents": titleContent
                        
                    }
            });
        return 1;
    }
    catch(err){
        return err;
    }
};

//method to delete a project
module.exports.deleteProject = async(req,res)=>{
    const {projectId} = req.params;

    try{
        await Project.findByIdAndRemove({_id: projectId});
        res.status(200).send({message: "Project Succesfully Deleted"});
    }
    catch(err){
        res.status(400).send({message: "Something went wrong"});
    }
};


//to get total number of working projects
module.exports.getTotalProjectCount = async(req,res)=>{
    const {_id} = req.user;

    try{
        const totalProject = await getProjectList(_id);
        res.status(200).send({total: totalProject.workingProjectList.length});
    }
    catch(err){
        console.log(err);
        return res.status(400).send({message: 'Something went wrong'});
        
        // console.log(err);
    }
};

//to get list of if of projects
const getProjectList = async(userId)=>{
    const result = await User.findOne({_id: userId}).select('workingProjectList');
    return result;
};

//to get total number of project request
module.exports.getTotalProjectRequestCount = async(req,res)=>{
    const {_id} = req.user;


    try{
        const totalProject = await User.findOne({_id}).select('projectRequestList');
        res.send({total: totalProject.projectRequestList.length});
    }
    catch(err){
        console.log(err);
        return res.send({message: 'Something went wrong'});
        // console.log(err);
    }
};

//method to get project list
module.exports.getProjectNameList = async(req,res)=>{
    const workingProjectList = await getProjectList(req.user._id);

    try{
        const projectNameList = await Project.find({_id: workingProjectList.workingProjectList}).select('name');
        // console.log(projectDetails);
        res.send(projectNameList);
    }
    catch(err){
        res.status(400).send({message: 'Something went wrong'});
    }
};

//method to get full details of a project
module.exports.getProjectDetails = async(req,res)=>{
    const {projectId} = req.params;
    // console.log(projectId);
    const projectExists = await isProjectExists(projectId);
    if(!projectExists) return res.status(400).send({message: 'Something went wrong'});

    try{
        const projectDetails = await Project.findOne({_id:projectId}).select({'name': 1,'projectTitleList': 1});
        // console.log(projectDetails);
        res.send(projectDetails);
    }
    catch(err){
        res.status(400).send({message: 'Something went wrong'});
    }
};

//method to check if project exists or not
const isProjectExists = async(_id)=>{
    const result = await Project.findOne({_id});
    return result;
};

//method to get project title list
module.exports.getProjectTitleList = async(req,res)=>{
    const {projectId} = req.body;

    const projectTitleList = await Project.findOne({_id: projectId}).select({'projectTitleList.name':1,'projectTitleList._id':1});
    // console.log(projectTitleList);
    res.send(projectTitleList);
};




