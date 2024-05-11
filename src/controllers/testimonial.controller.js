const asyncHandler = require('../utils/asyncHandler.util');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');
const Testimonial = require('../models/testimonial.model');
const User = require('../models/user.model');

const PostTestimonial = asyncHandler(async (req, res) => {
  const { content, userId } = req.body;

  if (!content) {
    throw new ApiError(400, 'Content cannot be empty.');
  }

  try {
    // Already coming from AuthMiddleware so no need to check for userId:
    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

    const testimonial = await Testimonial.create({
      content,
      userId,
      fullName: user.fullName,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(200, testimonial, 'Testimonial Posted Successfully.')
      );
  } catch (error) {
    console.error('Error Posting Testimonial : ', error);
    throw new ApiError(500, 'Internal Server Error.');
  }
});

const GetAllTestimonials = asyncHandler(async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          testimonials,
          'All Testimonials Retrieved Successfully.'
        )
      );
  } catch (error) {
    console.error('Error Fetching Testimonials:', error);
    throw new ApiError(500, 'Internal Server Error.');
  }
});
module.exports = {
  PostTestimonial,
  GetAllTestimonials,
};
