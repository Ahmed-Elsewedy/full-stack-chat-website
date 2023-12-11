const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/redirect",
    passport.authenticate("google", { failureRedirect: "/api" }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.SECRET_KEY, { expiresIn: "1d" });
        res.redirect(process.env.CLIENT_URL + "/verify/?token=" + token);
        // res.json({ token });
        // res.send(`<script>window.opener.postMessage({ token: 'ahmed' }, 'http://localhost:5173');</script>`);
    }
);

// router.get("/logout", (req, res) => {
//     req.logout();
//     res.json({ message: "Logout successful" });
// });

// function ensureAuthenticated(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     res.status(401).json({ error: "Unauthorized" });
// }

// router.get("/profile", ensureAuthenticated, (req, res) => {
//     res.json({ user: req.user });
// });

module.exports = router;
