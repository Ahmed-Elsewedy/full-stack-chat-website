const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/user.model");

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "/auth/google/redirect",
        },

        async (accessToken, refreshToken, profile, done) => {
            let { name, email } = profile._json;
            const currentUser = await User.findOne({ email });
            if (currentUser) {
                return done(null, currentUser);
            }
            const newUser = new User({ fullname: name, email, isVerify: true });

            await newUser.save({ validateBeforeSave: false });
            return done(null, newUser);
        }
    )
);

module.exports = passport