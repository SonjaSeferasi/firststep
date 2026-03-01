const mongoose = require("mongoose");

const pointofinterestSchema = new mongoose.Schema(
  {
    stopId: {
      type: String,
      required: true,
    },

    stopName: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["restaurant", "museum", "park", "shopping", "landmark", "other"],
    },

    distanceMeters: {
      type: Number,
      required: true,
      min: 0,
    },

    isOpenNow: {
      type: Boolean,
      default: null, // an option
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "Pointofinterest" }
);

module.exports = mongoose.model("Pointofinterest", pointofinterestSchema);

