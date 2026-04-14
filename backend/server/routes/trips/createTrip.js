const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Trip = require("../../models/tripModel");

// POST /api/trips
// Body: { userId, origin, destination, routes }
// Called from the frontend after the user clicks "Save Trip"
router.post("/", async (req, res) => {
  try {
    const { userId, origin, destination, routes } = req.body;

    // Make sure we have the required fields
    if (!userId || !origin?.name || !destination?.name) {
      return res.status(400).json({
        message: "userId, origin.name, and destination.name are required",
      });
    }

    // userId must be a valid MongoDB ObjectId (the _id from the users collection)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const trip = await Trip.create({
      userId,
      origin,
      destination,
      routes: routes || [],
    });

    return res.status(201).json({ success: true, trip });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
