const express = require("express");
const router = express.Router();
const ServiceAlert = require("../../models/ServiceAlert");

// GET /api/alerts
router.get("/", async (req, res) => {
  try {
    const alerts = await ServiceAlert.find().sort({ createdAt: -1 });
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/alerts/:id
router.delete("/:id", async (req, res) => {
  try {
    const alert = await ServiceAlert.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.status(200).json({ message: "Alert deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;