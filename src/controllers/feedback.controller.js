const asyncHandler = require('../utils/asyncHandler.util');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');
const Feedback = require('../models/feedback.model');

const PostFeedback = asyncHandler(async (req, res) => {
  const { email, fullName, comment } = req.body;

  if (!comment || !email || !fullName) {
    throw new ApiError(400, 'All fields are required.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Invalid email address format.');
  }

  try {
    const query = await Feedback.create({
      email,
      fullName,
      comment,
    });

    return res
      .status(201)
      .json(new ApiResponse(200, query, 'Feedback Posted Successfully.'));
  } catch (error) {
    console.error('Error Posting Feedback:', error);
    throw new ApiError(500, 'Internal Server Error.');
  }
});

module.exports = {
  PostFeedback,
};
