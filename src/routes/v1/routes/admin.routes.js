const express = require('express');
const AdminMiddleware = require('../../../middlewares/admin.middleware');
const adminRouter = express.Router();
const AdminController = require('../../../controllers/admin.controller');

adminRouter.route('/users').get(AdminMiddleware, AdminController.GetAllUsers);
adminRouter.route('/login').post(AdminController.LoginAdmin);
adminRouter.route('/login/success').get(AdminController.isLoggedIn);
adminRouter.route('/logout').get(AdminController.LogoutAdmin);

module.exports = adminRouter;
