const ApiError = require('../utils/apiError.util.js');
const asyncHandler = require('../utils/asyncHandler.util.js');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

const AuthMiddleware = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    // console.log(token);

    if (!token) {
      throw new ApiError(401, 'Unauthorized request!');
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

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
