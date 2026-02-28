const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const PointOfInterest = require("../../models/PointOfInterest");

router.post("/", async (req, res) => {
  try {
    const { stopId, stopName, name, category, distanceMeters, isOpenNow } = req.body;

    // Required field validation
    if (!stopId || !stopName || !name || !category || distanceMeters === undefined) {
      return res.status(400).json({
        message: "stopId, stopName, name, category, and distanceMeters are required"
      });
    }

    // Distance validation
    if (distanceMeters < 0) {
      return res.status(400).json({
        message: "distanceMeters must be greater than or equal to 0"
      });
    }

    const poi = await PointOfInterest.create({
      stopId,
      stopName,
      name,
      category,
      distanceMeters,
      isOpenNow,
    });

    return res.status(201).json({ poi });

  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

module.exports = router;