const User=require("../models/user.models");
const {createSecretToken}=require("../secretToken");
const bcrypt=require("bcrypt");
module.exports.Register=async(req,res,next)=>{
    console.log("register route hit");
    try{
        const {username,email,password}=req.body;
        console.log(req.body);
        const isExisting=await User.findOne({email:email});
        if(isExisting){
            return res.json({message:"user exists"});
        }
        const user=new User({
            username:username,
            email:email,
            password:password,
            profilePic:"./images/2903-default-blue.png",
        });
        await user.save();
        const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if(!email || !password ){
      return res.json({message:'All fields are required'})
    }
    const user = await User.findOne({ email });
    if(!user){
      return res.json({message:'Incorrect password or email' }) 
    }
    const auth = await bcrypt.compare(password,user.password)
    if (!auth) {
      return res.json({message:'Incorrect password or email' }) 
    }
     const token = createSecretToken(user._id);
     res.cookie("token", token, {
       withCredentials: true,
       httpOnly: false,
     });
     res.status(201).json({
  message: "Login successful!",
  token: createSecretToken(user._id),
  username: user.username,
  profilePic: user.profilePic || null,
  success:true
});

  } catch (error) {
    console.error(error);
  }
};