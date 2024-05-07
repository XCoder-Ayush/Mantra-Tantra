const OAuth2Strategy = require('passport-google-oauth2').Strategy;
const ServerConfig = require('./server.config');
const UserController = require('../controllers/user.controller');

function initPassport(passport) {
  passport.use(
    new OAuth2Strategy(
      {
        clientID: ServerConfig.OAUTH2_CLIENT_ID,
        clientSecret: ServerConfig.OAUTH2_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
        scope: ['profile', 'email'],
      },
      UserController.SignInWithGoogle
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
}

module.exports = initPassport;
