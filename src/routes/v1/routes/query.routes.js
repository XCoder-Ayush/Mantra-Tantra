const express = require('express');
const queryRouter = express.Router();
const QueryController = require('../../../controllers/query.controller');

queryRouter.route('/').post(QueryController.PostQuery);

module.exports = queryRouter;
