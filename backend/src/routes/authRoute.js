const { Register,Login } = require("../controllers/authController");
const {userVerification}=require("../middlewares/authMiddileware");
const router = require("express").Router();

router.post("/register", Register);
router.get("/test",(req,res)=>{
    return res.json({message:"done!"});
});
router.post('/login',Login);
router.post('/',userVerification)
module.exports = router;