const ApiError = require('../utils/apiError.util.js');
const asyncHandler = require('../utils/asyncHandler.util.js');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

const AuthMiddleware = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.body.id;
    if (!userId) userId = req.body.userId;

    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    console.log(
      'Cookies Here***********************************************************************'
    );
    console.log(req.cookies);
    console.log(req.user);
    console.log(req.session);

    if (req.user) {
      console.log('Session Validated With connect.sid Parameter.');
      return next();
    }

    if (!token) {
      throw new ApiError(401, 'Unauthorized request!');
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // if (decodedToken.id != userId) {
    //   throw new ApiError(401, 'Unauthorized request!');
    // }

    const user = await User.findOne({
      where: {
        id: decodedToken.id,
      },
      attributes: {
        exclude: ['password'],
      },
    });

    if (!user) {
      throw new ApiError(401, 'Invalid Access Token!');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid Access Token!');
  }
});

module.exports = AuthMiddleware;
