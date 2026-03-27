const express = require("express");
const router = express.Router();
const ServiceAlert = require("../../models/ServiceAlert");

// POST /api/alerts
router.post("/", async (req, res) => {
  try {
    const { title, description, line } = req.body;

    if (!title || !description || !line) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    

    const alert = await ServiceAlert.create({
      title,
      description,
      line
    });

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;