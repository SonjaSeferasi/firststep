const express = require("express");
const router = express.Router();
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