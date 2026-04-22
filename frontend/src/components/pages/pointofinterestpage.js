import React, { useMemo, useState } from "react";
import axios from "axios";
import "../../exbosHome.css";

const MILES_TO_METERS = 1609.34;

const STOPS = [
  // 🔴 RED LINE
  { stopId: "place-alfcl", stopName: "Alewife", latitude: 42.3954, longitude: -71.1426, line: "Red" },
  { stopId: "place-davis", stopName: "Davis", latitude: 42.3967, longitude: -71.1220, line: "Red" },
  { stopId: "place-portr", stopName: "Porter", latitude: 42.3888, longitude: -71.1192, line: "Red" },
  { stopId: "place-harsq", stopName: "Harvard", latitude: 42.3736, longitude: -71.1190, line: "Red" },
  { stopId: "place-cntsq", stopName: "Central Square", latitude: 42.3652, longitude: -71.1036, line: "Red" },
  { stopId: "place-knncl", stopName: "Kendall/MIT", latitude: 42.3625, longitude: -71.0862, line: "Red" },
  { stopId: "place-chmnl", stopName: "Charles/MGH", latitude: 42.3614, longitude: -71.0707, line: "Red" },
  { stopId: "place-pktrm", stopName: "Park Street", latitude: 42.3563, longitude: -71.0624, line: "Red" },
  { stopId: "place-dwnxg", stopName: "Downtown Crossing", latitude: 42.3555, longitude: -71.0601, line: "Red" },
  { stopId: "place-sstat", stopName: "South Station", latitude: 42.3519, longitude: -71.0553, line: "Red" },
  { stopId: "place-brdwy", stopName: "Broadway", latitude: 42.3427, longitude: -71.0568, line: "Red" },
  { stopId: "place-andrw", stopName: "Andrew", latitude: 42.3306, longitude: -71.0571, line: "Red" },
  { stopId: "place-jfk", stopName: "JFK/UMass", latitude: 42.3202, longitude: -71.0522, line: "Red" },
  { stopId: "place-shmnl", stopName: "Shawmut", latitude: 42.2926, longitude: -71.0659, line: "Red" },
  { stopId: "place-asmnl", stopName: "Ashmont", latitude: 42.2849, longitude: -71.0635, line: "Red" },
  { stopId: "place-nqncy", stopName: "North Quincy", latitude: 42.2750, longitude: -71.0285, line: "Red" },
  { stopId: "place-wlsta", stopName: "Wollaston", latitude: 42.2668, longitude: -71.0205, line: "Red" },
  { stopId: "place-qnctr", stopName: "Quincy Center", latitude: 42.2514, longitude: -71.0052, line: "Red" },
  { stopId: "place-qamnl", stopName: "Quincy Adams", latitude: 42.2333, longitude: -71.0070, line: "Red" },
  { stopId: "place-brntn", stopName: "Braintree", latitude: 42.2078, longitude: -71.0008, line: "Red" },

  // 🟠 ORANGE LINE
  { stopId: "place-ogmnl", stopName: "Oak Grove", latitude: 42.4365, longitude: -71.0709, line: "Orange" },
  { stopId: "place-mlmnl", stopName: "Malden Center", latitude: 42.4264, longitude: -71.0685, line: "Orange" },
  { stopId: "place-welln", stopName: "Wellington", latitude: 42.4021, longitude: -71.0773, line: "Orange" },
  { stopId: "place-astao", stopName: "Assembly", latitude: 42.3920, longitude: -71.0771, line: "Orange" },
  { stopId: "place-sull", stopName: "Sullivan Square", latitude: 42.3836, longitude: -71.0763, line: "Orange" },
  { stopId: "place-ccmnl", stopName: "Community College", latitude: 42.3729, longitude: -71.0694, line: "Orange" },
  { stopId: "place-north", stopName: "North Station", latitude: 42.3661, longitude: -71.0617, line: "Orange" },
  { stopId: "place-haecl", stopName: "Haymarket", latitude: 42.3628, longitude: -71.0579, line: "Orange" },
  { stopId: "place-state", stopName: "State", latitude: 42.3589, longitude: -71.0577, line: "Orange" },
  { stopId: "place-dwnxg", stopName: "Downtown Crossing", latitude: 42.3555, longitude: -71.0601, line: "Orange" },
  { stopId: "place-chncl", stopName: "Chinatown", latitude: 42.3519, longitude: -71.0622, line: "Orange" },
  { stopId: "place-tumnl", stopName: "Tufts Medical Center", latitude: 42.3485, longitude: -71.0633, line: "Orange" },
  { stopId: "place-bbsta", stopName: "Back Bay", latitude: 42.3469, longitude: -71.0751, line: "Orange" },
  { stopId: "place-masta", stopName: "Massachusetts Ave", latitude: 42.3413, longitude: -71.0831, line: "Orange" },
  { stopId: "place-rugg", stopName: "Ruggles", latitude: 42.3363, longitude: -71.0897, line: "Orange" },
  { stopId: "place-rcmnl", stopName: "Roxbury Crossing", latitude: 42.3313, longitude: -71.0952, line: "Orange" },
  { stopId: "place-jaksn", stopName: "Jackson Square", latitude: 42.3233, longitude: -71.1005, line: "Orange" },
  { stopId: "place-sbmnl", stopName: "Stony Brook", latitude: 42.3178, longitude: -71.1044, line: "Orange" },
  { stopId: "place-grmnl", stopName: "Green Street", latitude: 42.3104, longitude: -71.1074, line: "Orange" },
  { stopId: "place-forhl", stopName: "Forest Hills", latitude: 42.3004, longitude: -71.1136, line: "Orange" },

  // 🔵 BLUE LINE
  { stopId: "place-wondl", stopName: "Wonderland", latitude: 42.4136, longitude: -70.9918, line: "Blue" },
  { stopId: "place-rbmnl", stopName: "Revere Beach", latitude: 42.4077, longitude: -70.9924, line: "Blue" },
  { stopId: "place-bmmnl", stopName: "Beachmont", latitude: 42.3971, longitude: -70.9923, line: "Blue" },
  { stopId: "place-sdmnl", stopName: "Suffolk Downs", latitude: 42.3906, longitude: -70.9975, line: "Blue" },
  { stopId: "place-orhte", stopName: "Orient Heights", latitude: 42.3859, longitude: -71.0047, line: "Blue" },
  { stopId: "place-wimnl", stopName: "Wood Island", latitude: 42.3791, longitude: -71.0226, line: "Blue" },
  { stopId: "place-aport", stopName: "Airport", latitude: 42.3737, longitude: -71.0302, line: "Blue" },
  { stopId: "place-mvbcl", stopName: "Maverick", latitude: 42.3693, longitude: -71.0397, line: "Blue" },
  { stopId: "place-aqucl", stopName: "Aquarium", latitude: 42.3590, longitude: -71.0521, line: "Blue" },
  { stopId: "place-state", stopName: "State", latitude: 42.3589, longitude: -71.0577, line: "Blue" },
  { stopId: "place-gover", stopName: "Government Center", latitude: 42.3594, longitude: -71.0591, line: "Blue" },
  { stopId: "place-bomnl", stopName: "Bowdoin", latitude: 42.3613, longitude: -71.0620, line: "Blue" },

  // 🟢 GREEN LINE
  { stopId: "place-lech", stopName: "Lechmere", latitude: 42.3698, longitude: -71.0765, line: "Green" },
  { stopId: "place-spmnl", stopName: "Science Park", latitude: 42.3665, longitude: -71.0688, line: "Green" },
  { stopId: "place-north", stopName: "North Station", latitude: 42.3661, longitude: -71.0617, line: "Green" },
  { stopId: "place-haecl", stopName: "Haymarket", latitude: 42.3628, longitude: -71.0579, line: "Green" },
  { stopId: "place-gover", stopName: "Government Center", latitude: 42.3594, longitude: -71.0591, line: "Green" },
  { stopId: "place-pktrm", stopName: "Park Street", latitude: 42.3563, longitude: -71.0624, line: "Green" },
  { stopId: "place-boyls", stopName: "Boylston", latitude: 42.3519, longitude: -71.0624, line: "Green" },
  { stopId: "place-armnl", stopName: "Arlington", latitude: 42.3512, longitude: -71.0706, line: "Green" },
  { stopId: "place-coecl", stopName: "Copley", latitude: 42.3498, longitude: -71.0771, line: "Green" },
  { stopId: "place-hymnl", stopName: "Hynes Convention Center", latitude: 42.3488, longitude: -71.0877, line: "Green" },
  { stopId: "place-kencl", stopName: "Kenmore", latitude: 42.3485, longitude: -71.0960, line: "Green" },
  { stopId: "place-fenwy", stopName: "Fenway", latitude: 42.3450, longitude: -71.1049, line: "Green" },
  { stopId: "place-longw", stopName: "Longwood", latitude: 42.3416, longitude: -71.1099, line: "Green" },
  { stopId: "place-bvmnl", stopName: "Brookline Village", latitude: 42.3325, longitude: -71.1180, line: "Green" },
  { stopId: "place-prmnl", stopName: "Prudential", latitude: 42.3469, longitude: -71.0824, line: "Green" },
  { stopId: "place-symcl", stopName: "Symphony", latitude: 42.3430, longitude: -71.0851, line: "Green" },
  { stopId: "place-nuniv", stopName: "Northeastern University", latitude: 42.3400, longitude: -71.0893, line: "Green" },
  { stopId: "place-mfa", stopName: "Museum of Fine Arts", latitude: 42.3365, longitude: -71.0985, line: "Green" },
  { stopId: "place-lngmd", stopName: "Longwood Medical Area", latitude: 42.3385, longitude: -71.1020, line: "Green" },
  { stopId: "place-hsmnl", stopName: "Heath Street", latitude: 42.3261, longitude: -71.1119, line: "Green" },
];

const lineOrder = ["Red", "Orange", "Blue", "Green"];

const lineColors = {
  Red: "#DA291C",
  Orange: "#ED8B00",
  Blue: "#003DA5",
  Green: "#00843D",
};

const PointOfInterestPage = () => {
  const [selectedStop, setSelectedStop] = useState(null);
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const groupedStops = useMemo(() => {
    const groups = {};
    STOPS.forEach((stop) => {
      if (!groups[stop.line]) groups[stop.line] = [];
      groups[stop.line].push(stop);
    });

    Object.keys(groups).forEach((line) => {
      groups[line].sort((a, b) => a.stopName.localeCompare(b.stopName));
    });

    return groups;
  }, []);

  const handleStopClick = async (stop) => {
    setSelectedStop(stop);
    setLoading(true);
    setError("");
    setPois([]);

    try {
      const response = await axios.post("http://localhost:8081/api/pois/nearby", {
        latitude: Number(stop.latitude),
        longitude: Number(stop.longitude),
        radius: MILES_TO_METERS,
      });

      const formattedPois = (response.data || []).map((poi) => ({
        ...poi,
        distanceMiles:
          poi.distanceMeters != null
            ? (poi.distanceMeters / MILES_TO_METERS).toFixed(2)
            : null,
      }));

      setPois(formattedPois);
    } catch (err) {
      setError("Failed to load nearby places.");
      setPois([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--eb-bg)",
        fontFamily: "var(--eb-font)",
        padding: "30px 20px 50px",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #003DA5 0%, #1458d4 55%, #0ea5e9 100%)",
            borderRadius: "20px",
            padding: "36px",
            color: "white",
            marginBottom: "28px",
            boxShadow: "0 14px 35px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ maxWidth: "720px" }}>
            <div
              style={{
                display: "inline-block",
                background: "rgba(255,255,255,0.16)",
                padding: "8px 14px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: "700",
                marginBottom: "14px",
              }}
            >
              Explore Boston by MBTA
            </div>

            <h1 style={{ margin: 0, fontSize: "38px", lineHeight: "1.1" }}>
              Discover attractions near every stop
            </h1>

            <p
              style={{
                marginTop: "14px",
                marginBottom: 0,
                fontSize: "16px",
                lineHeight: "1.7",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              Browse MBTA stops by line and explore nearby places within 1 mile.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.95fr 1.05fr",
            gap: "22px",
            alignItems: "start",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "var(--eb-white)",
              borderRadius: "18px",
              padding: "18px",
              boxShadow: "var(--eb-shadow)",
              border: "1px solid var(--eb-border)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "8px", fontSize: "22px", color: "var(--eb-text)" }}>
              MBTA Map
            </h2>

            <p style={{ marginBottom: "14px", fontSize: "14px", color: "var(--eb-muted)" }}>
              Use the map as a visual guide while selecting a stop to view nearby places.
            </p>

            <img
              src="/MBTAPIC.png"
              alt="MBTA Map"
              style={{
                width: "100%",
                height: "260px",
                objectFit: "cover",
                borderRadius: "14px",
                border: "1px solid var(--eb-border)",
              }}
            />
          </div>

          <div
            style={{
              background: "var(--eb-white)",
              borderRadius: "18px",
              padding: "22px",
              boxShadow: "var(--eb-shadow)",
              border: "1px solid var(--eb-border)",
              maxHeight: "620px",
              overflowY: "auto",
            }}
          >
            <h2 style={{ marginBottom: "8px", fontSize: "22px", color: "var(--eb-text)" }}>Stops</h2>

            <p style={{ marginBottom: "18px", fontSize: "14px", color: "var(--eb-muted)" }}>
              Select a stop to see nearby places.
            </p>

            {lineOrder.map((line) => (
              <div key={line} style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "999px",
                      background: lineColors[line],
                    }}
                  />
                  <h3 style={{ margin: 0, fontSize: "16px", color: "var(--eb-text)" }}>{line} Line</h3>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {(groupedStops[line] || []).map((stop) => (
                    <button
                      key={stop.stopId}
                      onClick={() => handleStopClick(stop)}
                      style={{
                        padding: "14px",
                        borderRadius: "12px",
                        border:
                          selectedStop?.stopId === stop.stopId
                            ? "2px solid #2563eb"
                            : "1px solid var(--eb-border)",
                        background:
                          selectedStop?.stopId === stop.stopId ? "#eff6ff" : "var(--eb-bg)",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--eb-text)" }}>
                        {stop.stopName}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--eb-muted)", marginTop: "4px" }}>
                        {line} Line
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "var(--eb-white)",
            borderRadius: "20px",
            padding: "26px",
            boxShadow: "var(--eb-shadow)",
            border: "1px solid var(--eb-border)",
          }}
        >
          <h2 style={{ fontSize: "26px", color: "var(--eb-text)" }}>
            {selectedStop ? `Places near ${selectedStop.stopName}` : "Nearby Places"}
          </h2>

          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && !error && selectedStop && pois.length === 0 && (
            <p>No places found within 1 mile of this stop.</p>
          )}

          {!loading &&
            !error &&
            pois.map((poi, index) => (
              <div key={`${poi.name}-${index}`} style={{ marginBottom: "14px" }}>
                <h3 style={{ marginBottom: "6px", color: "var(--eb-text)" }}>{poi.name}</h3>
                <p style={{ margin: "0 0 4px 0", color: "var(--eb-text)" }}>{poi.address}</p>
                <p style={{ margin: 0, color: "var(--eb-muted)" }}>
                  {poi.category}
                  {poi.distanceMiles !== null ? ` • ${poi.distanceMiles} miles away` : ""}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PointOfInterestPage;