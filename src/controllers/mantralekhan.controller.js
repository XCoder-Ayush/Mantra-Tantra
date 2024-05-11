const asyncHandler = require('../utils/asyncHandler.util');
const User = require('../models/user.model');
const Mantralekhan = require('../models/mantralekhan.model');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const moment = require('moment-timezone');

const PostMantralekhan = asyncHandler(async (req, res) => {
  const userId = req.body.id;
  console.log(userId);
  // Set the timezone to India (IST)
  const currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
  console.log(currentDate); // Output: '2024-05-05'

  try {
    const mantralekhanEntry = await Mantralekhan.findOne({
      where: { userId: userId, date: currentDate },
    });

    const user = await User.findOne({
      where: { id: userId },
    });

    if (!mantralekhanEntry) {
      // If no entry exists, create a new entry with count=1
      await Mantralekhan.create({
        userId: userId,
        date: currentDate,
        count: 1,
      });
      await user.increment('mantraChanted', { by: 1 });

      return res
        .status(200)
        .json(new ApiResponse(200, 'Mantralekhan Added Successfully.'));
    } else {
      // If an entry exists, increment the count by 1
      await mantralekhanEntry.increment('count', { by: 1 });

      await user.increment('mantraChanted', { by: 1 });

      return res
        .status(200)
        .json(new ApiResponse(200, 'Mantralekhan Added Successfully.'));
    }
  } catch (error) {
    console.error('Error Processing Mantralekhan:', error);
    throw new ApiError(500, 'Internal Server Error.');
  }
});
const GetTopUsersToday = asyncHandler(async (req, res) => {
  const currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
  try {
    const topUsers = await Mantralekhan.findAll({
      attributes: ['userId', [Sequelize.literal('SUM("count")'), 'totalCount']],
      where: {
        date: {
          [Op.gte]: currentDate,
        },
      },
      group: ['userId'],
      order: [[Sequelize.literal('SUM("count")'), 'DESC']], // Order by the sum of count in descending order
      limit: 100, // Limit the result to 100 rows
    });

    // Here userId and totalCount is obtained. We need to add userProfilePic, user full name, member since.
    let topUsersDto = [];

    const promises = topUsers.map(async (topUser) => {
      const user = await User.findByPk(topUser.userId);

      topUsersDto.push({
        totalCount: topUser.dataValues.totalCount,
        fullName: user.fullName,
        avatar: user.avatar,
        memberSince: user.createdAt.toISOString().split('T')[0],
      });
    });

    await Promise.all(promises);

    // Sort by descending order count.
    topUsersDto.sort((a, b) => b.totalCount - a.totalCount);

    return res.status(200).json(new ApiResponse(200, topUsersDto));
  } catch (error) {
    console.error('Error Retrieving Top Users Of This Month.', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
const GetTopUsersAllTime = asyncHandler(async (req, res) => {
  try {
    const topUsers = await Mantralekhan.findAll({
      attributes: ['userId', [Sequelize.literal('SUM("count")'), 'totalCount']],
      group: ['userId'],
      order: [[Sequelize.literal('SUM("count")'), 'DESC']], // Order by the sum of count in descending order
      limit: 100, // Limit the result to 100 rows
    });

    // Here userId and totalCount is obtained. We need to add userProfilePic, user full name, member since.
    let topUsersDto = [];

    const promises = topUsers.map(async (topUser) => {
      const user = await User.findByPk(topUser.userId);

      topUsersDto.push({
        totalCount: topUser.dataValues.totalCount,
        fullName: user.fullName,
        avatar: user.avatar,
        memberSince: user.createdAt.toISOString().split('T')[0],
      });
    });

    await Promise.all(promises);

    // Sort by descending order count.
    topUsersDto.sort((a, b) => b.totalCount - a.totalCount);

    return res.status(200).json(new ApiResponse(200, topUsersDto));
  } catch (error) {
    console.error('Error Retrieving Top Users Of This Year.', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

const GetTopUsersThisWeek = asyncHandler(async (req, res) => {
  const currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
  console.log(currentDate);

  // Calculate the starting day of the week (Sunday)
  const startingDayOfWeek = new Date(currentDate);
  startingDayOfWeek.setDate(
    startingDayOfWeek.getDate() - startingDayOfWeek.getDay()
  );

  let startingDayOfWeekDate = startingDayOfWeek.toISOString().split('T')[0];
  console.log(startingDayOfWeekDate);

  //   const hardCoded = new Date(2024, 3, 28);
  //   const hardCodedDate = hardCoded.toISOString().split('T')[0];

  //   startingDayOfWeekDate = hardCodedDate;

  try {
    // Retrieve all Mantralekhan entries where the date is >= startingDayOfWeekDate
    const topUsers = await Mantralekhan.findAll({
      attributes: ['userId', [Sequelize.literal('SUM("count")'), 'totalCount']],
      where: {
        date: {
          [Op.gte]: startingDayOfWeekDate,
        },
      },
      group: ['userId'],
      order: [[Sequelize.literal('SUM("count")'), 'DESC']], // Order by the sum of count in descending order
      limit: 100, // Limit the result to 100 rows
    });

    // Here userId and totalCount is obtained. We need to add userProfilePic, user full name, member since.
    let topUsersDto = [];

    const promises = topUsers.map(async (topUser) => {
      const user = await User.findByPk(topUser.userId);

      topUsersDto.push({
        totalCount: topUser.dataValues.totalCount,
        fullName: user.fullName,
        avatar: user.avatar,
        memberSince: user.createdAt.toISOString().split('T')[0],
      });
    });

    await Promise.all(promises);

    // Sort by descending order count.
    topUsersDto.sort((a, b) => b.totalCount - a.totalCount);

    return res.status(200).json(new ApiResponse(200, topUsersDto));
  } catch (error) {
    console.error('Error Retrieving Top Users Of The Week.', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

const GetTopUsersThisMonth = asyncHandler(async (req, res) => {
  const startingDateOfMonth = moment()
    .tz('Asia/Kolkata')
    .startOf('month')
    .format('YYYY-MM-DD');
  console.log(startingDateOfMonth);
  try {
    const topUsers = await Mantralekhan.findAll({
      attributes: ['userId', [Sequelize.literal('SUM("count")'), 'totalCount']],
      where: {
        date: {
          [Op.gte]: startingDateOfMonth,
        },
      },
      group: ['userId'],
      order: [[Sequelize.literal('SUM("count")'), 'DESC']], // Order by the sum of count in descending order
      limit: 100, // Limit the result to 100 rows
    });

    // Here userId and totalCount is obtained. We need to add userProfilePic, user full name, member since.
    let topUsersDto = [];

    const promises = topUsers.map(async (topUser) => {
      const user = await User.findByPk(topUser.userId);

      topUsersDto.push({
        totalCount: topUser.dataValues.totalCount,
        fullName: user.fullName,
        avatar: user.avatar,
        memberSince: user.createdAt.toISOString().split('T')[0],
      });
    });

    await Promise.all(promises);

    // Sort by descending order count.
    topUsersDto.sort((a, b) => b.totalCount - a.totalCount);

    return res.status(200).json(new ApiResponse(200, topUsersDto));
  } catch (error) {
    console.error('Error Retrieving Top Users Of This Month.', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

const GetTopUsersThisYear = asyncHandler(async (req, res) => {
  const startingDateOfYear = moment()
    .tz('Asia/Kolkata')
    .startOf('year')
    .format('YYYY-MM-DD');
  console.log(startingDateOfYear);
  try {
    const topUsers = await Mantralekhan.findAll({
      attributes: ['userId', [Sequelize.literal('SUM("count")'), 'totalCount']],
      where: {
        date: {
          [Op.gte]: startingDateOfYear,
        },
      },
      group: ['userId'],
      order: [[Sequelize.literal('SUM("count")'), 'DESC']], // Order by the sum of count in descending order
      limit: 100, // Limit the result to 100 rows
    });

    // Here userId and totalCount is obtained. We need to add userProfilePic, user full name, member since.
    let topUsersDto = [];

    const promises = topUsers.map(async (topUser) => {
      const user = await User.findByPk(topUser.userId);

      topUsersDto.push({
        totalCount: topUser.dataValues.totalCount,
        fullName: user.fullName,
        avatar: user.avatar,
        memberSince: user.createdAt.toISOString().split('T')[0],
      });
    });

    await Promise.all(promises);

    // Sort by descending order count.
    topUsersDto.sort((a, b) => b.totalCount - a.totalCount);

    return res.status(200).json(new ApiResponse(200, topUsersDto));
  } catch (error) {
    console.error('Error Retrieving Top Users Of This Year.', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

const GetCountOfMantralekhan = asyncHandler(async (req, res) => {
  try {
    const result = await User.sum('mantraChanted');
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { count: result },
          'Sum of Mantralekhan Retrieved Successfully.'
        )
      );
  } catch (error) {
    console.error('Error Fetching Sum of Mantralekhan:', error);
    throw new ApiError(500, 'Internal Server Error.');
  }
});
module.exports = {
  PostMantralekhan,
  GetTopUsersAllTime,
  GetTopUsersThisWeek,
  GetTopUsersThisMonth,
  GetTopUsersThisYear,
  GetTopUsersToday,
  GetCountOfMantralekhan,
};
