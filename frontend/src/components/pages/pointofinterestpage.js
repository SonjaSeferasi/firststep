import React, { useState } from "react";
import axios from "axios";

const STOPS = [
  { stopId: "place-dwnxg", stopName: "Downtown Crossing", area: "Shopping • Food • City Center" },
  { stopId: "place-pktrm", stopName: "Park Street", area: "Boston Common • Historic Sites" },
  { stopId: "place-haecl", stopName: "Haymarket", area: "Markets • Restaurants • Downtown" },
  { stopId: "place-boyls", stopName: "Boylston", area: "Theater District • Parks • Dining" },
];

const PointOfInterestPage = () => {
  const [selectedStop, setSelectedStop] = useState(null);
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStopClick = async (stop) => {
    setSelectedStop(stop);
    setLoading(true);
    setError("");

    try {
      const response = await axios.get("http://localhost:8081/api/pois");
      const filtered = response.data.pois.filter(
        (poi) => poi.stopId === stop.stopId
      );
      setPois(filtered);
    } catch (err) {
      setError("Failed to load nearby attractions.");
      setPois([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #f4f8fc, #edf4fb)",
        fontFamily: "Arial, sans-serif",
        padding: "30px 20px 50px",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>

        {/* HERO */}
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
              Browse featured MBTA stops and explore nearby attractions such as
              restaurants, parks, museums, and local landmarks.
            </p>
          </div>
        </div>

        {/* TOP SECTION */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.95fr 1.05fr",
            gap: "22px",
            alignItems: "start",
            marginBottom: "24px",
          }}
        >
          {/* MAP */}
          <div
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "18px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.07)",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "8px", fontSize: "22px" }}>
              MBTA Map
            </h2>

            <p style={{ marginBottom: "14px", fontSize: "14px", color: "#6b7280" }}>
              Use the map as a visual guide while selecting a stop to view nearby attractions.
            </p>

            <img
              src="/MBTAPIC.png"
              alt="MBTA Map"
              style={{
                width: "100%",
                height: "260px",
                objectFit: "cover",
                borderRadius: "14px",
                border: "1px solid #e5e7eb",
              }}
            />
          </div>

          {/* STOPS */}
          <div
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "22px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.07)",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2 style={{ marginBottom: "8px", fontSize: "22px" }}>
              Featured Stops
            </h2>

            <p style={{ marginBottom: "18px", fontSize: "14px", color: "#6b7280" }}>
              Select a stop to see nearby attractions.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {STOPS.map((stop) => (
                <button
                  key={stop.stopId}
                  onClick={() => handleStopClick(stop)}
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    border:
                      selectedStop?.stopId === stop.stopId
                        ? "2px solid #2563eb"
                        : "1px solid #dbe3ef",
                    background:
                      selectedStop?.stopId === stop.stopId ? "#eff6ff" : "#f9fbfd",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontWeight: "700", fontSize: "15px" }}>
                    {stop.stopName}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {stop.area}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ATTRACTIONS */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "26px",
            boxShadow: "0 10px 28px rgba(0,0,0,0.07)",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ fontSize: "26px" }}>
            {selectedStop
              ? `Attractions near ${selectedStop.stopName}`
              : "Nearby Attractions"}
          </h2>

          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && !error && pois.map((poi) => (
            <div key={poi._id} style={{ marginBottom: "12px" }}>
              <h3>{poi.name}</h3>
              <p>{poi.category} • {poi.distanceMeters} meters</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default PointOfInterestPage;