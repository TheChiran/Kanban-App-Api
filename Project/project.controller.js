const User = require('./../User/User.model');
const Project = require('./Project.model');

module.exports.inviteProject = async(req,res)=>{
    const {recieverEmail,projectName} = req.body;
    const {_id} = req.user;
    
    //get user mail
    const senderEmail = await User.findOne({_id}).select('email');
    if(!senderEmail) return res.status(400).send(`invalid Credentials`);

    //check if reciever user exists or not
    const receiver = await User.findOne({email: recieverEmail});
    if(!receiver) return res.status(400).send(`Invalid User Email`);

    // receiver.projectRequestList.invitedBy = senderEmail;
    // receiver.projectRequestListprojectName = projectName;

    try{
        await User.findOneAndUpdate(
            {email: recieverEmail},
            {$push:{
                projectRequestList:{
                    invitedBy: senderEmail.email, 
                    projectName: projectName
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
    
    const result = await pushToWorkingProject(projectId,_id);
    if(result != 200) return res.send(400).send('Something went wrong');

    try{
        await User.findOneAndUpdate(
            {_id},
            {$pull:{
                projectRequestList:{
                    _id: projectId
                }
            }});
        res.send({message: `Succesfully updated`});
        
    }
    catch(err){
        res.status(400).send('Something went wrong');
    }

};

//method to push to working project list
const pushToWorkingProject = async(projectId,userId)=>{
    await User.findOneAndUpdate(
        {_id: userId},
        {$push:{workingProjectList:projectId}
    });
    
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
    res.send(workingProjectList.workingProjectList);
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

//push team member to project
module.exports.addTeamMember = async(req,res)=>{
    const {projectId,teamMemberEmail} = req.body;
    //get username 
    const user = await User.findOne({email: teamMemberEmail}).select('username');
    if(!user) return res.status(400).send(`Invalid User Email`);
    
    //check if user already exists
    const userExists = await Project.findOne({_id: projectId,teamMembers: {$in: [user.username]}}).count();
    if(userExists) return res.status(400).send(`This User Already Exits in this project`);

    try{
        await Project.findOneAndUpdate(
            {_id: projectId},
            {$push:{
                teamMembers: user.username
            }});
        res.status(200).send({message: 'New member added to project'});
    }
    catch(err){
        res.status(400).send('Something went wrong');
    }
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

//method to create content creaeted project title
module.exports.addContentToTitle = async(req,res)=>{
    const {projectId,titleId,titleContent} = req.body;
    //check if content exists or not
    const contentResult = await checkIsContentExists(projectId,titleId,titleContent);
    // console.log(checkResult);
    if(contentResult) return res.status(400).send({message: 'Content already exists inside this title'});
    
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
    const {projectId} = req.body;

    try{
        await Project.findByIdAndRemove({_id: projectId});
        res.status(200).send({message: "Project Succesfully Deleted"});
    }
    catch(err){
        res.status(400).send({message: "Something went wrong"});
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

//to get total number of working projects
module.exports.getTotalProjectCount = async(req,res)=>{
    const {_id} = req.user;

    try{
        const totalProject = await getProjectList(_id);
        return res.status(200).send({total: totalProject.workingProjectList.length});
    }
    catch(err){
        res.status(400).send({message: 'Something went wrong'});
        console.log(err);
    }
};

//to get list of if of projects
const getProjectList = async(userId)=>{
    const result = await User.findOne({_id: userId}).select('workingProjectList');
    return result;
}

//to get total number of project request
module.exports.getTotalProjectRequestCount = async(req,res)=>{
    const {_id} = req.user;

    try{
        const totalProject = await User.findOne({_id}).select('projectRequestList');
        return res.status(200).send({total: totalProject.projectRequestList.length});
    }
    catch(err){
        res.status(400).send({message: 'Something went wrong'});
        console.log(err);
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
        const projectDetails = await Project.findOne({_id:projectId});
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
}



