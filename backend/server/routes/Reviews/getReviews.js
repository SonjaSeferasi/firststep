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

    return res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Duplicate review not allowed" });
    }
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/reviews
router.get("/", async (req, res) => {
  try {
    const { rating, sort } = req.query;

    const query = {};
    if (rating) query.rating = Number(rating);

    let reviews = Review.find(query);

    if (sort === "newest") reviews = reviews.sort({ createdAt: -1 });
    if (sort === "highest") reviews = reviews.sort({ rating: -1 });

    const result = await reviews; // keep simple for now
    return res.status(200).json({ reviews: result });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;