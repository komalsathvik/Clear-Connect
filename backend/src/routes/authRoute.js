const passport = require("passport");
const { Register,Login } = require("../controllers/authController");
const {userVerification}=require("../middlewares/authMiddileware");
const router = require("express").Router();

router.get("/auth/google",passport.authenticate("google",{
    scope:["profile","email"],
    prompt: "select_account",
}));
router.get("/auth/google/callback",
    passport.authenticate("google",{
        session:false,
        failureRedirect:"http://localhost:5173/login",
    }),
    (req,res)=>{
        const token=req.user.token;
            const username = req.user.username;
            const picture = req.user.profilePic || "./images/2903-default-blue.png";
        res.redirect(`http://localhost:5173/google-auth-success?token=${token}&name=${username}&picture=${encodeURIComponent(picture)}`);
    }
)
router.post("/register", Register);
router.get("/test",(req,res)=>{
    return res.json({message:"done!"});
});
router.post('/login',Login);
router.post('/',userVerification)
module.exports = router;