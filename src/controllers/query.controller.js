const asyncHandler = require('../utils/asyncHandler.util');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');
const Query = require('../models/query.model');

const PostQuery = asyncHandler(async (req, res) => {
  const { subject, content, email, firstName, lastName } = req.body;

  if (!subject || !content || !email || !firstName || !lastName) {
    throw new ApiError(400, 'All fields are required.');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Invalid email address format.');
  }
  try {
    const query = await Query.create({
      subject,
      content,
      email,
      firstName,
      lastName,
    });

    return res
      .status(201)
      .json(new ApiResponse(200, query, 'Query Posted Successfully.'));
  } catch (error) {
    console.error('Error Posting Query:', error);
    throw new ApiError(500, 'Internal Server Error.');
  }
});

module.exports = {
  PostQuery,
};
