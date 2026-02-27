const express = require("express");
const router = express.Router();
const Review = require("../../models/StationReview");

// GET /api/reviews
router.get("/", async (req, res) => {
  try {
    const { rating, sort } = req.query;

    const query = {};
    if (rating) query.rating = Number(rating);

    let reviews = Review.find(query);

    if (sort === "newest") {
      reviews = reviews.sort({ createdAt: -1 });
    }

    if (sort === "highest") {
      reviews = reviews.sort({ rating: -1 });
    }

    const result = await reviews;

    return res.status(200).json({ reviews: result });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
