const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const ServerConfig = require('./config/server.config');
const sendEmail = require('./utils/nodemailer.util');
const session = require('express-session');
const passport = require('passport');
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

app.use(
  cors({
    origin: ServerConfig.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.static('public'));
app.use(cookieParser());

app.use(
  session({
    secret: ServerConfig.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//Passport Config
const initPassport = require('./config/passport.config');
initPassport(passport);

// Google OAuth2 Login
// This is hit when sign in with google button is pressed
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

const CLIENT_URL = 'http://localhost:3000/dashboard';

// This route is called by the Google server (Not by us) Kind of a webhook
app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: CLIENT_URL,
    failureRedirect: '/login/failure',
  })
);

// Callback Route For Successfull Login User
app.get('/login/success', (req, res) => {
  console.log('Session Data:', req.session);
  console.log(req.user);

  if (!req.user) {
    res.redirect('/login/failure');
  }
  res.status(200).json(req.user);
});

// Callback Route For Failure
app.get('/login/failure', (req, res) => {
  res.status(401).json({ message: 'Login Failed.' });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    } else {
      res.clearCookie('connect.sid');
      res.redirect('/');
    }
  });
});

// API Routes
const apiRouter = require('./routes/routes');

app.use('/api', apiRouter);

app.get('/verify', async (req, res) => {
  const resp = await sendEmail();
  console.log(resp);
  res.json({ message: 'Email Sent' });
});

module.exports = app;
