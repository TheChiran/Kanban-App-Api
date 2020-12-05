const express = require('express');
const router = express.Router();
const projectController = require('./project.controller');
const {verifyUser} = require('./../Middleware/verify.token');

//route for authentication
router.post('/invite',verifyUser,projectController.inviteProject);
router.get('/request/list',verifyUser,projectController.projectRequestList);
router.post('/accept',verifyUser,projectController.acceptInvitation);
router.post('/reject',verifyUser,projectController.rejectInvitation);
router.get('/working/list',verifyUser,projectController.workingProjectList);
router.post('/create',verifyUser,projectController.createProject);
router.post('/create/title',verifyUser,projectController.createTitle);
router.post('/add/content',verifyUser,projectController.addContentToTitle);
router.post('/change/content/title',verifyUser,projectController.changeContentTitle);
router.post('/delete/title',verifyUser,projectController.deleteProjectTitle);
router.delete('/delete/:projectId',verifyUser,projectController.deleteProject);
router.get('/count',verifyUser,projectController.getTotalWorkingProjectCount);
router.get('/count/request',verifyUser,projectController.getTotalProjectRequestCount);
router.get('/name/list',verifyUser,projectController.getProjectNameList);
router.get('/details/:projectId',verifyUser,projectController.getProjectDetails);
router.post('/title/list',verifyUser,projectController.getProjectTitleList);


module.exports = router;