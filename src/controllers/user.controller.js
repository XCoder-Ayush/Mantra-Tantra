const asyncHandler = require('../utils/asyncHandler.util');
const UserService = require('../services/user.service');
const User = require('../models/user.model');
const uploadOnCloudinary = require('../utils/cloudinary.util');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');
const { Op } = require('sequelize');
const crypto = require('crypto');
const RegToken = require('../models/regtoken.model');
const sendEmail = require('../utils/nodemailer.util');

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

function generateRandomRegistrationToken() {
  const buffer = crypto.randomBytes(32);
  const token = buffer.toString('hex');
  return token;
}

const SendVerificationLinkToUser = asyncHandler(async (req, res) => {
  const email = req.body.email;

  // Case 1: Empty Email
  if (!email) {
    throw new ApiError(400, 'Email address is required.');
  }

  // Case 2: Invalid Format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Invalid email address format.');
  }

  // Case 3: Length
  if (email.length > 320) {
    throw new ApiError(400, 'Email address is too long.');
  }

  // Proceed With Verification
  // Generate Token:
  const token = generateRandomRegistrationToken();

  // verificationLink contains frontend route:
  const FrontendDomain = `http://localhost:3000`;
  const verificationLink = `${FrontendDomain}/verify?token=${token}`;

  console.log(verificationLink);

  // Make an entry in Postgres:
  // Or can i keep it in memory?

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  // Create entry in the database
  try {
    await RegToken.create({
      regToken: token,
      email: email,
      expiresAt: expiresAt,
    });
  } catch (error) {
    // Handle database insertion error
    console.error('Error Creating Registration Token : ', error);
    throw new ApiError(500, 'Internal Server Error');
  }

  // Use nodemailer util to send mail to this email.
  await sendEmail(
    email,
    'Mantra Tantra | Verification Link',
    `
    <p>Please click the following link to verify your email:</p>
    <p><a href="${verificationLink}">${verificationLink}</a></p>
    `
  );

  return res
    .status(200)
    .json(new ApiResponse(200, 'Verification Link Sent Successfully.'));
});

const VerifyRegistrationToken = asyncHandler(async (req, res) => {
  // When user clicks on emailed link, directed to the frontend page:
  // From there the token is obtained and this api is hit:

  const token = req.query.token;
  console.log(token);

  if (!token || token == null || token == undefined) {
    throw new ApiError(403, 'Invalid Registration Token.');
  }

  // Verify From DB:
  const regToken = await RegToken.findOne({
    where: {
      regToken: token,
    },
  });

  if (regToken) {
    // Check For Its Validity:
    const currentTime = new Date();
    if (regToken.expiresAt <= currentTime) {
      throw new ApiError(403, 'Registration Token Expired.');
    }
  } else {
    throw new ApiError(403, 'No Registration Token Found.');
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, regToken.email, 'Email Verification Successfull.')
    );
});

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
      exclude: ['password', 'updatedAt'],
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
function generateRandomPassword() {
  const length = Math.floor(Math.random() * (16 - 8 + 1)) + 8; // Random length between 8 and 16
  const characters =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }
  return password;
}

const ForgotPassword = asyncHandler(async (req, res) => {
  // This functionality can only be accessed when user is logged out.
  const email = req.body.email;

  // Case 1: Empty Email
  if (!email) {
    throw new ApiError(400, 'Email address is required.');
  }

  // Case 2: Invalid Format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Invalid email address format.');
  }

  // Case 3: Length
  if (email.length > 320) {
    throw new ApiError(400, 'Email address is too long.');
  }

  // Check if any user with this email exists or not
  const user = await User.findOne({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new ApiError(400, 'User does not exist.');
  }

  const password = generateRandomPassword();

  //Update in DB
  const updatedUser = await user.update({
    password: password,
  });

  // Send Email:
  await sendEmail(
    email,
    'Mantra Tantra | New Password',
    `
    <p>This is your new password. Use this to login to the website.</p>
    <p>Password : <strong>${password}</strong></p>
    `
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, 'Updated Password Sent To Mail Successfully.')
    );
});

const ChangePassword = asyncHandler(async (req, res) => {
  // This functionality can only be accessed when user is logged in.
  // User needs to know his old password. Else avail forgot password functionality
  const email = req.body.email;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  if (
    oldPassword == '' ||
    newPassword == '' ||
    oldPassword == undefined ||
    newPassword == undefined ||
    !oldPassword ||
    !newPassword
  ) {
    throw new ApiError(400, 'Enter valid credentials');
  }
  // Password okay, check email.
  if (!email) {
    throw new ApiError(400, 'Email address is required.');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Invalid email address format.');
  }
  if (email.length > 320) {
    throw new ApiError(400, 'Email address is too long.');
  }
  const user = await User.findOne({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new ApiError(400, 'User does not exist.');
  }

  // Both okay.
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Old passwords does not match.');
  }

  await user.update(
    { password: newPassword } // New password
  );

  const updatedUser = await User.findOne({
    where: {
      email: email,
    },
    attributes: {
      exclude: ['password', 'updatedAt'],
    },
  });
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: updatedUser,
      },
      'Password updated successfully.'
    )
  );
});
module.exports = {
  RegisterUser,
  LoginUser,
  LogoutUser,
  SendVerificationLinkToUser,
  VerifyRegistrationToken,
  ForgotPassword,
  ChangePassword,
};
