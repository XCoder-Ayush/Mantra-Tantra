const express = require('express');
const userRouter = express.Router();
const UserController = require('../../../controllers/user.controller');
const upload = require('../../../middlewares/multer.middleware');
const AuthMiddleware = require('../../../middlewares/auth.middleware');
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
userRouter.route('/logout').post(AuthMiddleware, UserController.LogoutUser);
userRouter.route('/forgot-password').patch(UserController.ForgotPassword);

userRouter
  .route('/change-password')
  .patch(AuthMiddleware, UserController.ChangePassword);

// userRouter.patch(
//   '/change',
//   AuthMiddleware,
//   asyncHandler(UserController.ChangePassword)
// );
module.exports = userRouter;
