const GitHubStrategy = require('passport-github2').Strategy;
const { User } = require('../models/Schemas');

module.exports = function(passport) {
  passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      // Use the Env Variable for Prod, fallback to localhost for Dev
      callbackURL: process.env.GITHUB_CALLBACK_URL || "http://gitvox.onrender.com/auth/github/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find the user in our DB
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          // If user exists, update their access token (it might have changed/expired)
          user.accessToken = accessToken;
          await user.save();
          return done(null, user);
        } else {
          // If new user, create them
          user = await User.create({
            githubId: profile.id,
            username: profile.username,
            displayName: profile.displayName || profile.username,
            avatarUrl: profile._json.avatar_url,
            email: profile.emails?.[0]?.value,
            accessToken: accessToken,
            profession: 'Developer' // Default role
          });
          return done(null, user);
        }
      } catch (err) {
        return done(err, null);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};