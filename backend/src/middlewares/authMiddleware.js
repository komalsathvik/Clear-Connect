// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.userVerification = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(req.headers.authorization);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY); // use correct secret
    req.user = decoded; // make decoded user accessible in route
    next(); // 👈 this is very important
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
