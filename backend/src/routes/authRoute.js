const passport = require("passport");
const { Register, Login } = require("../controllers/authController");
const { userVerification } = require("../middlewares/authMiddleware");
const router = require("express").Router();
const multer = require("multer");
const User = require("../models/user.models");
const bcrypt = require("bcrypt");
const path = require("path");
const { activeMeetings } = require("../utils/MeetingStore");
const Meetings = require("../models/meetings.model");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// 🔧 Multer config
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

// 🔐 Google OAuth - login
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// 🔐 Google OAuth - callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${FRONTEND_URL}/login`,
  }),
  (req, res) => {
    const { token, email, username, profilePic } = req.user;
    const picture = profilePic || "./images/2903-default-blue.png";
    res.redirect(
      `${FRONTEND_URL}/google-auth-success?token=${token}&name=${username}&email=${email}&picture=${encodeURIComponent(
        picture
      )}`
    );
  }
);

// 👤 Profile update
router.put(
  "/update-profile",
  userVerification,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const { username, password } = req.body;
      const userId = req.user.id;
      const updateFields = {};

      if (username) updateFields.username = username;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        updateFields.password = hashedPassword;
      }
      if (req.file) {
        updateFields.profilePic = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await User.findByIdAndUpdate(userId, {
        $set: updateFields,
      }, { new: true });

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      res.json({
        success: true,
        message: "Profile updated",
        username: updatedUser.username,
        updatedProfilePic: updatedUser.profilePic,
      });
    } catch (err) {
      console.error("❌ Update error:", err);
      res.status(500).json({
        success: false,
        message: "Update failed",
        error: err.message,
      });
    }
  }
);

// ❌ Delete profile
router.delete("/delete-profile", userVerification, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await User.findByIdAndDelete(userId);
    res.clearCookie("token");
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete profile",
      error: err.message,
    });
  }
});

// 🎥 Meeting routes
router.post("/check-meeting", (req, res) => {
  const { meetingId } = req.body;
  if (!meetingId) {
    return res.status(400).json({ success: false, message: "Meeting ID required" });
  }
  const exists = activeMeetings.has(meetingId);
  return res.status(200).json({ success: true, exists });
});

router.post("/past-meeting", async (req, res) => {
  try {
    const { meetingId, username, admin } = req.body;
    const meeting = new Meetings({ username, meetingId, admin });
    await meeting.save();
    res.status(201).json({ success: true, message: "Meeting saved" });
  } catch (error) {
    console.error("Error saving meeting:", error);
    res.status(500).json({ success: false, message: "Failed to save meeting" });
  }
});

router.get("/history", async (req, res) => {
  try {
    const { admin } = req.query;
    if (!admin) {
      return res.status(400).json({ error: "Admin field is required" });
    }
    const userMeetings = await Meetings.find({ admin });
    const data = userMeetings.map((m) => m.toObject());
    res.status(200).json({ message: "Meetings loaded", data });
  } catch (err) {
    console.error("Error fetching meetings:", err);
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
});

// 🔐 Auth routes
router.post("/register", Register);
router.post("/login", Login);
router.post("/", userVerification);

// 🧪 Health check
router.get("/test", (req, res) => {
  return res.json({ message: "done!" });
});

module.exports = router;
