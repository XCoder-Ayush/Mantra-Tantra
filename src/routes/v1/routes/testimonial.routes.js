const express = require('express');
const testimonialRouter = express.Router();
const AuthMiddleware = require('../../../middlewares/auth.middleware');
const TestimonialController = require('../../../controllers/testimonial.controller');

testimonialRouter
  .route('/')
  .post(AuthMiddleware, TestimonialController.PostTestimonial);

testimonialRouter.route('/').get(TestimonialController.GetAllTestimonials);

module.exports = testimonialRouter;
