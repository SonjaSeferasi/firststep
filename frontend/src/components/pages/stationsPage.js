import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../../exbosHome.css";

const StationsPage = () => {
  const { stopId } = useParams();
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [selectedStopId, setSelectedStopId] = useState(null);
  const [stationDetail, setStationDetail] = useState(null);
  const [mbtaStop, setMbtaStop] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState("text");
  const [selectedLineFilter, setSelectedLineFilter] = useState("");
  const [selectedLineStationId, setSelectedLineStationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mbtaLoading, setMbtaLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [mbtaError, setMbtaError] = useState("");

  const parseWheelchairLabel = (value) => {
    if (value === 1) return "Accessible";
    if (value === 2) return "Not accessible";
    return "Unknown";
  };

  const safeArray = (value) => (Array.isArray(value) ? value : []);

  const stationSearchInputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    fontSize: "15px",
    boxSizing: "border-box",
    color: "#111827",
    outline: "none",
    background: "#fff",
  };

  const modeButtonStyle = function(active) {
    return {
      padding: "10px 16px",
      borderRadius: "12px",
      border: active ? "1px solid #003DA5" : "1px solid #d1d5db",
      background: active ? "#eff6ff" : "#f8fafc",
      color: active ? "#003DA5" : "#374151",
      fontWeight: active ? 700 : 500,
      cursor: "pointer",
      flex: 1,
      minWidth: 140,
    };
  };

  useEffect(() => {
    const loadStations = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("http://localhost:8081/api/stations");
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        const data = await response.json();
        setStations(data.stations || []);
        setFilteredStations(data.stations || []);
      } catch (err) {
        setError("Unable to load stations. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, []);

  useEffect(() => {
    const filtered = stations.filter((station) => {
      const linesText = safeArray(station.lines).join(" ");
      if (searchMode === "line") {
        if (selectedLineFilter && !safeArray(station.lines).includes(selectedLineFilter)) {
          return false;
        }
        if (selectedLineStationId) {
          return station.stopId === selectedLineStationId;
        }
      }
      return station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        linesText.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredStations(filtered);
  }, [searchTerm, stations, searchMode, selectedLineFilter, selectedLineStationId]);

  useEffect(() => {
    if (stopId && stations.length > 0) {
      const match = stations.find((station) => station.stopId === stopId);
      if (match) {
        setSelectedStopId(stopId);
      }
    }
  }, [stopId, stations]);

  useEffect(() => {
    if (!selectedStopId) {
      setStationDetail(null);
      setMbtaStop(null);
      setDetailError("");
      setMbtaError("");
      return;
    }

    const loadDetail = async () => {
      setDetailLoading(true);
      setDetailError("");

      try {
        const response = await fetch(`http://localhost:8081/api/stations/${selectedStopId}`);
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        const data = await response.json();
        setStationDetail(data);
      } catch (err) {
        setDetailError("Unable to load station details.");
      } finally {
        setDetailLoading(false);
      }
    };

    const loadMbtaData = async () => {
      setMbtaLoading(true);
      setMbtaError("");
      setMbtaStop(null);

      try {
        const response = await fetch(`https://api-v3.mbta.com/stops/${selectedStopId}`);
        if (!response.ok) throw new Error(`MBTA returned ${response.status}`);
        const data = await response.json();
        const attrs = data?.data?.attributes;
        setMbtaStop(attrs || null);
      } catch (err) {
        setMbtaError("Unable to load MBTA stop metadata.");
      } finally {
        setMbtaLoading(false);
      }
    };

    loadDetail();
    loadMbtaData();
  }, [selectedStopId]);

  return (
    <div className="eb-page" style={{ padding: "36px 24px" }}>
      <div className="eb-main" style={{ gridTemplateColumns: "1.3fr 0.9fr", gap: 26 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <section style={{ display: "grid", gap: 12 }}>
            <div style={{ background: "white", borderRadius: 24, padding: 24, border: "1px solid #e5e7eb", boxShadow: "var(--eb-shadow)" }}>
              <h1 style={{ margin: 0, fontFamily: "var(--eb-font-h)", fontSize: 34, color: "var(--eb-text)" }}>MBTA Stations</h1>
              <p style={{ margin: "12px 0 0", color: "var(--eb-muted)", maxWidth: 720, lineHeight: 1.7 }}>
                Browse MBTA station listings, see station attributes from the MBTA API, and jump straight to reviews for each stop.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
              <div style={{ background: "white", borderRadius: 18, padding: 18, border: "1px solid #e5e7eb", boxShadow: "var(--eb-shadow)" }}>
                <div style={{ color: "var(--eb-muted)", fontSize: 13 }}>Stations found</div>
                <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: "var(--eb-text)" }}>{filteredStations.length}</div>
              </div>
              <div style={{ background: "linear-gradient(135deg,#003DA5 0%,#1d4ed8 100%)", borderRadius: 18, color: "white", padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 10 }}>Selected station</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{selectedStopId || "None"}</div>
              </div>
            </div>
          </section>

          <section style={{ background: "white", borderRadius: 24, padding: 20, border: "1px solid #e5e7eb", boxShadow: "var(--eb-shadow)" }}>
            <div style={{ marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                style={modeButtonStyle(searchMode === "text")}
                onClick={() => {
                  setSearchMode("text");
                  setSelectedLineFilter("");
                  setSelectedLineStationId("");
                }}
              >
                Search by station
              </button>
              <button
                type="button"
                style={modeButtonStyle(searchMode === "line")}
                onClick={() => {
                  setSearchMode("line");
                  setSearchTerm("");
                }}
              >
                Search by line
              </button>
            </div>

            {searchMode === "text" ? (
              <div style={{ position: "relative" }}>
                <label style={{ fontWeight: 600, display: "block", marginBottom: 8, color: "#374151" }}>
                  Search stations
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by station name or line"
                  style={stationSearchInputStyle}
                />
              </div>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <label style={{ fontWeight: 600, display: "block", marginBottom: 8, color: "#374151" }}>
                    Line
                  </label>
                  <select
                    value={selectedLineFilter}
                    onChange={(e) => {
                      setSelectedLineFilter(e.target.value);
                      setSelectedLineStationId("");
                      setSelectedStopId(null);
                    }}
                    style={stationSearchInputStyle}
                  >
                    <option value="">Select a line</option>
                    {Array.from(new Set(stations.flatMap((station) => safeArray(station.lines))))
                      .sort()
                      .map((line) => (
                        <option key={line} value={line}>{line}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: "block", marginBottom: 8, color: "#374151" }}>
                    Station
                  </label>
                  <select
                    value={selectedLineStationId}
                    onChange={(e) => {
                      setSelectedLineStationId(e.target.value);
                      setSelectedStopId(e.target.value || null);
                    }}
                    disabled={!selectedLineFilter}
                    style={stationSearchInputStyle}
                  >
                    <option value="">{selectedLineFilter ? "Select a station" : "Choose a line first"}</option>
                    {stations
                      .filter((station) => safeArray(station.lines).includes(selectedLineFilter))
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((station) => (
                        <option key={station.stopId} value={station.stopId}>{station.name}</option>
                      ))}
                  </select>
                </div>
              </div>
            )}
          </section>

          <section style={{ display: "grid", gap: 14 }}>
            {loading && <div style={{ color: "var(--eb-muted)" }}>Loading stations...</div>}
            {error && <div style={{ color: "#be123c" }}>{error}</div>}
            {!loading && !error && filteredStations.length === 0 && (
              <div style={{ color: "var(--eb-muted)" }}>No stations matched your search.</div>
            )}
            {filteredStations.map((station) => (
              <div
                key={station.stopId}
                onClick={() => setSelectedStopId(station.stopId)}
                role="button"
                tabIndex={0}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 14,
                  alignItems: "center",
                  width: "100%",
                  textAlign: "left",
                  borderRadius: 20,
                  border: selectedStopId === station.stopId ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                  background: selectedStopId === station.stopId ? "#eff6ff" : "white",
                  padding: "18px 20px",
                  cursor: "pointer",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: "var(--eb-text)", marginBottom: 8 }}>{station.name}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    {safeArray(station.lines).map((line) => (
                      <span key={line} style={{ background: "#eff6ff", color: "#1d4ed8", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                        {line}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, max-content))", gap: 10, color: "#4b5563", fontSize: 13 }}>
                    <span>Stop ID: {station.stopId}</span>
                    <span>{safeArray(station.reviews).length} review{safeArray(station.reviews).length === 1 ? "" : "s"}</span>
                  </div>
                </div>
                <Link
                  to={`/reviews?stationId=${encodeURIComponent(station.stopId)}&stationName=${encodeURIComponent(station.name)}`}
                  style={{
                    padding: "10px 14px",
                    background: "#003DA5",
                    color: "white",
                    borderRadius: 14,
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 700,
                    alignSelf: "center",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Review
                </Link>
              </div>
            ))}
          </section>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "white", borderRadius: 24, border: "1px solid #e5e7eb", boxShadow: "var(--eb-shadow)", padding: 24 }}>
            <h2 style={{ margin: 0, fontSize: 22, color: "var(--eb-text)" }}>Station Details</h2>
            <p style={{ color: "var(--eb-muted)", marginTop: 10 }}>Selected station details come from both the app API and the MBTA stop API.</p>

            {detailLoading && <p style={{ color: "var(--eb-muted)", marginTop: 16 }}>Loading details...</p>}
            {detailError && <p style={{ color: "#be123c", marginTop: 16 }}>{detailError}</p>}
            {mbtaLoading && !detailLoading && <p style={{ color: "var(--eb-muted)", marginTop: 16 }}>Fetching MBTA stop metadata...</p>}
            {mbtaError && <p style={{ color: "#be123c", marginTop: 16 }}>{mbtaError}</p>}

            {!selectedStopId && !detailLoading && (
              <p style={{ color: "var(--eb-muted)", marginTop: 16 }}>Click a station on the left to reveal more information.</p>
            )}

            {stationDetail && (
              <div style={{ display: "grid", gap: 18, marginTop: 18 }}>
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--eb-text)" }}>{stationDetail.name}</div>
                  <div style={{ color: "var(--eb-muted)", fontSize: 14 }}>Stop ID: {stationDetail.stopId}</div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {safeArray(stationDetail.lines).map((line) => (
                    <span key={line} style={{ background: "#eff6ff", borderRadius: 999, padding: "7px 11px", color: "#1d4ed8", fontSize: 12, fontWeight: 700 }}>
                      {line}
                    </span>
                  ))}
                </div>

                <div style={{ display: "grid", gap: 10, background: "#f8fafc", borderRadius: 18, padding: 16, border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 13, color: "var(--eb-muted)" }}>MBTA station summary</span>
                    <div style={{ fontSize: 15, color: "var(--eb-text)", fontWeight: 600 }}>See platform details, address and accessibility data.</div>
                  </div>
                  {mbtaStop && (
                    <div style={{ display: "grid", gap: 10 }}>
                      {mbtaStop.description && <div><strong>Description:</strong> {mbtaStop.description}</div>}
                      {mbtaStop.address && <div><strong>Address:</strong> {mbtaStop.address}</div>}
                      {mbtaStop.platform_code && <div><strong>Platform:</strong> {mbtaStop.platform_code}</div>}
                      {mbtaStop.direction_names && mbtaStop.direction_names.length > 0 && (
                        <div><strong>Directions:</strong> {mbtaStop.direction_names.join(" / ")}</div>
                      )}
                      <div><strong>Wheelchair access:</strong> {parseWheelchairLabel(mbtaStop.wheelchair_boarding)}</div>
                      {mbtaStop.zone_id && <div><strong>Zone:</strong> {mbtaStop.zone_id}</div>}
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gap: 10, borderRadius: 18, border: "1px solid #e5e7eb", padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
                    <span style={{ color: "var(--eb-muted)", fontSize: 13 }}>Review count</span>
                    <span style={{ fontWeight: 700, color: "var(--eb-text)" }}>{safeArray(stationDetail.reviews).length}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
                    <span style={{ color: "var(--eb-muted)", fontSize: 13 }}>Latest review</span>
                    <span style={{ color: "var(--eb-text)", fontWeight: 700 }}>
                      {safeArray(stationDetail.reviews).length ? safeArray(stationDetail.reviews)[0].reviewText?.slice(0, 26) + (safeArray(stationDetail.reviews)[0].reviewText?.length > 26 ? "..." : "") : "No reviews yet"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <Link
                    to={`/reviews?stationId=${encodeURIComponent(stationDetail.stopId)}&stationName=${encodeURIComponent(stationDetail.name)}`}
                    style={{
                      flex: 1,
                      minWidth: 160,
                      padding: "12px 16px",
                      background: "#003DA5",
                      color: "white",
                      borderRadius: 16,
                      textAlign: "center",
                      textDecoration: "none",
                      fontWeight: 700,
                    }}
                  >
                    Review this station
                  </Link>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StationsPage;
