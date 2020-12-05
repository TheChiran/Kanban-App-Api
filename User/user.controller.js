const User = require('./User.model');
const { comparePassword, hashPassword } = require('../Utility/hash.password');
const nodeMailer = require('nodemailer');

//method to get user profile
module.exports.getProfile = async(req,res)=>{
    const {_id} = req.user;
    const user = await getUser(_id);
    if(!user) return res.status(400).send({message: `Access Denied`});

    res.send({_id: user._id,user: user.username});
};
//method to get user name
module.exports.getUserName = async(req,res)=>{
    const {_id} = req.user;
    const user = await getUser(_id);
    if(!user) return res.status(400).send({message: `Access Denied`});

    res.send({user: user.username});
};
//method to get user data
const getUser = async(_id)=>{
    const user = await User.findOne({_id});
    if(!user) return 0;
    return user;
};

//method to get user full information
module.exports.userSettings = async(req,res)=>{
    const {_id} = req.user;

    const user = await getUser(_id);
    if(!user) return res.status(400).send({message: 'Access Denied'});

    res.send({_id:user._id,username: user.username,email: user.email});
};

//method to update username
module.exports.updateUserName = async(req,res)=>{
    const {_id} = req.user;

    const user = await getUser(_id);
    user.username = req.body.username;

    try{
        await user.save();
        res.status(200).send({message: 'Username changed succesfully'});
    }
    catch(err){
        res.status(400).send({message: 'Something went wrong'});
    }
};

//method to update user email
module.exports.updateUserEmail = async(req,res)=>{
    const {_id} = req.user;

    const user = await getUser(_id);
    user.email = req.body.email;

    try{
        await user.save();
        res.status(200).send({message: 'Email changed succesfully'});
    }
    catch(err){
        res.status(400).send({message: 'Something went wrong'});
    }
};

//method to update user password
module.exports.updateUserPassword = async(req,res)=>{
    const {_id} = req.user;
    const {oldPassword,newPassword} = req.body; 
    const user = await getUser(_id);

    const comparePreviousPassword = await comparePassword(oldPassword,user.password);
    if(!comparePreviousPassword) 
        return res.status(200).send({message: `Previous password didn't matched, please enter previous password correctly!`,status: 204});

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;

    try{
        await user.save();
        res.status(200).send({message: 'Password changed succesfully'});
    }
    catch(err){
        res.status(400).send({message: 'Something went wrong'});
    }
};

//method to change user image
module.exports.updateUserImage = async(req,res)=>{

};

//method to request password verification
module.exports.requestResetToken = async(req,res)=>{
    const {email} = req.body;
    // console.log(email);
    //check if useremail exists
    const isEmailValid = await User.find({email}).count();
    if(!isEmailValid) return res.status(400).send({message: `Invalid UserName`});

    const token = Math.floor(Math.random()*(1000000-0)+0);

    const isMailSent = await sendMail(token,email);
    if(isMailSent == 0) return res.status(400).send({message: 'unable to send message'});

    try{
        res.status(200).send({verificationCode: token,userEmail: email});
    }
    catch(error){
        res.status(400).send({message: 'There was some problem'});
    }
};
//method to send verification token wiht email
const sendMail = async(token,userEmail)=>{
    const transporter = await nodeMailer.createTransport({
        service: 'gmail',
        auth:{
            user: 'kanbanboard.info@gmail.com',
            pass: 'Kanban%$#@!'
        }
    });

    const mailOptions = {
        from: 'kanbanboard.info@gmail.com',
        to: userEmail,
        subject: 'Password reset',
        text: `Please use this code to reset your password: ${token}`
    };

    await transporter.sendMail(mailOptions,function(error,info){
        if(error){
            return 0;
        }else{
            return 1;
        }
    });
};
//method to reset user password
module.exports.resetPassword = async(req,res)=>{
    const {userEmail,newPassword} = req.body;
    // console.log(userEmail);
    //check if useremail exists
    const user = await User.findOne({email: userEmail});
    // console.log(user);
    if(!user) return res.status(404);
    //hash new password
    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;

    try{
        await user.save();
        res.status(200).send({message: 'Succesfully updated password'});
    }
    catch(error){
        res.status(400);
    }

};