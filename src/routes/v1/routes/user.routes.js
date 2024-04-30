const express = require('express');
const userRouter = express.Router();
const UserController = require('../../../controllers/user.controller');
const upload = require('../../../middlewares/multer.middleware');
const AuthMiddleware = require('../../../middlewares/auth.middleware');

userRouter.route('/register').post(
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1,
    },
  ]),
  UserController.RegisterUser
);

userRouter.route('/login').post(UserController.LoginUser);
userRouter.route('/logout').post(AuthMiddleware, UserController.LogoutUser);

module.exports = userRouter;
