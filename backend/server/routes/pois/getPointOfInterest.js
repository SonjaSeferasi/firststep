const express = require("express");
const router = express.Router();
const PointOfInterest = require("../../models/PointOfInterest");

router.get("/", async (req, res) => {
  try {
    const pois = await PointOfInterest.find();
    return res.status(200).json({ pois });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

module.exports = router;