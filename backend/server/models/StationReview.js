const mongoose = require("mongoose");

const StationReviewSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    targetType: {
        type: String,
        enum: ["station", "line"],
        required: true
    },

    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    reviewText: {
        type: String,
        required: true,
        maxlength: 1000
    },

    photos: [{
        type: String
    }],

    verifiedRider: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date
    }

});

// Prevent duplicate reviews from same user
StationReviewSchema.index(
    { userId: 1, targetId: 1 },
    { unique: true }
);


<<<<<<< HEAD
module.exports = mongoose.model("StationReviews", StationReviewSchema);
=======
module.exports = mongoose.model("StationReviews", StationReviewSchema);
>>>>>>> 1d35c573bee043edf788458b844d5fb2d8c23498
