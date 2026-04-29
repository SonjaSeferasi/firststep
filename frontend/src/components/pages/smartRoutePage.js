import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import "../../exbosHome.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from "react-leaflet";
import getUserInfo from "../../utilities/decodeJwt";

/* ── SVG Icons ── */
const IcoSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IcoGps = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
  </svg>
);
const IcoTransfer = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const IcoWalk = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="13" cy="4" r="2"/><path d="M14.5 9.5L16 13l3 1-1 1-3.5-1-1.5 3L11 14l-2 1-1-2 2-1 1.5-4z"/>
    <path d="M9 17l-2 4M14 17l1 4"/>
  </svg>
);
const IcoPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const IcoTrain = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    <path d="M7 8h10M7 12h10"/>
  </svg>
);
const IcoCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ── Line dot component ── */
const LineDot = ({ color, size = 10 }) => (
  <span style={{
    display: "inline-block", width: size, height: size,
    borderRadius: "50%", background: color, flexShrink: 0,
  }}/>
);

/* ── Route segment display ── */
const RouteSegment = ({ segment, isLast }) => (
  <div className="sr-segment">
    <div className="sr-seg-header">
      <span className="sr-line-badge" style={{ background: segment.color }}>
        {segment.line}
      </span>
      <span className="sr-seg-dir">{segment.direction}</span>
      <span className="sr-seg-stops">{segment.stopCount} stop{segment.stopCount !== 1 ? "s" : ""}</span>
    </div>

    <div className="sr-stops-list">
      {segment.stops.map((stop, i) => {
        const isFirst = i === 0;
        const isLastStop = i === segment.stops.length - 1;
        const stopId = segment.stopIds?.[i];
        return (
          <div key={i} className={`sr-stop-row ${isFirst ? "sr-board" : isLastStop ? "sr-exit" : ""}`}>
            <div className="sr-stop-dot-col">
              <div className="sr-stop-dot" style={{ background: isFirst || isLastStop ? segment.color : "#CBD5E1" }}/>
              {!isLastStop && <div className="sr-stop-line" style={{ background: segment.color + "40" }}/>}
            </div>
            <div className="sr-stop-name">
              {stopId ? (
                <Link
                  to={`/stations/${stopId}`}
                  style={{ color: "inherit", textDecoration: "none", borderBottom: "1px dotted currentColor" }}
                  title={`View ${stop} station`}
                >
                  {stop}
                </Link>
              ) : stop}
              {isFirst && <span className="sr-action-tag sr-board-tag">Board</span>}
              {isLastStop && !isLast && <span className="sr-action-tag sr-transfer-tag"><IcoTransfer/> Transfer</span>}
              {isLastStop && isLast && <span className="sr-action-tag sr-exit-tag"><IcoCheck/> Exit</span>}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ── Distance formatter ── */
const formatDist = (meters, useMiles) => {
  if (!useMiles) return `${meters}m`;
  const miles = meters * 0.000621371;
  return miles < 0.1 ? `${Math.round(meters * 3.28084)}ft` : `${miles.toFixed(2)}mi`;
};

/* ── Single route card ── */
const RouteCard = ({ route, isRecommended, useMiles }) => (
  <div className={`sr-route-card ${isRecommended ? "sr-recommended" : "sr-alternative"}`}>
    <div className="sr-card-header">
      <div className="sr-card-title">
        {isRecommended && <span className="sr-rec-badge"><IcoCheck/> Recommended</span>}
        {!isRecommended && <span className="sr-alt-badge">Alternative</span>}
        <div className="sr-card-route-label">
          <LineDot color={route.primaryColor} size={12}/>
          <strong>{route.boardingStop}</strong>
          <span className="sr-arrow">→</span>
          <strong>{route.exitStop}</strong>
        </div>
      </div>
      <div className="sr-card-stats">
        <div className="sr-stat">
          <span className="sr-stat-val">{route.estimatedMinutes}</span>
          <span className="sr-stat-lbl">min</span>
        </div>
        <div className="sr-stat">
          <span className="sr-stat-val">{route.transfers}</span>
          <span className="sr-stat-lbl">{route.transfers === 1 ? "transfer" : "transfers"}</span>
        </div>
        <div className="sr-stat">
          <span className="sr-stat-val">{route.totalStops}</span>
          <span className="sr-stat-lbl">stops</span>
        </div>
      </div>
    </div>

    {route.walkToStopMeters > 0 && (
      <div className="sr-walk-row">
        <IcoWalk/>
        <span>
          Walk {formatDist(route.walkToStopMeters, useMiles)} (~{route.walkToStopMinutes} min) to <strong>{route.boardingStop}</strong>
        </span>
      </div>
    )}

    <div className="sr-segments">
      {route.segments.map((seg, i) => (
        <RouteSegment key={i} segment={seg} isLast={i === route.segments.length - 1}/>
      ))}
    </div>
  </div>
);

/* ── Auto-fit map bounds to the route ── */
const FitBounds = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) map.fitBounds(coords, { padding: [32, 32] });
  }, [coords, map]);
  return null;
};

/* ── Route map panel ── */
const RouteMap = ({ result }) => {
  const route = result?.routes?.[0];
  if (!route) return null;

  // Collect [lat, lng] for every stop across all segments
  const allCoords = route.segments.flatMap(seg =>
    (seg.stopCoords || []).map(c => [c.lat, c.lng]).filter(c => c[0] && c[1])
  );
  if (allCoords.length === 0) return null;

  // Origin stop marker
  const originCoord = result.origin?.lat && result.origin?.lng
    ? [result.origin.lat, result.origin.lng]
    : null;
  const originLabel = result.origin?.name || "Origin";

  return (
    <div style={{ marginTop: 20, borderRadius: 14, overflow: "hidden", border: "1px solid var(--eb-border)", boxShadow: "var(--eb-shadow)" }}>
      <div style={{ padding: "10px 16px", background: "var(--eb-white)", borderBottom: "1px solid var(--eb-border)", fontSize: 12, fontWeight: 700, color: "var(--eb-muted)", textTransform: "uppercase", letterSpacing: ".6px" }}>
        Route Map
      </div>
      <MapContainer
        center={allCoords[0]}
        zoom={13}
        style={{ height: 340, width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <FitBounds coords={allCoords} />

        {/* Draw a colored polyline per segment */}
        {route.segments.map((seg, si) => {
          const coords = (seg.stopCoords || [])
            .map(c => [c.lat, c.lng])
            .filter(c => c[0] && c[1]);
          return coords.length > 1
            ? <Polyline key={si} positions={coords} color={seg.color} weight={5} opacity={0.85} />
            : null;
        })}

        {/* Stop markers */}
        {route.segments.map((seg, si) =>
          (seg.stopCoords || []).map((coord, ci) => {
            if (!coord.lat || !coord.lng) return null;
            const isBoard = ci === 0;
            const isExit  = ci === seg.stopCoords.length - 1;
            const isMajor = isBoard || isExit;
            return (
              <CircleMarker
                key={`${si}-${ci}`}
                center={[coord.lat, coord.lng]}
                radius={isMajor ? 9 : 5}
                fillColor={seg.color}
                color="white"
                weight={2}
                fillOpacity={1}
              >
                <Popup>
                  <strong>{seg.stops[ci]}</strong>
                  {isBoard && <><br/><span style={{ color: "#2563EB", fontSize: 11 }}>Board {seg.line} Line</span></>}
                  {isExit && !isBoard && <><br/><span style={{ color: "#16A34A", fontSize: 11 }}>Exit here</span></>}
                </Popup>
              </CircleMarker>
            );
          })
        )}

        {/* Origin stop marker */}
        {originCoord && (
          <CircleMarker
            center={originCoord}
            radius={9}
            fillColor="#3B82F6"
            color="white"
            weight={2}
            fillOpacity={1}
          >
            <Popup><strong>{originLabel}</strong><br/><span style={{ color: "#3B82F6", fontSize: 11 }}>Starting point</span></Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
};

/* ══════════════════════════════
   SMART ROUTE PAGE
══════════════════════════════ */
const SmartRoutePage = () => {
  const [searchParams] = useSearchParams();

  const [destination, setDestination]     = useState(searchParams.get("dest") || "");
  const [originText, setOriginText]       = useState("");   // what the user typed in the origin field
  const [originLat, setOriginLat]         = useState(null); // set only when GPS is active
  const [originLng, setOriginLng]         = useState(null);
  const [gpsStatus, setGpsStatus]         = useState("idle"); // idle | loading | success | denied
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [result, setResult]               = useState(null);
  const [saveStatus, setSaveStatus]       = useState("idle"); // idle | saving | saved | error
  const [useMiles, setUseMiles]           = useState(() => localStorage.getItem("distUnit") === "miles");

  const toggleUnit = () => {
    setUseMiles(prev => {
      const next = !prev;
      localStorage.setItem("distUnit", next ? "miles" : "meters");
      return next;
    });
  };

  // Auto-search if destination (and optional origin) passed via URL query params
  useEffect(() => {
    const dest   = searchParams.get("dest");
    const origin = searchParams.get("origin");
    if (dest) {
      setDestination(dest);
      if (origin) {
        // Retaking a saved trip — pre-fill origin text and search without GPS
        setOriginText(origin);
        setTimeout(() => doSearch(null, null, origin, dest), 50);
      } else {
        detectGPS(true, dest);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the user types in the origin field, clear GPS so text is used instead
  const handleOriginChange = (e) => {
    setOriginText(e.target.value);
    setOriginLat(null);
    setOriginLng(null);
    setGpsStatus("idle");
  };

  const detectGPS = (autoSearch = false, destOverride = null) => {
    if (!navigator.geolocation) {
      setGpsStatus("denied");
      setOriginText("");
      if (autoSearch) doSearch(null, null, null, destOverride);
      return;
    }
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setOriginLat(latitude);
        setOriginLng(longitude);
        setOriginText("My current location");
        setGpsStatus("success");
        if (autoSearch) doSearch(latitude, longitude, null, destOverride);
      },
      () => {
        setGpsStatus("denied");
        setOriginText("");
        if (autoSearch) doSearch(null, null, null, destOverride);
      },
      { timeout: 8000 }
    );
  };

  const doSearch = async (lat, lng, originOverride, destOverride) => {
    const dest   = destOverride   || destination;
    const origin = originOverride ?? originText;
    if (!dest.trim()) { setError("Please enter a destination."); return; }

    setLoading(true);
    setError("");
    setResult(null);
    setSaveStatus("idle");

    try {
      const payload = { destination: dest.trim() };

      // Priority: GPS coords → typed origin text → backend default (downtown Boston)
      const useLat = lat ?? originLat;
      const useLng = lng ?? originLng;
      if (useLat != null && useLng != null) {
        payload.originLat = useLat;
        payload.originLng = useLng;
      } else if (origin && origin.trim() && origin !== "My current location") {
        payload.originText = origin.trim();
      }

      const { data } = await axios.post("http://localhost:8081/api/smart-route", payload);
      setResult(data);
    } catch (err) {
      if (!err.response) {
        setError("Cannot reach the backend server. Make sure it is running on port 8081.");
      } else {
        setError(err.response.data?.message || `Server error (${err.response.status})`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    const user = getUserInfo();
    if (!user) { setSaveStatus("error"); return; }

    setSaveStatus("saving");
    try {
      await axios.post("http://localhost:8081/api/trips", {
        userId:      user.id,
        origin:      result.origin,
        destination: result.destination,
        routes:      result.routes,
      });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    doSearch(originLat, originLng, null, null);
  };

  const popularDestinations = [
    { label: "Fenway Park",          icon: "⚾" },
    { label: "Museum of Fine Arts",  icon: "🎨" },
    { label: "Boston Common",        icon: "🌳" },
    { label: "New England Aquarium", icon: "🐟" },
    { label: "Harvard",              icon: "🎓" },
    { label: "Logan Airport",        icon: "✈️" },
  ];

  return (
    <div className="eb-page">

      <div className="sr-page-wrap">

        {/* ── Page Header ── */}
        <div className="sr-page-header">
          <div className="sr-header-icon"><IcoTrain/></div>
          <div>
            <h1 className="sr-page-title">Smart Route Finder</h1>
            <p className="sr-page-sub">Enter your destination and we'll find the best MBTA subway route from your location.</p>
          </div>
        </div>

        <div className="sr-layout">

          {/* ── Left: Search Panel ── */}
          <div className="sr-search-panel">

            <form onSubmit={handleSearch} className="sr-form">

              {/* Origin row */}
              <div className="sr-field-label">Starting Location</div>
              <div className="sr-input-row sr-origin-row">
                <span className="sr-row-icon"><IcoPin/></span>
                <input
                  className="sr-dest-input"
                  type="text"
                  placeholder="Fenway Park, Back Bay, Salem…"
                  value={gpsStatus === "loading" ? "Detecting location…" : originText}
                  onChange={handleOriginChange}
                  disabled={gpsStatus === "loading"}
                />
                <button
                  type="button"
                  className={`sr-gps-btn ${gpsStatus === "success" ? "sr-gps-ok" : ""}`}
                  onClick={() => detectGPS()}
                  disabled={gpsStatus === "loading"}
                  title="Use my current location"
                >
                  <IcoGps/>
                  {gpsStatus === "loading" ? "…" : "GPS"}
                </button>
              </div>

              {/* Destination row */}
              <div className="sr-field-label" style={{ marginTop: 14 }}>Destination</div>
              <div className="sr-input-row">
                <span className="sr-row-icon"><IcoSearch/></span>
                <input
                  className="sr-dest-input"
                  type="text"
                  placeholder="Fenway Park, Harvard, Chinatown…"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  autoFocus
                />
              </div>

              <button type="submit" className="sr-find-btn" disabled={loading}>
                {loading ? (
                  <span className="sr-spinner"/>
                ) : (
                  <><IcoSearch/> Find Best Route</>
                )}
              </button>
            </form>

            {/* Popular destinations */}
            <div className="sr-popular">
              <div className="sr-popular-title">Popular Destinations</div>
              <div className="sr-popular-grid">
                {popularDestinations.map(({ label, icon }) => (
                  <button
                    key={label}
                    className="sr-popular-btn"
                    onClick={() => {
                      setDestination(label);
                      setTimeout(() => doSearch(originLat, originLng, null, label), 50);
                    }}
                  >
                    <span className="sr-popular-icon">{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Distance unit toggle */}
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--eb-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--eb-muted)", textTransform: "uppercase", letterSpacing: ".6px" }}>
                Distance Unit
              </span>
              <div style={{ display: "flex", background: "var(--eb-bg)", borderRadius: 8, border: "1px solid var(--eb-border)", overflow: "hidden" }}>
                {["Meters", "Miles"].map(unit => {
                  const active = unit === "Miles" ? useMiles : !useMiles;
                  return (
                    <button
                      key={unit}
                      onClick={toggleUnit}
                      style={{
                        padding: "5px 14px", border: "none", cursor: "pointer",
                        fontFamily: "var(--eb-font)", fontSize: 12, fontWeight: 600,
                        background: active ? "var(--eb-blue)" : "transparent",
                        color: active ? "white" : "var(--eb-muted)",
                        transition: "background .15s, color .15s",
                      }}
                    >
                      {unit}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MBTA Line Legend */}
            <div className="sr-legend">
              <div className="sr-popular-title">MBTA Lines</div>
              {[
                { name: "Red Line",    color: "#DA291C", desc: "Cambridge ↔ Braintree / Ashmont" },
                { name: "Green Line",  color: "#00843D", desc: "Lechmere ↔ Heath St / Riverside" },
                { name: "Orange Line", color: "#ED8B00", desc: "Oak Grove ↔ Forest Hills" },
                { name: "Blue Line",   color: "#003DA5", desc: "Wonderland ↔ Bowdoin" },
              ].map(({ name, color, desc }) => (
                <div key={name} className="sr-legend-row">
                  <LineDot color={color} size={11}/>
                  <div>
                    <span className="sr-legend-name">{name}</span>
                    <span className="sr-legend-desc">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Results Panel ── */}
          <div className="sr-results-panel">

            {/* Error */}
            {error && (
              <div className="sr-error">
                <strong>No route found</strong> — {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="sr-loading-card">
                <div className="sr-loading-spinner"/>
                <p>Finding the best route…</p>
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                  <button
                    onClick={handleSaveTrip}
                    disabled={saveStatus === "saving" || saveStatus === "saved"}
                    style={{
                      padding: "9px 20px",
                      borderRadius: "var(--eb-radius-sm)",
                      border: "none",
                      background: saveStatus === "saved"  ? "#00843D"
                                : saveStatus === "error"  ? "#EF4444"
                                : "var(--eb-blue)",
                      color: "white",
                      fontFamily: "var(--eb-font)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: saveStatus === "saved" ? "default" : "pointer",
                    }}
                  >
                    {saveStatus === "saving" ? "Saving…"
                   : saveStatus === "saved"  ? "✓ Trip Saved"
                   : saveStatus === "error"  ? "Save Failed — Retry"
                   : "Save Trip"}
                  </button>
                </div>

                <div className="sr-result-meta">
                  <div className="sr-meta-row">
                    <span className="sr-meta-label">From</span>
                    <span className="sr-meta-val">
                      <LineDot color="#64748B" size={8}/>
                      {result.origin.name}
                      {result.origin.originMode === "default" && " (default: downtown Boston)"}
                      {result.origin.originMode === "gps" && result.origin.distanceMeters > 0 && ` · ${formatDist(result.origin.distanceMeters, useMiles)} walk`}
                    </span>
                  </div>
                  <div className="sr-meta-row">
                    <span className="sr-meta-label">To</span>
                    <span className="sr-meta-val">
                      <LineDot color="#64748B" size={8}/>
                      {result.destination.name}
                    </span>
                  </div>
                </div>

                {result.routes.length === 0 ? (
                  <div className="sr-same-stop">
                    <span style={{ fontSize: 28 }}>📍</span>
                    <p>{result.message}</p>
                  </div>
                ) : (
                  <div className="sr-routes">
                    {result.routes.map((route, i) => (
                      <RouteCard key={i} route={route} isRecommended={i === 0} useMiles={useMiles}/>
                    ))}
                  </div>
                )}
                <RouteMap result={result} />
              </>
            )}

            {/* Empty state */}
            {!result && !loading && !error && (
              <div className="sr-empty">
                <div className="sr-empty-icon">🚇</div>
                <h3>Find your MBTA route</h3>
                <p>Enter a destination above or choose a popular spot to get turn-by-turn subway directions.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SmartRoutePage;
