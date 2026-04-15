const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const StationReview = require("../../models/StationReview"); // FIX: was StationReviews

router.post("/", async (req, res) => {
  try {
    const { userId, targetType, targetId, rating, reviewText, photos } = req.body;
    const { sort } = req.query;

    if (!userId || !targetType || !targetId || !rating || !reviewText) {
      return res.status(400).json({
        message: "userId, targetType, targetId, rating, and reviewText are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId"
      });
    }

    // FIX: was StationReviews.create (undefined), correct variable is StationReview
    await StationReview.create({
      userId,
      targetType,
      targetId,
      rating,
      reviewText,
      photos
    });

    // After creating, fetch all reviews for the targetId, sorted.
    const sortOption = sort === "highest" ? { rating: -1 } : { createdAt: -1 };
    const reviews = await StationReview.find({ targetId: targetId })
      .populate("userId", "name")
      .sort(sortOption);

    return res.status(201).json(reviews);

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Duplicate review not allowed"
      });
    }

    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

module.exports = router;
