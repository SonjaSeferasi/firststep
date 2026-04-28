const express = require("express");
const router = express.Router();
const { STOPS, LINE_SEQUENCES, LINE_TERMINALS, LINE_COLORS, LANDMARKS } = require("../../data/mbtaStops");

// Haversine distance (meters) between two GPS points 
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Find the nearest stop to a GPS coordinate 
function findNearestStop(lat, lng) {
  let bestId = null, bestDist = Infinity;
  for (const [id, stop] of Object.entries(STOPS)) {
    const d = haversine(lat, lng, stop.lat, stop.lng);
    if (d < bestDist) { bestDist = d; bestId = id; }
  }
  return { stopId: bestId, distanceMeters: Math.round(bestDist) };
}

// Match destination text to a stop ID
function matchDestination(query) {
  const q = query.toLowerCase().trim();

  // 1. Exact landmark match
  if (LANDMARKS[q]) return LANDMARKS[q];

  // 2. Partial landmark match (query contains keyword or keyword contains query)
  for (const [kw, stopId] of Object.entries(LANDMARKS)) {
    if (q.includes(kw) || kw.includes(q)) return stopId;
  }

  // 3. Exact stop name match
  for (const [id, stop] of Object.entries(STOPS)) {
    if (stop.name.toLowerCase() === q) return id;
  }

  // 4. Partial stop name match
  for (const [id, stop] of Object.entries(STOPS)) {
    if (stop.name.toLowerCase().includes(q) || q.includes(stop.name.toLowerCase())) return id;
  }

  return null;
}

//  Build bidirectional adjacency graph from line sequences 
function buildAdjacency() {
  const adj = {};
  const lineMap = {
    Red: "Red", RedAshmont: "Red", RedBraintree: "Red",
    GreenMain: "Green", GreenBCD: "Green", GreenE: "Green",
    Orange: "Orange", Blue: "Blue",
  };

  for (const [seqName, seq] of Object.entries(LINE_SEQUENCES)) {
    const line = lineMap[seqName];
    for (let i = 0; i < seq.length - 1; i++) {
      const a = seq[i], b = seq[i + 1];
      // Initialize lazily — do NOT rely on STOPS being populated at module load time
      if (!adj[a]) adj[a] = {};
      if (!adj[b]) adj[b] = {};
      if (!adj[a][line]) adj[a][line] = [];
      if (!adj[b][line]) adj[b][line] = [];
      if (!adj[a][line].includes(b)) adj[a][line].push(b);
      if (!adj[b][line].includes(a)) adj[b][line].push(a);
    }
  }
  return adj;
}

//Determine direction label for a line segment 
// Given the first and second stop of a segment, figure out which terminal
// we are heading toward (used for "Take Red Line toward Alewife" display).
function getDirection(fromId, toId, line) {
  const seqNameMap = {
    Red: ["Red", "RedAshmont", "RedBraintree"],
    Green: ["GreenMain", "GreenBCD", "GreenE"],
    Orange: ["Orange"],
    Blue: ["Blue"],
  };

  for (const seqName of (seqNameMap[line] || [])) {
    const seq = LINE_SEQUENCES[seqName];
    const fi = seq.indexOf(fromId);
    const ti = seq.indexOf(toId);
    if (fi !== -1 && ti !== -1) {
      const terminals = LINE_TERMINALS[line];
      return ti > fi ? `toward ${terminals.end}` : `toward ${terminals.start}`;
    }
  }
  return "";
}

// BFS route finder 
// Returns an array of routes sorted by stop count, each route being an array
// of segments: [ { line, stops: [stopId, ...] }, ... ]
function findRoutes(originId, destId, adj) {
  if (originId === destId) return [];

  // State: { stopId, line, segments, transfers }
  // segments: [{ line, stops: [stopId, ...] }]
  const visited = new Set();
  const queue = [];

  for (const line of STOPS[originId].lines) {
    queue.push({ stopId: originId, line, segments: [{ line, stops: [originId] }], transfers: 0 });
  }

  const routes = [];

  while (queue.length > 0 && routes.length < 4) {
    const { stopId, line, segments, transfers } = queue.shift();
    const key = `${stopId}:${line}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (stopId === destId) {
      routes.push({ segments, transfers });
      continue;
    }

    // Move along current line
    for (const neighbor of (adj[stopId]?.[line] || [])) {
      const currentSeg = segments[segments.length - 1];
      if (!currentSeg.stops.includes(neighbor)) {
        const newSeg = { line, stops: [...currentSeg.stops, neighbor] };
        queue.push({
          stopId: neighbor,
          line,
          segments: [...segments.slice(0, -1), newSeg],
          transfers,
        });
      }
    }

    // Transfer to another line at this stop
    for (const otherLine of STOPS[stopId].lines) {
      if (otherLine !== line) {
        const transferKey = `${stopId}:${otherLine}`;
        if (!visited.has(transferKey)) {
          queue.push({
            stopId,
            line: otherLine,
            segments: [...segments, { line: otherLine, stops: [stopId] }],
            transfers: transfers + 1,
          });
        }
      }
    }
  }

  return routes;
}

// ── Format raw routes into display-ready objects 
function formatRoutes(routes, originId, destId, originDistanceMeters) {
  if (!routes.length) return [];

  // Deduplicate: keep shortest-stop route + fewest-transfer route if different
  const sorted = [...routes].sort((a, b) => {
    const stopsA = a.segments.reduce((s, seg) => s + seg.stops.length - 1, 1);
    const stopsB = b.segments.reduce((s, seg) => s + seg.stops.length - 1, 1);
    return stopsA - stopsB;
  });

  const byTransfers = [...routes].sort((a, b) => a.transfers - b.transfers);
  const candidates = [sorted[0]];
  if (byTransfers[0] !== sorted[0]) candidates.push(byTransfers[0]);

  return candidates.map((route, idx) => {
    const totalRideStops = route.segments.reduce((s, seg) => s + seg.stops.length - 1, 1);
    const walkMinutes = Math.round(originDistanceMeters / 80); // ~80 m/min walking
    const rideMinutes = totalRideStops * 2;
    const totalMinutes = walkMinutes + rideMinutes;

    const formattedSegments = route.segments
      .filter(seg => seg.stops.length >= 2) // skip degenerate single-stop transfer segs
      .map(seg => {
        const direction = getDirection(seg.stops[0], seg.stops[1], seg.line);
        return {
          line: seg.line,
          color: LINE_COLORS[seg.line],
          direction,
          boardAt: STOPS[seg.stops[0]].name,
          exitAt: STOPS[seg.stops[seg.stops.length - 1]].name,
          stops: seg.stops.map(id => STOPS[id].name),
          stopCoords: seg.stops.map(id => ({ lat: STOPS[id].lat, lng: STOPS[id].lng })),
          stopCount: seg.stops.length - 1,
        };
      });

    const firstSeg = formattedSegments[0];
    const lastSeg = formattedSegments[formattedSegments.length - 1];

    return {
      type: idx === 0 ? "recommended" : "fewer_transfers",
      label: idx === 0 ? "Recommended" : "Fewer Transfers",
      boardingStop: firstSeg ? firstSeg.boardAt : STOPS[originId].name,
      exitStop: lastSeg ? lastSeg.exitAt : STOPS[destId].name,
      primaryLine: firstSeg ? firstSeg.line : "",
      primaryColor: firstSeg ? firstSeg.color : "#333",
      transfers: route.transfers,
      totalStops: totalRideStops,
      estimatedMinutes: totalMinutes,
      walkToStopMinutes: walkMinutes,
      walkToStopMeters: originDistanceMeters,
      segments: formattedSegments,
    };
  });
}

// ── Build the adjacency graph once at module load ────────────────────────────
const ADJACENCY = buildAdjacency();

// ── POST /api/smart-route ────────────────────────────────────────────────────
router.post("/", (req, res) => {
  try {
    const { destination, originText, originLat, originLng } = req.body;

    // Guard: stop data must be loaded before we can route
    if (Object.keys(STOPS).length === 0) {
      return res.status(503).json({
        success: false,
        message: "Stop data is still loading. Please try again in a moment.",
      });
    }

    if (!destination || typeof destination !== "string" || destination.trim() === "") {
      return res.status(400).json({ success: false, message: "destination is required." });
    }

    // Resolve origin stop — three options in priority order:
    //  1. GPS coordinates (most accurate)
    //  2. Text input  (user typed a place name)
    //  3. Default     (central Boston — Park Street)
    let originId, distanceMeters = 0, originMode;

    const lat = parseFloat(originLat);
    const lng = parseFloat(originLng);
    const hasCoords = !isNaN(lat) && !isNaN(lng);

    if (hasCoords) {
      const result = findNearestStop(lat, lng);
      originId = result.stopId;
      distanceMeters = result.distanceMeters;
      originMode = "gps";
    } else if (originText && originText.trim()) {
      originId = matchDestination(originText.trim());
      if (!originId) {
        return res.status(404).json({
          success: false,
          message: `Could not find an MBTA stop near "${originText}". Try a stop name, landmark, or neighborhood.`,
        });
      }
      originMode = "text";
    } else {
      // No input at all — default to Park Street
      const result = findNearestStop(42.3563, -71.0624);
      originId = result.stopId;
      originMode = "default";
    }

    // Resolve destination stop
    const destId = matchDestination(destination.trim());
    if (!destId) {
      return res.status(404).json({
        success: false,
        message: `Could not find an MBTA stop near "${destination}". Try a stop name, landmark, or neighborhood.`,
      });
    }

    const originStop = STOPS[originId];
    const destStop   = STOPS[destId];

    if (!originStop) {
      return res.status(500).json({ success: false, message: `Origin stop data missing for "${originId}".` });
    }
    if (!destStop) {
      return res.status(500).json({ success: false, message: `Destination stop data missing for "${destId}".` });
    }

    if (originId === destId) {
      return res.status(200).json({
        success: true,
        message: `You are already near ${destStop.name}!`,
        routes: [],
        origin: { stopId: originId, name: originStop.name, lat: originStop.lat, lng: originStop.lng, distanceMeters, originMode },
        destination: { stopId: destId, name: destStop.name },
      });
    }

    const rawRoutes = findRoutes(originId, destId, ADJACENCY);

    if (!rawRoutes.length) {
      return res.status(404).json({
        success: false,
        message: `No subway route found from "${originStop.name}" to "${destStop.name}". Both must be reachable by MBTA subway.`,
      });
    }

    const routes = formatRoutes(rawRoutes, originId, destId, distanceMeters);

    return res.status(200).json({
      success: true,
      origin: { stopId: originId, name: originStop.name, lat: originStop.lat, lng: originStop.lng, distanceMeters, originMode },
      destination: { stopId: destId, name: destStop.name },
      routes,
    });

  } catch (err) {
    console.error("[smart-route] Unhandled error:", err.message);
    return res.status(500).json({ success: false, message: `Server error: ${err.message}` });
  }
});

module.exports = router;
