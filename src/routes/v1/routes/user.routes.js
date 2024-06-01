const express = require('express');
const userRouter = express.Router();
const UserController = require('../../../controllers/user.controller');
const upload = require('../../../middlewares/multer.middleware');
const AuthMiddleware = require('../../../middlewares/auth.middleware');

userRouter.route('/id/:userId').get(AuthMiddleware, UserController.GetUserById);

userRouter
  .route('/google/:googleId')
  .get(AuthMiddleware, UserController.GetUserByGoogleId);

userRouter
  .route('/verify-email')
  .post(UserController.SendVerificationLinkToUser);
userRouter
  .route('/verify-regtoken')
  .post(UserController.VerifyRegistrationToken);

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
userRouter.route('/logout').get(AuthMiddleware, UserController.LogoutUser);
userRouter.route('/forgot-password').patch(UserController.ForgotPassword);

userRouter
  .route('/change-password')
  .patch(AuthMiddleware, UserController.ChangePassword);

userRouter
  .route('/update')
  .patch(AuthMiddleware, UserController.UpdateUserDetails);

userRouter.route('/profile-picture').patch(
  AuthMiddleware,
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1,
    },
  ]),
  UserController.UploadProfilePicture
);

userRouter.route('/count').get(UserController.GetCountOfUsers);
userRouter
  .route('/stats/:userId')
  .get(AuthMiddleware, UserController.GetStatsOfUser);

userRouter.route('/invite').post(AuthMiddleware, UserController.InviteFriend);

userRouter
  .route('/performance/:userId')
  .get(AuthMiddleware, UserController.GetPerformanceOfUser);

module.exports = userRouter;
