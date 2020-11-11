const express = require('express');
const router = express.Router();
const {register,login} = require('./auth.controller');

//route for authentication
router.post('/sign-up',register);
router.post('/sign-in',login);

module.exports = router;