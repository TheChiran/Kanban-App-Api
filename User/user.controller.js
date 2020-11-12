const User = require('./User.model');

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