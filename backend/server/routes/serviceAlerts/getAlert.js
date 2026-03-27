const express = require("express");
const router = express.Router();
const ServiceAlert = require("../../models/ServiceAlert");

// GET /api/alerts
router.get("/", async (req, res) => {
  try {
    const alerts = await ServiceAlert.find();
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;