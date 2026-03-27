

const https = require("https");

//  Line sequences using official MBTA stop IDs
const LINE_SEQUENCES = {
  Red:          ["place-alfcl","place-davis","place-portr","place-harsq","place-cntsq","place-knncl","place-chmnl","place-pktrm","place-dwnxg","place-sstat","place-brdwy","place-andrw","place-jfk"],
  RedAshmont:   ["place-jfk","place-shmnl","place-asmnl"],
  RedBraintree: ["place-jfk","place-nqncy","place-wlsta","place-qnctr","place-qamnl","place-brntn"],
  GreenMain:    ["place-lech","place-spmnl","place-north","place-haecl","place-gover","place-pktrm","place-boyls","place-armnl","place-coecl"],
  GreenBCD:     ["place-coecl","place-hymnl","place-kencl","place-fenwy","place-longw","place-bvmnl"],
  GreenE:       ["place-coecl","place-prmnl","place-symcl","place-nuniv","place-mfa","place-lngmd","place-hsmnl"],
  Orange:       ["place-ogmnl","place-mlmnl","place-welln","place-astao","place-sull","place-ccmnl","place-north","place-haecl","place-state","place-dwnxg","place-chncl","place-tumnl","place-bbsta","place-masta","place-rugg","place-rcmnl","place-jaksn","place-sbmnl","place-grmnl","place-forhl"],
  Blue:         ["place-wondl","place-rbmnl","place-bmmnl","place-sdmnl","place-orhte","place-wimnl","place-aport","place-mvbcl","place-aqucl","place-state","place-gover","place-bomnl"],
};

//  Line display info 
const LINE_TERMINALS = {
  Red:    { start: "Alewife",   end: "Braintree / Ashmont" },
  Green:  { start: "Lechmere",  end: "Heath St / Riverside" },
  Orange: { start: "Oak Grove", end: "Forest Hills" },
  Blue:   { start: "Wonderland",end: "Bowdoin" },
};

const LINE_COLORS = {
  Red: "#DA291C", Green: "#00843D", Orange: "#ED8B00", Blue: "#003DA5",
};

// Landmark text → MBTA stop ID mapping 
const LANDMARKS = {
  // Sports
  "fenway park":            "place-kencl",
  "fenway":                 "place-kencl",
  "red sox":                "place-kencl",
  "baseball":               "place-kencl",
  "td garden":              "place-north",
  "garden":                 "place-north",
  "celtics":                "place-north",
  "bruins":                 "place-north",
  // Museums / Culture
  "museum of fine arts":    "place-mfa",
  "mfa":                    "place-mfa",
  "fine arts":              "place-mfa",
  "new england aquarium":   "place-aqucl",
  "aquarium":               "place-aqucl",
  "museum of science":      "place-spmnl",
  "science museum":         "place-spmnl",
  "ica":                    "place-hymnl",
  // Universities
  "harvard university":     "place-harsq",
  "harvard":                "place-harsq",
  "harvard square":         "place-harsq",
  "mit":                    "place-knncl",
  "massachusetts institute of technology": "place-knncl",
  "northeastern university":"place-nuniv",
  "northeastern":           "place-nuniv",
  "boston university":      "place-kencl",
  "bu":                     "place-kencl",
  "umass boston":           "place-jfk",
  "umass":                  "place-jfk",
  "tufts":                  "place-tumnl",
  "tufts medical":          "place-tumnl",
  // Parks / Landmarks
  "boston common":          "place-pktrm",
  "common":                 "place-pktrm",
  "public garden":          "place-armnl",
  "boston public garden":   "place-armnl",
  "freedom trail":          "place-pktrm",
  "faneuil hall":           "place-gover",
  "quincy market":          "place-gover",
  "north end":              "place-haecl",
  "chinatown":              "place-chncl",
  "assembly row":           "place-astao",
  "revere beach":           "place-rbmnl",
  "beach":                  "place-rbmnl",
  "arnold arboretum":       "place-forhl",
  // Neighborhoods
  "back bay":               "place-bbsta",
  "south end":              "place-bbsta",
  "copley square":          "place-coecl",
  "newbury street":         "place-coecl",
  "prudential center":      "place-prmnl",
  "prudential":             "place-prmnl",
  "symphony hall":          "place-symcl",
  "downtown":               "place-dwnxg",
  "downtown boston":        "place-dwnxg",
  "financial district":     "place-state",
  "beacon hill":            "place-chmnl",
  "charles street":         "place-chmnl",
  "cambridge":              "place-harsq",
  "davis square":           "place-davis",
  "somerville":             "place-davis",
  "jamaica plain":          "place-jaksn",
  "jp":                     "place-jaksn",
  "roxbury":                "place-rcmnl",
  "brookline":              "place-bvmnl",
  "longwood medical area":  "place-lngmd",
  "brigham and womens":     "place-lngmd",
  "childrens hospital":     "place-lngmd",
  "malden":                 "place-mlmnl",
  "medford":                "place-welln",
  "east boston":            "place-mvbcl",
  "quincy":                 "place-qnctr",
  "braintree":              "place-brntn",
  "south station":          "place-sstat",
  "north station":          "place-north",
  "logan airport":          "place-aport",
  "logan":                  "place-aport",
  "airport":                "place-aport",
  "forest hills":           "place-forhl",
  "ashmont":                "place-asmnl",
  "bowdoin":                "place-bomnl",
  "lechmere":               "place-lech",
};

//  Fallback coordinates (used if MBTA API is unreachable) 
const FALLBACK_STOPS = {
  "place-alfcl": { name:"Alewife",                lat:42.3954,lng:-71.1426 },
  "place-davis": { name:"Davis",                  lat:42.3967,lng:-71.1220 },
  "place-portr": { name:"Porter",                 lat:42.3888,lng:-71.1192 },
  "place-harsq": { name:"Harvard",                lat:42.3736,lng:-71.1190 },
  "place-cntsq": { name:"Central Square",         lat:42.3652,lng:-71.1036 },
  "place-knncl": { name:"Kendall/MIT",            lat:42.3625,lng:-71.0862 },
  "place-chmnl": { name:"Charles/MGH",            lat:42.3614,lng:-71.0707 },
  "place-pktrm": { name:"Park Street",            lat:42.3563,lng:-71.0624 },
  "place-dwnxg": { name:"Downtown Crossing",      lat:42.3555,lng:-71.0601 },
  "place-sstat": { name:"South Station",          lat:42.3519,lng:-71.0553 },
  "place-brdwy": { name:"Broadway",               lat:42.3427,lng:-71.0568 },
  "place-andrw": { name:"Andrew",                 lat:42.3306,lng:-71.0571 },
  "place-jfk":   { name:"JFK/UMass",              lat:42.3202,lng:-71.0522 },
  "place-shmnl": { name:"Shawmut",                lat:42.2926,lng:-71.0659 },
  "place-asmnl": { name:"Ashmont",                lat:42.2849,lng:-71.0635 },
  "place-nqncy": { name:"North Quincy",           lat:42.2750,lng:-71.0285 },
  "place-wlsta": { name:"Wollaston",              lat:42.2668,lng:-71.0205 },
  "place-qnctr": { name:"Quincy Center",          lat:42.2514,lng:-71.0052 },
  "place-qamnl": { name:"Quincy Adams",           lat:42.2333,lng:-71.0070 },
  "place-brntn": { name:"Braintree",              lat:42.2078,lng:-71.0008 },
  "place-lech":  { name:"Lechmere",               lat:42.3698,lng:-71.0765 },
  "place-spmnl": { name:"Science Park",           lat:42.3665,lng:-71.0688 },
  "place-north": { name:"North Station",          lat:42.3661,lng:-71.0617 },
  "place-haecl": { name:"Haymarket",              lat:42.3628,lng:-71.0579 },
  "place-gover": { name:"Government Center",      lat:42.3594,lng:-71.0591 },
  "place-boyls": { name:"Boylston",               lat:42.3519,lng:-71.0624 },
  "place-armnl": { name:"Arlington",              lat:42.3512,lng:-71.0706 },
  "place-coecl": { name:"Copley",                 lat:42.3498,lng:-71.0771 },
  "place-hymnl": { name:"Hynes Convention Center",lat:42.3488,lng:-71.0877 },
  "place-kencl": { name:"Kenmore",                lat:42.3485,lng:-71.0960 },
  "place-fenwy": { name:"Fenway",                 lat:42.3450,lng:-71.1049 },
  "place-longw": { name:"Longwood",               lat:42.3416,lng:-71.1099 },
  "place-bvmnl": { name:"Brookline Village",      lat:42.3325,lng:-71.1180 },
  "place-prmnl": { name:"Prudential",             lat:42.3469,lng:-71.0824 },
  "place-symcl": { name:"Symphony",               lat:42.3430,lng:-71.0851 },
  "place-nuniv": { name:"Northeastern University",lat:42.3400,lng:-71.0893 },
  "place-mfa":   { name:"Museum of Fine Arts",    lat:42.3365,lng:-71.0985 },
  "place-lngmd": { name:"Longwood Medical Area",  lat:42.3385,lng:-71.1020 },
  "place-hsmnl": { name:"Heath Street",           lat:42.3261,lng:-71.1119 },
  "place-ogmnl": { name:"Oak Grove",              lat:42.4365,lng:-71.0709 },
  "place-mlmnl": { name:"Malden Center",          lat:42.4264,lng:-71.0685 },
  "place-welln": { name:"Wellington",             lat:42.4021,lng:-71.0773 },
  "place-astao": { name:"Assembly",               lat:42.3920,lng:-71.0771 },
  "place-sull":  { name:"Sullivan Square",        lat:42.3836,lng:-71.0763 },
  "place-ccmnl": { name:"Community College",      lat:42.3729,lng:-71.0694 },
  "place-state": { name:"State",                  lat:42.3589,lng:-71.0577 },
  "place-chncl": { name:"Chinatown",              lat:42.3519,lng:-71.0622 },
  "place-tumnl": { name:"Tufts Medical Center",   lat:42.3485,lng:-71.0633 },
  "place-bbsta": { name:"Back Bay",               lat:42.3469,lng:-71.0751 },
  "place-masta": { name:"Massachusetts Ave",      lat:42.3413,lng:-71.0831 },
  "place-rugg":  { name:"Ruggles",                lat:42.3363,lng:-71.0897 },
  "place-rcmnl": { name:"Roxbury Crossing",       lat:42.3313,lng:-71.0952 },
  "place-jaksn": { name:"Jackson Square",         lat:42.3233,lng:-71.1005 },
  "place-sbmnl": { name:"Stony Brook",            lat:42.3178,lng:-71.1044 },
  "place-grmnl": { name:"Green Street",           lat:42.3104,lng:-71.1074 },
  "place-forhl": { name:"Forest Hills",           lat:42.3004,lng:-71.1136 },
  "place-wondl": { name:"Wonderland",             lat:42.4136,lng:-70.9918 },
  "place-rbmnl": { name:"Revere Beach",           lat:42.4077,lng:-70.9924 },
  "place-bmmnl": { name:"Beachmont",              lat:42.3971,lng:-70.9923 },
  "place-sdmnl": { name:"Suffolk Downs",          lat:42.3906,lng:-70.9975 },
  "place-orhte": { name:"Orient Heights",         lat:42.3859,lng:-71.0047 },
  "place-wimnl": { name:"Wood Island",            lat:42.3791,lng:-71.0226 },
  "place-aport": { name:"Airport",                lat:42.3737,lng:-71.0302 },
  "place-mvbcl": { name:"Maverick",               lat:42.3693,lng:-71.0397 },
  "place-aqucl": { name:"Aquarium",               lat:42.3590,lng:-71.0521 },
  "place-bomnl": { name:"Bowdoin",                lat:42.3613,lng:-71.0620 },
};

// STOPS is populated at startup by loadStops()
const STOPS = {};

//Helpers
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error("Invalid JSON from MBTA API")); }
      });
    }).on("error", reject);
  });
}

function assignLines() {
  const lineMap = {
    Red: "Red", RedAshmont: "Red", RedBraintree: "Red",
    GreenMain: "Green", GreenBCD: "Green", GreenE: "Green",
    Orange: "Orange", Blue: "Blue",
  };
  for (const [seqName, seq] of Object.entries(LINE_SEQUENCES)) {
    const line = lineMap[seqName];
    for (const stopId of seq) {
      if (STOPS[stopId] && !STOPS[stopId].lines.includes(line)) {
        STOPS[stopId].lines.push(line);
      }
    }
  }
}

// ── Load stop data from MBTA API, fall back to hardcoded if unavailable ───────
async function loadStops(apiKey) {
  const allIds = [...new Set(Object.values(LINE_SEQUENCES).flat())];

  if (apiKey) {
    try {
      // Batch into chunks of 50 to stay within URL length limits
      const chunkSize = 50;
      for (let i = 0; i < allIds.length; i += chunkSize) {
        const chunk = allIds.slice(i, i + chunkSize).join(",");
        const url = `https://api-v3.mbta.com/stops?filter[id]=${chunk}&api_key=${apiKey}`;
        const json = await httpsGet(url);

        for (const item of json.data || []) {
          const { name, latitude, longitude } = item.attributes;
          if (!STOPS[item.id]) STOPS[item.id] = { name, lines: [], lat: latitude, lng: longitude };
        }
      }

      assignLines();
      console.log(`[MBTA] Loaded ${Object.keys(STOPS).length} stops from MBTA API`);
      return;
    } catch (err) {
      console.warn(`[MBTA] API fetch failed (${err.message}), using fallback data.`);
    }
  } else {
    console.warn("[MBTA] No MBTA_API_KEY set — using fallback stop data. Add one to .env for live data.");
  }

  // Fallback: use hardcoded coordinates
  for (const [id, data] of Object.entries(FALLBACK_STOPS)) {
    STOPS[id] = { ...data, lines: [] };
  }
  assignLines();
  console.log(`[MBTA] Loaded ${Object.keys(STOPS).length} stops from fallback data`);
}

module.exports = { STOPS, LINE_SEQUENCES, LINE_TERMINALS, LINE_COLORS, LANDMARKS, loadStops };
