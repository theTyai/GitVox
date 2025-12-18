const GitHubStrategy = require('passport-github2').Strategy;
const { User } = require('../models/Schemas');

module.exports = function(passport) {
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch(err) { done(err, null); }
  });

  passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/github/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });
        if (!user) {
          user = await User.create({
            githubId: profile.id,
            username: profile.username,
            displayName: profile.displayName || profile.username,
            avatarUrl: profile._json.avatar_url,
            accessToken: accessToken
          });
        } else {
          user.accessToken = accessToken;
          await user.save();
        }
        return done(null, user);
      } catch (err) { return done(err); }
    }
  ));
};