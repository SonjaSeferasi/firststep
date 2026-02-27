const mongoose = require("mongoose");

// Trip history schema/model
const tripHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    originStop: {
      type: String,
      required: true,
      trim: true,
    },
    destinationStop: {
      type: String,
      required: true,
      trim: true,
    },
    lineUsed: {
      type: String,
      trim: true,
      default: "",
    },
    totalMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { collection: "tripHistory", timestamps: true }
);

module.exports = mongoose.model("tripHistory", tripHistorySchema);