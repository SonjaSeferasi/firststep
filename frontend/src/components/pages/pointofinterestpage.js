import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../../exbosHome.css";

const MILES_TO_METERS = 1609.34;

const lineOrder = ["Red", "Orange", "Blue", "Green"];

const lineColors = {
  Red: "#DA291C",
  Orange: "#ED8B00",
  Blue: "#003DA5",
  Green: "#00843D",
};

const PointOfInterestPage = () => {
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stopsLoading, setStopsLoading] = useState(false);
  const [error, setError] = useState("");
  const [openLines, setOpenLines] = useState({});

  useEffect(() => {
    const fetchStops = async () => {
      setStopsLoading(true);
      setError("");

      try {
        const response = await axios.get("http://localhost:8081/api/stations");

        const stations = response.data.stations || [];

        const formattedStops = stations.flatMap((station) => {
          const lines = station.lines || [];

          return lines.map((line) => ({
            stopId: station.stopId,
            stopName: station.name,
            latitude: station.lat,
            longitude: station.lng,
            line,
          }));
        });

        setStops(formattedStops);
      } catch (err) {
        console.error(err);
        setError("Failed to load MBTA stops.");
      } finally {
        setStopsLoading(false);
      }
    };

    fetchStops();
  }, []);

  const groupedStops = useMemo(() => {
    const groups = {};

    stops.forEach((stop) => {
      if (!stop.line) return;

      if (!groups[stop.line]) {
        groups[stop.line] = [];
      }

      groups[stop.line].push(stop);
    });

    Object.keys(groups).forEach((line) => {
      groups[line].sort((a, b) => a.stopName.localeCompare(b.stopName));
    });

    return groups;
  }, [stops]);

  const toggleLine = (line) => {
    setOpenLines((prev) => ({
      ...prev,
      [line]: !prev[line],
    }));
  };

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
      console.error(err);
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
            background:
              "linear-gradient(135deg, #003DA5 0%, #1458d4 55%, #0ea5e9 100%)",
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
            <h2
              style={{
                marginTop: 0,
                marginBottom: "8px",
                fontSize: "22px",
                color: "var(--eb-text)",
              }}
            >
              MBTA Map
            </h2>

            <p
              style={{
                marginBottom: "14px",
                fontSize: "14px",
                color: "var(--eb-muted)",
              }}
            >
              Use the map as a visual guide while selecting a stop to view nearby
              places.
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
            <h2
              style={{
                marginBottom: "8px",
                fontSize: "22px",
                color: "var(--eb-text)",
              }}
            >
              Stops
            </h2>

            <p
              style={{
                marginBottom: "18px",
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              Select a line to expand its stops.
            </p>

            {stopsLoading && <p>Loading MBTA stops...</p>}

            {!stopsLoading &&
              lineOrder.map((line) => (
                <div key={line} style={{ marginBottom: "12px" }}>
                  <button
                    onClick={() => toggleLine(line)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "1px solid #dbe3ef",
                      background: "#f9fbfd",
                      cursor: "pointer",
                      fontWeight: "700",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "999px",
                          background: lineColors[line],
                        }}
                      />
                      {line} Line ({groupedStops[line]?.length || 0})
                    </span>

                    <span>{openLines[line] ? "▲" : "▼"}</span>
                  </button>

                  {openLines[line] && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "10px",
                        marginTop: "12px",
                      }}
                    >
                      {(groupedStops[line] || []).map((stop) => (
                        <button
                          key={`${stop.line}-${stop.stopId}`}
                          onClick={() => handleStopClick(stop)}
                          style={{
                            padding: "14px",
                            borderRadius: "12px",
                            border:
                              selectedStop?.stopId === stop.stopId &&
                              selectedStop?.line === stop.line
                                ? "2px solid #2563eb"
                                : "1px solid #dbe3ef",
                            background:
                              selectedStop?.stopId === stop.stopId &&
                              selectedStop?.line === stop.line
                                ? "#eff6ff"
                                : "white",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <div style={{ fontWeight: "700", fontSize: "14px" }}>
                            {stop.stopName}
                          </div>

                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              marginTop: "4px",
                            }}
                          >
                            {line} Line
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
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

          {!loading && !error && !selectedStop && (
            <p>Select a stop to view nearby places.</p>
          )}

          {!loading && !error && selectedStop && pois.length === 0 && (
            <p>No places found within 1 mile of this stop.</p>
          )}

          {!loading &&
            !error &&
            pois.map((poi, index) => (
              <div key={`${poi.name}-${index}`} style={{ marginBottom: "14px" }}>
                <h3 style={{ marginBottom: "6px", color: "var(--eb-text)" }}>
                  {poi.name}
                </h3>

                <p style={{ margin: "0 0 4px 0", color: "var(--eb-text)" }}>
                  {poi.address}
                </p>

                <p style={{ margin: 0, color: "var(--eb-muted)" }}>
                  {poi.category}
                  {poi.distanceMiles !== null
                    ? ` • ${poi.distanceMiles} miles away`
                    : ""}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};


export default PointOfInterestPage; 