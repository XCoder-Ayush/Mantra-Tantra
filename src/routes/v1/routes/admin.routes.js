const express = require('express');
const AdminMiddleware = require('../../../middlewares/admin.middleware');
const adminRouter = express.Router();
const AdminController = require('../../../controllers/admin.controller');

adminRouter.route('/users').get(AdminMiddleware, AdminController.GetAllUsers);
adminRouter.route('/login').post(AdminController.LoginAdmin);

module.exports = adminRouter;
