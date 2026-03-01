<<<<<<< HEAD
const express = require("express");
const router = express.Router();
const StationReviews = require("../../models/StationReview");

router.get("/", async (req, res) => {

  try {

    const reviews = await StationReviews
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
=======
router.get("/", async (req, res) => {

    try {

        const { rating, sort } = req.query;

        let query = {};

        // Filter by rating
        if (rating) {
            query.rating = rating;
        }

        let reviews = Review.find(query);

        // Sorting
        if (sort === "newest") {
            reviews = reviews.sort({ createdAt: -1 });
        }

        if (sort === "highest") {
            reviews = reviews.sort({ rating: -1 });
        }

        const result = await reviews.populate("userId", "name");

        res.status(200).json(result);

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

});
>>>>>>> 1d35c573bee043edf788458b844d5fb2d8c23498
