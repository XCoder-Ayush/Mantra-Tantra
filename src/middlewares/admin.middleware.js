const ApiError = require('../utils/apiError.util.js');
const asyncHandler = require('../utils/asyncHandler.util.js');
const User = require('../models/user.model.js');

const AdminMiddleware = asyncHandler(async (req, res, next) => {
    
  console.log('In Admin Middleware');
  console.log(req.cookies);
  console.log(req.session.user);

  if (req.session.user) {
    if (req.session.user.dataValues.role == 'ADMIN') {
      return next();
    }
    throw new ApiError(401, 'User Does Not Have Admin Privileges.');
  } else {
    throw new ApiError(401, 'User Not Authenticated. Please Sign In.');
  }
});

module.exports = AdminMiddleware;
