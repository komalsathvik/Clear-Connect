const { Schema } = require("mongoose");
const { model } = require("mongoose");
const meetingSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  meetingId: {
    type: String,
    required: true,
  },
  admin: {
    type: String,
    required: true,
  },
});

module.exports = model("Meetings", meetingSchema);
