const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const mongoose = require("mongoose");
const StationReviews = require("../../models/StationReview");

router.post("/", async (req, res) => {

  try {

    const { userId, targetType, targetId, rating, reviewText, photos } = req.body;

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

    const review = await StationReviews.create({
      userId,
      targetType,
      targetId,
      rating,
      reviewText,
      photos
    });

    return res.status(201).json({ review });

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
=======
const Review = require("../models/StationReview");


// Create Review
router.post("/", async (req, res) => {

    try {

        const {
            userId,
            targetType,
            targetId,
            rating,
            reviewText,
            photos
        } = req.body;

        // Basic validation
        if (!userId || !targetType || !targetId || !rating || !reviewText) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        const review = new Review({
            userId,
            targetType,
            targetId,
            rating,
            reviewText,
            photos
        });

        await review.save();

        res.status(201).json({
            message: "Review submitted successfully",
            review: review
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Duplicate review not allowed"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }

});

module.exports = router;
>>>>>>> 1d35c573bee043edf788458b844d5fb2d8c23498
