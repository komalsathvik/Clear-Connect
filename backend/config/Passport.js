const passport=require("passport");
const googleStrategy=require("passport-google-oauth20").Strategy;
const User=require("../src/models/user.models");
const { createSecretToken } = require("../src/secretToken");
require("dotenv").config();
passport.use(
    new googleStrategy({
        clientID:process.env.GOOGLE_CLIENT_KEY,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:"http://localhost:9000/auth/google/callback",
    },
    async(accessToken,refreshToken,profile,done)=>{
        if(profile && profile.emails && profile.displayName){
            try{
                let user=await User.findOne({email:profile.emails[0].value});
                if(!user){
                    user=await User.create({
                        username:profile.displayName,
                        email:profile.emails[0].value,
                        password:"google-oauth",
                    });
                    console.log("google profile ",profile)
                }
                user.token=createSecretToken(user._id);
                return done(null,user);
            }
            catch(err){
                return done(err,null);
            }
        }
    }
    )
);