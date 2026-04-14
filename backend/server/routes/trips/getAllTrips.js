const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Trip = require("../../models/tripModel");

// GET /api/trips?userId=<id>
// Returns all saved trips for one user, newest first
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    // userId is required — we only ever fetch trips for one user
    if (!userId) {
      return res.status(400).json({ message: "userId query param is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const trips = await Trip.find({ userId }).sort({ savedAt: -1 });

    return res.status(200).json({ success: true, trips });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
