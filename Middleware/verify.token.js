const jwt = require('jsonwebtoken');


module.exports.verifyUser = (req,res,next)=>{
    //get token
    const token = req.header('auth-token');
    if(!token) return res.sendStatus(400).send('Access Denied');

    try{
        const verified = jwt.verify(token,process.env.TOKEN_SECRECT);
        req.user = verified;
        next();
    }
    catch(err){
        res.status(400).send(`Access Denied`);
    }
}