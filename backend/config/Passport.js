const passport=require("passport");
const googleStrategy=require("passport-google-oauth20").Strategy;
const User=require("../src/models/user.models");
const { createSecretToken } = require("../src/secretToken");
require("dotenv").config();
passport.use(
  new googleStrategy({
      clientID: process.env.GOOGLE_CLIENT_KEY,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://clear-connect-xhdj.onrender.com/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
               if (!profile || !profile.emails || !profile.displayName) {
          console.log("Google profile missing data:", profile);
          return done(null, false);
        }

        let user = await User.findOne({ email: profile.emails[0].value });
        const profilePic=profile.photos[0]?.value;
        if (!user) {
          user = await User.create({
            username: profile.displayName,
            email: profile.emails[0].value,
            password: "google-oauth",
            profilePic:profilePic,
          });
          console.log("New user created:", user);
        } else {
          if (!user.profilePic && profilePic) {
      user.profilePic = profilePic;
      await user.save();
      }
    console.log("Existing user:", user);
        }

        user.token = createSecretToken(user._id);
        return done(null, user);
      } catch (err) {
        console.error("Error in Google strategy:", err);
        return done(err, null);
      }
    }
  )
);
