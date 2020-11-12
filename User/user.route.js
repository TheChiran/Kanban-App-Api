const express = require('express');
const router = express.Router();

const {verifyUser} = require('./../Middleware/verify.token');

const userController = require('./user.controller');
//route for authentication
router.get('/profile',verifyUser,userController.getProfile);
router.get('/setting',verifyUser,userController.userSettings);
router.patch('/update/username',verifyUser,userController.updateUserName);
router.patch('/update/email',verifyUser,userController.updateUserEmail);
router.patch('/update/password',verifyUser,userController.updateUserPassword);
router.patch('/update/image',verifyUser,userController.updateUserImage);



module.exports = router;