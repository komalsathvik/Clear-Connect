const passport = require("passport");
const { Register, Login } = require("../controllers/authController");
const { userVerification } = require("../middlewares/authMiddleware");
const router = require("express").Router();
const multer = require("multer");
const User = require("../models/user.models");
const bcrypt = require("bcrypt");
const path = require("path");
const { activeMeetings } = require("../utils/MeetingStore");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `${Date.now()}-${file.fieldname}.${ext}`);
  },
});

const upload = multer({ storage });
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);
router.put(
  "/update-profile",
  userVerification,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      console.log("Incoming profile update request...");
      console.log("User ID:", req.user.id);
      console.log("Request Body:", req.body);
      console.log("Uploaded File:", req.file);

      const { username, password } = req.body;
      const userId = req.user.id;
      const updateFields = {};

      if (username) updateFields.username = username;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        updateFields.password = hashedPassword;
      }
      if (req.file) {
        const profilePicPath = `/uploads/${req.file.filename}`;
        updateFields.profilePic = profilePicPath;
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: updateFields,
        },
        { new: true }
      );

      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.json({
        success: true,
        message: "Profile updated",
        username: updatedUser.username,
        updatedProfilePic: updatedUser.profilePic,
      });
    } catch (err) {
      console.error("❌ Update error:", err);
      res
        .status(500)
        .json({ success: false, message: "Update failed", error: err.message });
    }
  }
);
router.delete("/delete-profile", userVerification, async (req, res) => {
  console.log(" DELETE /delete-profile route loaded");
  try {
    const userId = req.user.id;
    console.log("user", userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ sucess: false, message: "user not found" });
    }
    const val = await User.findByIdAndDelete(userId);
    console.log(val);
    console.log("deleted");
    res.clearCookie("token");
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete profile",
      error: err.message,
    });
  }
});
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    const token = req.user.token;
    const email = req.user.email;
    const username = req.user.username;
    const picture = req.user.profilePic || "./images/2903-default-blue.png";
    res.redirect(
      `http://localhost:5173/google-auth-success?token=${token}&name=${username}&email=${email}&picture=${encodeURIComponent(
        picture
      )}`
    );
  }
);
router.post("/check-meeting", (req, res) => {
  console.log("hello");
  const { meetingId } = req.body;

  if (!meetingId) {
    return res
      .status(400)
      .json({ success: false, message: "Meeting ID required" });
  }

  const exists = activeMeetings.has(meetingId);
  console.log(exists);
  if (exists) {
    return res.status(200).json({ success: true, exists: true });
  } else {
    return res.status(200).json({ success: true, exists: false });
  }
});
router.post("/register", Register);
router.get("/test", (req, res) => {
  return res.json({ message: "done!" });
});
router.post("/login", Login);
router.post("/", userVerification);
module.exports = router;
