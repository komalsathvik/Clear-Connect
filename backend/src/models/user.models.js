const {Schema,model}=require("mongoose");
const bcrypt=require("bcrypt");
const userSchema=new Schema({
    email:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    token:{
        type:String,
    },

});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});


module.exports = model("User", userSchema);