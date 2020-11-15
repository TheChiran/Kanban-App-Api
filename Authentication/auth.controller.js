const User = require('./../User/User.model');
const {hashPassword,comparePassword} = require('./../Utility/hash.password');
const jwt = require('jsonwebtoken');
const {registerValidation,loginValidation} = require('./../Middleware/validate.data');

module.exports.register = async(req,res)=>{
    //destruct body objects
    const {username,email,password} = req.body;
    
    //validate user input
    const {error} = registerValidation(req.body);
    if(error) return res.status(400).send(error);

    //check if user exists or not
    const emailExists = await User.findOne({email});
    if(emailExists) return res.status(400).send(`Email address already in use`);

    //create new user
    const hashedPassword = await hashPassword(password);
    const user = new User();
    user.username = username;
    user.email = email;
    user.password = hashedPassword;
    try{
        await user.save();
        res.send({user: user._id});
    }
    catch(err){
        res.status(400).send(`Something went wrong`);
        // console.log(err);
    }
};

module.exports.login = async(req,res)=>{
    //validate user input
    const {error} = loginValidation(req.body);
    // if(error) console.log(error);
    if(error) return res.status(400).send(error);


    //destruct user inputs
    const {password,email} = req.body;
    // console.log(email);
    // console.log(password);
    
    //check if user exists
    
    const user = await User.findOne({email});
    if(!user) return res.status(400).send(`Invalid Credentials`);

    //check if password match
    const passwordMatched = await comparePassword(password,user.password);
    if(!passwordMatched) return res.status(400).send(`Invalid Credentials`);

    //{expiresIn: '900s'}
    //generate token
    const token = jwt.sign({_id: user._id},process.env.TOKEN_SECRECT);
    // console.log(token);
    // res.header('auth-token',token).send(token);
    res.send({accessToken:token});
};