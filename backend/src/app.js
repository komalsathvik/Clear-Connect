const express=require("express");
const mongoose=require("mongoose");
require("dotenv").config();
const http=require('http');
const app=express();
const PORT=process.env.PORT;
const url=process.env.MONGO_URL;
const cors=require("cors");
const authRoute=require("./routes/authRoute");
const passport=require("passport");
require("../config/Passport");

const server=http.createServer(app);
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173","http://localhost:9000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(passport.initialize());
app.use("/", authRoute);
async function connectDb(){
    await mongoose.connect(url).then(()=>{
        console.log("db connected");
    }).catch((err)=>{
        console.log(err);
    })
}
server.listen(PORT,()=>{
    console.log("server is running");
    connectDb();
})