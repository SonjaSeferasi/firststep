const express = require("express");
const router = express.Router();
const postReviewsRouter = require("../reviews/postReviews");
const { STOPS } = require("../../data/mbtaStops");

router.use("/:stopId/reviews", (req, res, next) => {
  const { stopId } = req.params;

  if (!STOPS[stopId]) {
    return res.status(404).json({ message: `Station ${stopId} not found` });
  }

  req.body.targetType = "station";
  req.body.targetId = stopId;
  next();
}, postReviewsRouter);

module.exports = router;
