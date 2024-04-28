const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const ServerConfig = require('./config/server.config');

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
module.exports = app;
