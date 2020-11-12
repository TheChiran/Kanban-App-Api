const express = require('express');
const router = express.Router();

const {verifyUser} = require('./../Middleware/verify.token');

const userController = require('./user.controller');
//route for authentication
router.get('/profile',verifyUser,userController.getProfile);
router.get('/setting',verifyUser,userController.userSettings);


module.exports = router;