const express = require("express");
const router = express.Router();
const StationReview = require("../../models/StationReview");

router.get("/", async (req, res) => {
  try {
    const { sort, rating } = req.query;

    const query = {};
    if (rating) query.rating = Number(rating);

    const sortOption = sort === "highest" ? { rating: -1 } : { createdAt: -1 };

    // FIX: was StationReviews (undefined), correct variable is StationReview
    const reviews = await StationReview.find(query)
      .populate("userId", "name")
      .sort(sortOption);

    // FIX: return plain array so frontend setReviews(data) works directly
    return res.status(200).json(reviews);

  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

module.exports = router;