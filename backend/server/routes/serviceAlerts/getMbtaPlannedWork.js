const express = require("express");
const router  = express.Router();
const https   = require("https");

function buildUrl() {
  const key = process.env.MBTA_API_KEY ? `&api_key=${process.env.MBTA_API_KEY}` : "";
  return `https://api-v3.mbta.com/alerts?filter[route_type]=0,1&filter[lifecycle]=UPCOMING,ONGOING_UPCOMING&sort=active_period${key}`;
}

function routeToLine(routeId) {
  if (!routeId) return null;
  if (routeId.startsWith("Red"))    return "Red";
  if (routeId.startsWith("Green"))  return "Green";
  if (routeId.startsWith("Orange")) return "Orange";
  if (routeId.startsWith("Blue"))   return "Blue";
  return null;
}

// GET /api/mbta-planned
router.get("/", (req, res) => {
  const url = buildUrl();
  https.get(url, (apiRes) => {
    let raw = "";
    apiRes.on("data", chunk => { raw += chunk; });
    apiRes.on("end", () => {
      try {
        const json = JSON.parse(raw);
        const items = (json.data || [])
          .map(item => {
            const attr = item.attributes || {};
            const entities = attr.informed_entity || [];

            let line = null;
            const routeSet = new Set();
            for (const e of entities) {
              const l = routeToLine(e.route);
              if (l && !line) line = l;
              if (e.route) routeSet.add(e.route);
            }
            if (!line) return null;

            // Pull unique stop names (stored as route IDs — we just show the branch labels)
            const branches = [...routeSet]
              .filter(r => routeToLine(r) === line)
              .map(r => r.replace(/^(Red|Green|Orange|Blue)-?/, "").trim())
              .filter(Boolean);

            const period = (attr.active_period || [])[0] || {};

            return {
              _id:          item.id,
              title:        attr.header      || "Planned Work",
              description:  attr.description || "",
              line,
              effect:       attr.effect      || "",
              lifecycle:    attr.lifecycle   || "",
              start:        period.start     || null,
              end:          period.end       || null,
              branches,
            };
          })
          .filter(Boolean);

        res.json(items);
      } catch (e) {
        res.status(500).json({ message: "Failed to parse MBTA planned work" });
      }
    });
  }).on("error", e => {
    res.status(502).json({ message: "Could not reach MBTA API: " + e.message });
  });
});

module.exports = router;
