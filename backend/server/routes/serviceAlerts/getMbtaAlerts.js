const express = require("express");
const router  = express.Router();
const https   = require("https");

const MBTA_API = process.env.MBTA_API_KEY
  ? `https://api-v3.mbta.com/alerts?filter[route_type]=0,1&sort=-updated_at&api_key=${process.env.MBTA_API_KEY}`
  : "https://api-v3.mbta.com/alerts?filter[route_type]=0,1&sort=-updated_at";

// Map MBTA route_id → our line label
function routeToLine(routeId) {
  if (!routeId) return null;
  if (routeId.startsWith("Red"))    return "Red";
  if (routeId.startsWith("Green"))  return "Green";
  if (routeId.startsWith("Orange")) return "Orange";
  if (routeId.startsWith("Blue"))   return "Blue";
  return null;
}

// GET /api/mbta-alerts
router.get("/", (req, res) => {
  https.get(MBTA_API, (apiRes) => {
    let raw = "";
    apiRes.on("data", chunk => { raw += chunk; });
    apiRes.on("end", () => {
      try {
        const json = JSON.parse(raw);
        const alerts = (json.data || [])
          .map(item => {
            const attr = item.attributes || {};

            // Pick the first subway line found in informed_entity
            const entities = attr.informed_entity || [];
            let line = null;
            for (const e of entities) {
              line = routeToLine(e.route);
              if (line) break;
            }
            if (!line) return null; // skip non-subway alerts

            return {
              _id:         item.id,
              title:       attr.header      || "Service Alert",
              description: attr.description || attr.header || "",
              line,
              effect:      attr.effect      || "",
              createdAt:   attr.updated_at  || attr.created_at,
            };
          })
          .filter(Boolean);

        res.json(alerts);
      } catch (e) {
        res.status(500).json({ message: "Failed to parse MBTA response" });
      }
    });
  }).on("error", (e) => {
    res.status(502).json({ message: "Could not reach MBTA API: " + e.message });
  });
});

module.exports = router;
