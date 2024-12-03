const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const AUTH_OPTIONS = {
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
};

function verifyCallback(accessToken, refershToken, profile, done) {
  console.log('Acesss Token', accessToken);
  console.log('Google profile', profile);
  done(null, profile);
}

passport.use(new GoogleStrategy(AUTH_OPTIONS, verifyCallback));

// const config = {
//   CLIENT_ID: process.env.CLIENT_ID,
//   CLIENT_SECRET: process.env.CLIENT_SECRET,
// };

// passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

const app = express();

app.use(helmet());
app.use(passport.initialize());

function checkLoggedIn(req, res, next) {
  const isLoggedIn = true; //TODO
  if (!isLoggedIn) {
    return res.status(401).json({
      error: 'You must log in!',
    });
  }
  next();
}

app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/failure',
    successRedirect: '/',
    session: false,
  }),
  (req, res) => {
    console.log('Google Called us back!');
  }
);

app.get('/auth/logout', (req, res) => {});

app.get('/secret', checkLoggedIn, (req, res) => {
  return res.send('Your presonal secret value is 42!');
});

app.get('/failure', (req, res) => {
  return res.send('Failed to Login!');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

https
  .createServer(
    {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
    },
    app
  )
  .listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
