const express = require("express");
const router = express.Router();
const TripHistory = require("../../models/TripHistory");

router.get("/", async (req, res) => {
  try {
    const trips = await TripHistory.find().sort({ createdAt: -1 });
    return res.status(200).json({ trips });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;