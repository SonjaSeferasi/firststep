const express = require("express");
const router = express.Router();
const StationReviews = require("../../models/StationReview");

router.get("/", async (req, res) => {

  try {

    const reviews = await StationReview
      .find()
      .sort({ createdAt: -1 });

    return res.status(200).json({ reviews });

  } catch (err) {

    return res.status(500).json({
      message: "Server error",
      error: err.message
    });

  }

});

module.exports = router;
