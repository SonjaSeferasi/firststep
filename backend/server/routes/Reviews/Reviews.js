const express = require("express");
const router = express.Router();
const Review = require("../../models/StationReview");

// POST /api/reviews
router.post("/", async (req, res) => {
  try {
    const { userId, targetType, targetId, rating, reviewText, photos } = req.body;

    if (!userId || !targetType || !targetId || !rating || !reviewText) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const review = await Review.create({
      userId,
      targetType,
      targetId,
      rating,
      reviewText,
      photos,
    });

    return res.status(201).json({
      message: "Review submitted successfully",
      review,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Duplicate review not allowed" });
    }

    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;