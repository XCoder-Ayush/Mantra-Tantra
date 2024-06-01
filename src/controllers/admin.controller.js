const asyncHandler = require('../utils/asyncHandler.util');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');

const GetAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json(new ApiResponse(200, users));
  } catch (error) {
    throw new ApiError(500, 'Internal Server Error');
  }
});

const isLoggedIn = asyncHandler(async (req, res) => {
  console.log('In Here');
  console.log(req.session);

  if (!req.session.user) {
    // console.log('HERE');
    return res.redirect('/api/v1/login/failure');
  }
  // return res.status(200).json({ user: req.session.user.dataValues });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.session.user.dataValues,
        'Admin User Is Logged In.'
      )
    );
});

const LoginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'All fields are required');
  }

  const user = await User.findOne({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User does not exist');
  }

  if (!user.password) {
    throw new ApiError(401, 'You have not set a password. Set it manually.');
  }

  if (user.role != 'ADMIN') {
    throw new ApiError(401, 'Not Having Admin Privileges.');
  }

  console.log(user);

  if (user.password != password) {
    throw new ApiError(401, 'Invalid Admin Credentials.');
  }

  const excludeKeys = ['password', 'updatedAt'];

  const loggedInUser = Object.keys(user)
    .filter((key) => !excludeKeys.includes(key))
    .reduce((obj, key) => {
      obj[key] = user[key];
      return obj;
    }, {});

  req.session.user = loggedInUser;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        loggedInUser.dataValues,
        'Admin User Logged In Successfully'
      )
    );
});

const LogoutAdmin = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error Destroying Session : ', err);
      throw new ApiError(500, 'Internal Server Error');
    } else {
      res.clearCookie('connect.sid');
      res.clearCookie('accessToken');
      return res
        .status(200)
        .json(new ApiResponse(200, 'Admin Logged Out Succesfully.'));
    }
  });
});

module.exports = {
  GetAllUsers,
  LoginAdmin,
  isLoggedIn,
  LogoutAdmin,
};
