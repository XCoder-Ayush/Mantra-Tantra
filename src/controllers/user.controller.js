const asyncHandler = require('../utils/asyncHandler.util');
const User = require('../models/user.model');
const uploadOnCloudinary = require('../utils/cloudinary.util');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');
const { Op } = require('sequelize');
const crypto = require('crypto');
const RegToken = require('../models/regtoken.model');
const sendEmail = require('../utils/nodemailer.util');
const cloudinary = require('../config/cloudinary.config');
const Mantralekhan = require('../models/mantralekhan.model');
const moment = require('moment-timezone');
const sequelize = require('sequelize');

const generateRandomRegistrationToken = () => {
  const buffer = crypto.randomBytes(32);
  const token = buffer.toString('hex');
  return token;
};

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

const GetUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({
      where: {
        id: userId,
      },
      attributes: {
        exclude: ['password'],
      },
    });
    return res.status(200).json(new ApiResponse(200, user));
  } catch (error) {
    throw new ApiError(500, 'Internal Server Error');
  }
});

const GetUserByGoogleId = asyncHandler(async (req, res) => {
  const { googleId } = req.params;
  try {
    const user = await User.findOne({
      where: {
        googleId: googleId,
      },
      attributes: {
        exclude: ['password'],
      },
    });
    return res.status(200).json(new ApiResponse(200, user));
  } catch (error) {
    throw new ApiError(500, 'Internal Server Error');
  }
});

const RegisterUser = asyncHandler(async (req, res) => {
  const { email, fullName, password, address, phone } = req.body;
  console.log('HERE');
  if (
    [email, fullName, password, address, phone].some(
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
  console.log(existedUser);
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
    throw new ApiError(500, 'Internal Server Error');
  }

  const user = await User.create({
    fullName,
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
  if (!user.password) {
    throw new ApiError(
      401,
      'You have not set a password. Try to sign in with Google.'
    );
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

const SignInWithGoogle = async (accessToken, refreshToken, profile, done) => {
  console.log(profile);
  try {
    const user = await User.findOne({
      where: {
        googleId: profile.id,
      },
    });
    console.log(accessToken);
    console.log(refreshToken);
    if (!user) {
      // 2 Cases :
      // Registered Manually
      const checkUser = await User.findOne({
        where: {
          email: profile.emails[0].value,
        },
      });
      if (checkUser) {
        // Already Registered Manually:
        const updatedUser = await checkUser.update({
          googleId: profile.id,
          fullName: profile.displayName,
          email: profile.emails[0].value,
        });
        return done(null, updatedUser);
      } else {
        // First Time Register
        // Sign Up With Google
        const password = generateRandomPassword();
        const createdUser = await User.create({
          googleId: profile.id,
          fullName: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          password: password,
        });

        console.log('New User Created ', createdUser);
        // Send Email:
        await sendEmail(
          profile.emails[0].value,
          'Mantra Tantra | New Password',
          `
            <p>This is your new password. Use this to login to the website.</p>
            <p>Password : <strong>${password}</strong></p>
          `
        );
        return done(null, createdUser);
      }
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
};

const GetCountOfUsers = asyncHandler(async (req, res) => {
  try {
    const count = await User.count();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { count },
          'Count of Users Retrieved Successfully.'
        )
      );
  } catch (error) {
    console.error('Error Fetching Count of Users:', error);
    throw new ApiError(500, 'Internal Server Error.');
  }
});

const InviteFriend = asyncHandler(async (req, res) => {
  const { id, name, email, comments } = req.body;

  if (!name || !email || !comments) {
    throw new ApiError(400, 'All fields are required.');
  }

  const user = await User.findOne({
    where: {
      id: id,
    },
  });

  const subject = 'MantraTantra | Invitation To Join Our Community';

  const htmlContent = `
    <p>Hi ${name},</p>
    <p>We'd like to invite you to join our community! Your friend has sent you this invitation. Here's what your friend has to say.</p>
    <p>"${comments}"</p>
    <p>Please click on the link below to join:</p>
    <p><a href="https://localhost.3000/login">Join Now</a></p>
    <p>Best Regards,</p>
    <p>${user.fullName}</p>
  `;
  try {
    await sendEmail(email, subject, htmlContent);
    return res
      .status(200)
      .json(new ApiResponse(200, 'Invitation Sent Successfully.'));
  } catch (error) {
    console.error('Error Sending Email : ', error);
    throw new ApiError(500, 'Internal Server Error.');
  }
});

const UploadProfilePicture = asyncHandler(async (req, res) => {
  try {
    const userId = req.body.id;
    const user = await User.findByPk(userId);

    const avatarLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
      throw new ApiError(400, 'Avatar file is required');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
      throw new ApiError(500, 'Internal Server Error');
    }
    console.log(avatar);

    const newProfilePictureUrl = avatar.url;

    const oldProfilePictureUrl = user.avatar;

    console.log('HERE ', oldProfilePictureUrl);

    const parsedUrl = new URL(oldProfilePictureUrl);

    if (!parsedUrl.hostname.includes('lh3.google')) {
      // Delete the old profile picture from Cloudinary
      if (oldProfilePictureUrl) {
        const publicId = getPublicIdFromUrl(oldProfilePictureUrl);
        console.log(publicId);
        const resp = await cloudinary.api.delete_resources([`${publicId}`], {
          type: 'upload',
          resource_type: 'image',
        });

        console.log(resp);
      }
    }

    // Update user's profile picture URL with the new one
    user.avatar = newProfilePictureUrl;
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, 'Profile Picture Updated Successfully.'));
  } catch (error) {
    console.error('Error Updating Profile Picture : ', error);
    throw new ApiError(500, 'Internal Server Error.');
  }
});

const getPublicIdFromUrl = (url) => {
  // Example Cloudinary URL format: http://res.cloudinary.com/dgfljm0r3/image/upload/v1715449194/eexfoew5zppq4w7xenwy.png
  const parts = url.split('/');
  const publicIdIndex = parts.indexOf('upload') + 2;
  let publicId = parts[publicIdIndex];
  publicId = publicId.split('.')[0];
  return publicId;
};

const UpdateUserDetails = asyncHandler(async (req, res) => {
  const { id, address, niyam, phone } = req.body;

  if (niyam < 0) {
    throw new ApiError(
      400,
      'Niyam value should be greater than or equal to 0.'
    );
  }

  if (phone && !/^\d{10}$/.test(phone)) {
    throw new ApiError(400, 'Phone number should be 10 digits or empty.');
  }

  try {
    const user = await User.findByPk(id);

    if (!user) {
      throw new ApiError(404, 'User not found.');
    }
    user.address = address;
    user.niyam = niyam;
    user.phone = phone;
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, 'User Details Updated Successfully.'));
  } catch (error) {
    console.error('Error Updating User Details : ', error);
    throw new ApiError(500, 'Internal Server Error.');
  }
});

const GetStatsOfUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    // Get the start of the current month and the previous month
    const currentMonthStart = moment().startOf('month');
    const previousMonthStart = moment(currentMonthStart)
      .subtract(1, 'month')
      .startOf('month');

    // Get the end of the current month and the previous month
    const currentMonthEnd = moment().endOf('day');
    const previousMonthEnd = moment(currentMonthStart)
      .subtract(1, 'day')
      .endOf('day');

    // Generate series of dates for the current month and the previous month
    const currentMonthDates = sequelize.literal(
      `generate_series('${currentMonthStart.toISOString()}'::date, '${currentMonthEnd.toISOString()}'::date, '1 day'::interval)`
    );
    const previousMonthDates = sequelize.literal(
      `generate_series('${previousMonthStart.toISOString()}'::date, '${previousMonthEnd.toISOString()}'::date, '1 day'::interval)`
    );
    console.log(currentMonthDates);
    console.log(previousMonthDates);

    // Retrieve day-wise mantralekhan data for the current month
    const currentMonthMantralekhan = await Mantralekhan.findAll({
      attributes: [
        [sequelize.fn('date_trunc', 'day', sequelize.col('date')), 'date'],
        [
          sequelize.fn(
            'COALESCE',
            sequelize.fn('SUM', sequelize.col('count')),
            0
          ),
          'mantraCount',
        ],
      ],
      where: {
        userId,
        date: {
          [Op.between]: [currentMonthStart, currentMonthEnd],
        },
      },
      group: sequelize.fn('date_trunc', 'day', sequelize.col('date')),
      right: true,
      rightTable: currentMonthDates,
    });

    const currentDateNumber = currentMonthEnd.date();

    let currentMonthMantralekhanDto = [];

    for (let date = 1; date <= currentDateNumber; date++) {
      let mantraCount = 0;
      currentMonthMantralekhan.forEach((mantraLekhan) => {
        const mantraDate = moment(mantraLekhan.dataValues.date);
        const currentDateNumber = mantraDate.date();
        if (date === currentDateNumber) {
          mantraCount = mantraLekhan.dataValues.mantraCount;
          return;
        }
      });
      currentMonthMantralekhanDto.push({
        date: date,
        mantraCount: Number(mantraCount),
      });
    }

    // Retrieve day-wise mantralekhan data for the previous month
    const previousMonthMantralekhan = await Mantralekhan.findAll({
      attributes: [
        [sequelize.fn('date_trunc', 'day', sequelize.col('date')), 'date'],
        [
          sequelize.fn(
            'COALESCE',
            sequelize.fn('SUM', sequelize.col('count')),
            0
          ),
          'mantraCount',
        ],
      ],
      where: {
        userId,
        date: {
          [Op.between]: [previousMonthStart, previousMonthEnd],
        },
      },
      group: sequelize.fn('date_trunc', 'day', sequelize.col('date')),
      right: true,
      rightTable: previousMonthDates,
    });

    let previousMonthMantralekhanDto = [];

    const previousDateNumber = previousMonthEnd.date();

    for (let date = 1; date <= previousDateNumber; date++) {
      let mantraCount = 0;
      previousMonthMantralekhan.forEach((mantraLekhan) => {
        const mantraDate = moment(mantraLekhan.dataValues.date);
        const currentDateNumber = mantraDate.date();
        if (date === currentDateNumber) {
          mantraCount = mantraLekhan.dataValues.mantraCount;
          return;
        }
      });
      previousMonthMantralekhanDto.push({
        date: date,
        mantraCount: Number(mantraCount),
      });
    }

    return res.status(200).json(
      new ApiResponse(200, {
        currentMonthMantralekhanDto,
        previousMonthMantralekhanDto,
      })
    );
  } catch (error) {
    console.error('Error retrieving user stats:', error);
    throw new ApiError(500, 'Internal Server Error.');
  }
});

const GetPerformanceOfUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);

    const currentDayStart = moment().startOf('day');
    const currentDayEnd = moment().endOf('day');

    const todayMantralekhan = await Mantralekhan.findOne({
      attributes: [
        [sequelize.fn('date_trunc', 'day', sequelize.col('date')), 'date'],
        [
          sequelize.fn(
            'COALESCE',
            sequelize.fn('SUM', sequelize.col('count')),
            0
          ),
          'mantraCount',
        ],
      ],
      where: {
        userId,
        date: {
          [Op.between]: [currentDayStart.toDate(), currentDayEnd.toDate()],
        },
      },
      group: sequelize.fn('date_trunc', 'day', sequelize.col('date')),
    });

    const weekStart = moment().startOf('week');

    const weeklyMantralekhan = await Mantralekhan.findOne({
      attributes: [
        [
          sequelize.fn(
            'COALESCE',
            sequelize.fn('SUM', sequelize.col('count')),
            0
          ),
          'weeklyMantraCount',
        ],
      ],
      where: {
        userId,
        date: {
          [Op.between]: [weekStart.toDate(), currentDayEnd.toDate()],
        },
      },
    });

    const totalMantralekhan = await Mantralekhan.findOne({
      attributes: [
        [
          sequelize.fn(
            'COALESCE',
            sequelize.fn('SUM', sequelize.col('count')),
            0
          ),
          'totalMantraCount',
        ],
      ],
      where: {
        userId,
      },
    });

    const performanceDto = {
      fullName: user.fullName,
      todayMantralekhan: todayMantralekhan
        ? Number(todayMantralekhan.dataValues.mantraCount)
        : 0,
      weekMantralekhan: weeklyMantralekhan
        ? Number(weeklyMantralekhan.dataValues.weeklyMantraCount)
        : 0,
      totalMantralekhan: totalMantralekhan
        ? Number(totalMantralekhan.dataValues.totalMantraCount)
        : 0,
    };

    return res.status(200).json(new ApiResponse(200, performanceDto));
  } catch (error) {
    console.error('Error Fetching User Performance.', error);
    throw new ApiError(500, 'Internal Server Error.');
  }
});

const LoginFailure = asyncHandler(async (req, res) => {
  return res.status(401).json(new ApiResponse(401, 'Login Failed.'));
});

const isLoggedIn = asyncHandler(async (req, res) => {
  console.log(req.user);

  if (!req.user) {
    return res.redirect('/api/v1/login/failure');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'User Is Logged In.'));
});

const LogoutUser = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error Destroying Session : ', err);
      throw new ApiError(500, 'Internal Server Error');
    } else {
      res.clearCookie('connect.sid');
      res.clearCookie('accessToken');
      return res
        .status(200)
        .json(new ApiResponse(200, 'User Logged Out Succesfully.'));
    }
  });
});

module.exports = {
  GetUserById,
  GetUserByGoogleId,
  RegisterUser,
  LoginUser,
  LogoutUser,
  SendVerificationLinkToUser,
  VerifyRegistrationToken,
  ForgotPassword,
  ChangePassword,
  SignInWithGoogle,
  GetCountOfUsers,
  InviteFriend,
  UploadProfilePicture,
  UpdateUserDetails,
  GetStatsOfUser,
  GetPerformanceOfUser,
  LoginFailure,
  isLoggedIn,
};
