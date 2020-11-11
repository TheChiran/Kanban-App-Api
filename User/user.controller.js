const User = require('./User.model');

//method to get user profile
module.exports.getProfile = async(req,res)=>{
    const {_id} = req.user;

    const user = await User.findOne({_id}).select('username');
    if(!user) return status(400).send('Access Denied');

    res.send(user);
}