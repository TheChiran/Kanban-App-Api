const User = require('./User.model');
const bcrypt = require('bcryptjs');
const { comparePassword, hashPassword } = require('../Utility/hash.password');
//method to get user profile
module.exports.getProfile = async(req,res)=>{
    const {_id} = req.user;
    const user = await getUser(_id);
    if(!user) return res.status(400).send('Access Denied');

    res.send({_id: user._id,user: user.username});
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
        res.send({message: 'Username changed succesfully'});
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
        res.send({message: 'Email changed succesfully'});
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
    if(!comparePreviousPassword) return res.status(400).send({message: 'Please enter previous password correctly'});

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;

    try{
        await user.save();
        res.send({message: 'Password changed succesfully'});
    }
    catch(err){
        res.status(400).send({message: 'Something went wrong'});
    }
};

//method to change user image
module.exports.updateUserImage = async(req,res)=>{

};