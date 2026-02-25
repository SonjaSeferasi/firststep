const mongoose = require("mongoose");

// Trip history schema/model
const tripHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", 
      required: true,
      label: "userId",
    },
    originStop: {
      type: String,
      required: true,
      trim: true,
      label: "originStop",
    },
    destinationStop: {
      type: String,
      required: true,
      trim: true,
      label: "destinationStop",
    },
    lineUsed: {
      type: String,
      trim: true,
      label: "lineUsed",
      default: "",
    },
    totalMinutes: {
      type: Number,
      min: 0,
      label: "totalMinutes",
      default: 0,
    },
  },
  { collection: "tripHistory", timestamps: true } // timestamps adds createdAt/updatedAt
);

module.exports = mongoose.model("tripHistory", tripHistorySchema);