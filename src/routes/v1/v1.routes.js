const express = require('express');
const v1Router = express.Router();
const userRouter = require('./routes/user.routes');

v1Router.use('/user', userRouter);

module.exports = v1Router;
