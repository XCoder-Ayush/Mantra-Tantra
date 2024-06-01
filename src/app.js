const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const ServerConfig = require('./config/server.config');
const sendEmail = require('./utils/nodemailer.util');
const session = require('express-session');
const passport = require('passport');
const morgan = require('morgan');
// Static Middlewares
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

// app.use(
//   cors({
//     origin: ServerConfig.CORS_ORIGIN,
//     credentials: true,
//   })
// );

const corsConfig = {
  origin: true,
  credentials: true,
};

app.use(cors(corsConfig));
app.options('*', cors(corsConfig));

app.use(express.static('public'));

app.use(cookieParser());

app.use(
  session({
    secret: ServerConfig.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(morgan('dev'));
app.use(passport.initialize());
app.use(passport.session());

//Passport Config
const initPassport = require('./config/passport.config');
initPassport(passport);

// Google OAuth2 Login Routes
// This is hit when sign in with google button is pressed
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// This route is called by the Google server (Not by us) Kind of a webhook
app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login/failure',
  }),
  (req, res) => {
    const CLIENT_URL = ServerConfig.CLIENT_URL;
    const token = req.user.generateAccessToken();
    // const options = {
    //   httpOnly: true,
    // };
    res.cookie('accessToken', token);
    res.redirect(CLIENT_URL);
  }
);

// API Routes
const apiRouter = require('./routes/routes');
app.use('/api', apiRouter);

module.exports = app;
