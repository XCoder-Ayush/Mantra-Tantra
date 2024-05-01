const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const ServerConfig = require('./config/server.config');
const FAQ = require('./models/faq.model');
const Query = require('./models/query.model');
const Testimonial = require('./models/testimonial.model');
const Mantralekhan = require('./models/mantralekhan.model');

app.use(
  express.json({
    limit: '16kb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '16kb',
  })
);

app.use(
  cors({
    origin: ServerConfig.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.static('public'));
app.use(cookieParser());

const apiRouter = require('./routes/routes');

app.use('/api', apiRouter);

module.exports = app;
