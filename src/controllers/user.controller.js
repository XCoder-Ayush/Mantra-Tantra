const asyncHandler = require('../utils/asyncHandler.util');
const UserService = require('../services/user.service');
const User = require('../models/user.model');
const uploadOnCloudinary = require('../utils/cloudinary.util');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');
const { Op } = require('sequelize');

const generateAccessToken = async (userId) => {
  try {
    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

    const accessToken = await user.generateAccessToken();

    // console.log(accessToken);

    await user.save({ validateBeforeSave: false });

    return accessToken;
  } catch (error) {
    throw new ApiError(
      500,
      'Something went wrong while generating access token'
    );
  }
};

const RegisterUser = asyncHandler(async (req, res) => {
  const { email, firstName, lastName, password, address, phone } = req.body;

  if (
    [email, firstName, lastName, password, address, phone].some(
      (field) => field?.trim() === ''
    )
  ) {
    throw new ApiError(400, 'All fields are required');
  }

  const existedUser = await User.findOne({
    where: {
      [Op.or]: [{ phone: phone }, { email: email }],
    },
  });

  if (existedUser) {
    throw new ApiError(409, 'User with email or phone number already exists');
  }

  //console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is required');
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, 'Avatar file is required');
  }

  const user = await User.create({
    firstName,
    lastName,
    avatar: avatar.url,
    email,
    password,
    address,
    phone,
  });

  const createdUser = await User.findOne({
    where: {
      id: user.id,
    },
    attributes: {
      exclude: ['password'],
    },
  });

  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering the user');
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, 'User registered successfully'));
});

const LoginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email);

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
  console.log(user);

  const isPasswordValid = await user.isPasswordCorrect(password);

  console.log(isPasswordValid);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid user credentials');
  }

  const accessToken = await generateAccessToken(user.id);

  const loggedInUser = await User.findOne({
    where: {
      id: user.id,
    },
    attributes: {
      exclude: ['password'],
    },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
        },
        'User logged in successfully'
      )
    );
});

const LogoutUser = asyncHandler(async (req, res) => {
  // Task Is Only To Remove Access Token Cookie From Client:
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .json(new ApiResponse(200, {}, 'User Logged Out'));
});

module.exports = { RegisterUser, LoginUser, LogoutUser };
