const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const TripHistory = require("../../models/TripHistory");

router.post("/", async (req, res) => {
  try {
    const { userId, originStop, destinationStop, lineUsed, totalMinutes } = req.body;

    if (!userId || !originStop || !destinationStop) {
      return res.status(400).json({ message: "userId, originStop, destinationStop are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const trip = await TripHistory.create({
      userId,
      originStop,
      destinationStop,
      lineUsed,
      totalMinutes,
    });

    return res.status(201).json({ trip });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;