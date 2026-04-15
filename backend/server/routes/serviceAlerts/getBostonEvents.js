const express = require("express");
const router  = express.Router();
const https   = require("https");

// GET /api/boston-events
// Fetches upcoming public events from Boston.gov
router.get("/", (req, res) => {
  const url = "https://www.boston.gov/api/v2/calendar-events?_format=json&type=event&limit=12";

  https.get(url, { headers: { "Accept": "application/json" } }, (apiRes) => {
    let raw = "";
    apiRes.on("data", chunk => { raw += chunk; });
    apiRes.on("end", () => {
      try {
        const json = JSON.parse(raw);
        const events = (Array.isArray(json) ? json : json.data || []).map(item => ({
          _id:         item.id || item.nid || Math.random(),
          title:       item.title || item.name || "Boston Event",
          description: item.field_intro_text || item.body || "",
          date:        item.field_event_date_recur || item.field_event_date || null,
          location:    item.field_contact_information || item.field_address || "",
          url:         item.view_node ? `https://www.boston.gov${item.view_node}` : "",
          image:       item.field_thumbnail || "",
        }));
        res.json(events);
      } catch {
        res.status(500).json({ message: "Failed to parse Boston events" });
      }
    });
  }).on("error", (e) => {
    res.status(502).json({ message: "Could not reach Boston.gov: " + e.message });
  });
});

module.exports = router;
