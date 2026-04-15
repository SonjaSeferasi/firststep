const express = require("express");
const router = express.Router();
const { STOPS } = require("../../data/mbtaStops");
const StationReview = require("../../models/StationReview");

router.get("/", async (req, res) => {
  try {
    const stations = Object.entries(STOPS).map(([stopId, info]) => ({
      stopId,
      name: info.name,
      lines: info.lines,
      lat: info.lat,
      lng: info.lng
    }));

    return res.status(200).json({ stations });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/:stopId", async (req, res) => {
  try {
    const { stopId } = req.params;
    const stopInfo = STOPS[stopId];

    if (!stopInfo) {
      return res.status(404).json({ message: `Station ${stopId} not found` });
    }

    const reviews = await StationReview.find({ targetType: "station", targetId: stopId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      stopId,
      name: stopInfo.name,
      lines: stopInfo.lines,
      lat: stopInfo.lat,
      lng: stopInfo.lng,
      reviews
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
