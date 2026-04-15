import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../exbosHome.css";


const LINE_ROUTES = {
  Red:    "Cambridge ↔ Braintree / Ashmont",
  Green:  "Lechmere ↔ Heath St / Riverside",
  Orange: "Oak Grove ↔ Forest Hills",
  Blue:   "Wonderland ↔ Bowdoin",
};

const IcoBell = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IcoRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const IcoPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IcoX = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const EMPTY_FORM = { title: "", description: "", line: "Red" };

/* ── Subway Status Widget ── */
const IcoTrain = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.2">
    <rect x="4" y="3" width="16" height="13" rx="3"/>
    <path d="M8 16l-2 3M16 16l2 3M8 9h8M8 12h4" stroke="white" strokeWidth="1.5" fill="none"/>
    <circle cx="8.5" cy="6.5" r="1" fill="#374151"/>
    <circle cx="15.5" cy="6.5" r="1" fill="#374151"/>
  </svg>
);
const IcoChevron = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const SUBWAY_LINES = [
  { id: "Red",    abbr: "RL", color: "#DA291C" },
  { id: "Orange", abbr: "OL", color: "#ED8B00" },
  { id: "Green",  abbr: "GL", color: "#00843D" },
  { id: "Blue",   abbr: "BL", color: "#003DA5" },
];

const SubwayStatus = ({ alerts, loading, onDelete }) => {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{
      background: "white",
      border: "1px solid var(--eb-border)",
      borderRadius: "var(--eb-radius)",
      boxShadow: "var(--eb-shadow)",
      overflow: "hidden",
      marginBottom: 28,
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "20px 24px",
        borderBottom: "1px solid var(--eb-border)",
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: "50%",
          background: "#374151",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <IcoTrain />
        </div>
        <h2 style={{
          fontFamily: "var(--eb-font-h)", fontSize: 22,
          fontWeight: 800, margin: 0, color: "var(--eb-text)",
        }}>
          Subway Status
        </h2>
        {loading && (
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--eb-muted)" }}>Updating…</span>
        )}
      </div>

      {/* Line rows */}
      {SUBWAY_LINES.map((line, i) => {
        const lineAlerts = alerts.filter(a => a.line === line.id);
        const hasAlert   = lineAlerts.length > 0;
        const isOpen     = expanded === line.id;
        const isLast     = i === SUBWAY_LINES.length - 1;

        return (
          <div key={line.id}>
            {/* Row */}
            <div
              onClick={() => setExpanded(isOpen ? null : line.id)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "16px 24px",
                borderBottom: isLast && !isOpen ? "none" : "1px solid var(--eb-border)",
                cursor: "pointer",
                transition: "background 0.12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "white"; }}
            >
              {/* Colored pill badge */}
              <span style={{
                background: line.color, color: "white",
                fontWeight: 800, fontSize: 12,
                padding: "5px 13px", borderRadius: 20,
                minWidth: 42, textAlign: "center",
                letterSpacing: "0.03em",
              }}>
                {line.abbr}
              </span>

              {/* Status dot */}
              <span style={{
                width: 11, height: 11, borderRadius: "50%", flexShrink: 0,
                background: hasAlert ? "#EF4444" : "#22C55E",
                boxShadow: hasAlert
                  ? "0 0 0 3px rgba(239,68,68,0.15)"
                  : "0 0 0 3px rgba(34,197,94,0.15)",
              }} />

              {/* Status text */}
              <span style={{ fontSize: 15, color: "var(--eb-text)", flex: 1, fontWeight: hasAlert ? 600 : 400 }}>
                {hasAlert
                  ? `${lineAlerts.length} active alert${lineAlerts.length > 1 ? "s" : ""}`
                  : "Normal Service"}
              </span>

              {/* Chevron */}
              <span style={{ color: "var(--eb-muted)" }}>
                <IcoChevron open={isOpen} />
              </span>
            </div>

            {/* Expanded alerts for this line */}
            {isOpen && (
              <div style={{
                padding: "14px 24px 14px 92px",
                background: "#f9fafb",
                borderBottom: isLast ? "none" : "1px solid var(--eb-border)",
              }}>
                {hasAlert ? lineAlerts.map((a, j) => (
                  <div key={j} style={{
                    marginBottom: j < lineAlerts.length - 1 ? 14 : 0,
                    paddingBottom: j < lineAlerts.length - 1 ? 14 : 0,
                    borderBottom: j < lineAlerts.length - 1 ? "1px dashed var(--eb-border)" : "none",
                  }}>
                    {/* Title row with source badge + delete */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "var(--eb-text)", flex: 1 }}>
                        {a.title}
                      </span>
                      {a.source === "mbta" ? (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                          background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE",
                        }}>LIVE · MBTA</span>
                      ) : (
                        <>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                            background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0",
                          }}>MANUAL</span>
                          <button
                            onClick={() => onDelete(a._id)}
                            style={{
                              background: "none", border: "1px solid #FECACA",
                              borderRadius: 6, padding: "2px 7px",
                              cursor: "pointer", color: "#EF4444",
                              fontSize: 11, fontWeight: 600,
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--eb-muted)", lineHeight: 1.6, marginBottom: 6 }}>
                      {a.description}
                    </div>
                    {/* Date + Route + Effect row */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                      {a.createdAt && (
                        <span style={{
                          fontSize: 11, padding: "2px 8px", borderRadius: 20,
                          background: "#F3F4F6", color: "#6B7280", fontWeight: 500,
                        }}>
                          📅 {formatDate(a.createdAt)}
                        </span>
                      )}
                      {LINE_ROUTES[line.id] && (
                        <span style={{
                          fontSize: 11, padding: "2px 8px", borderRadius: 20,
                          background: "#EFF6FF", color: "#1D4ED8", fontWeight: 600,
                        }}>
                          🛤 {LINE_ROUTES[line.id]}
                        </span>
                      )}
                      {a.effect && a.effect !== "UNKNOWN_EFFECT" && (
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          padding: "2px 8px", borderRadius: 20,
                          background: "#FEF3C7", color: "#92400E",
                        }}>
                          ⚠️ {a.effect.replace(/_/g, " ").toLowerCase()}
                        </span>
                      )}
                    </div>
                  </div>
                )) : (
                  <div style={{ fontSize: 13, color: "var(--eb-muted)" }}>
                    ✅ No active disruptions on the {line.id} Line.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ── Seasonal Boston Events ── */
const LINE_BADGE_COLORS = {
  Red:    { bg: "#FFF1F1", color: "#DA291C" },
  Green:  { bg: "#F0FDF4", color: "#00843D" },
  Orange: { bg: "#FFF7ED", color: "#ED8B00" },
  Blue:   { bg: "#EFF6FF", color: "#003DA5" },
};

const SEASONS = [
  {
    name: "Spring", months: "Mar – May", emoji: "🌸",
    color: "#ec4899", bg: "#fdf2f8", border: "#fbcfe8",
    events: [
      { title: "Boston Marathon",           date: "Third Monday of April", location: "Hopkinton → Boylston St",    desc: "One of the world's oldest marathons, finishing at Copley Square.",                   lines: ["Green"] },
      { title: "Swan Boats Opening",        date: "Mid-April",             location: "Boston Public Garden",       desc: "The iconic Swan Boats return to the lagoon for the season.",                        lines: ["Green"] },
      { title: "Patriots' Day",             date: "Third Monday of April", location: "Lexington & Concord",        desc: "Reenactments of the first battles of the Revolutionary War.",                       lines: ["Green"] },
      { title: "Earth Day Boston",          date: "April 22",              location: "City Hall Plaza",            desc: "Community events, clean-ups, and sustainability initiatives.",                      lines: ["Green", "Blue"] },
      { title: "Boston Calling Festival",   date: "Late May",              location: "Harvard Athletic Complex",   desc: "Three-day outdoor music festival with top artists across multiple stages.",           lines: ["Red"] },
      { title: "Lilac Sunday",              date: "Second Sunday of May",  location: "Arnold Arboretum",           desc: "Free event celebrating hundreds of blooming lilac varieties.",                      lines: ["Orange"] },
    ],
  },
  {
    name: "Summer", months: "Jun – Aug", emoji: "☀️",
    color: "#f59e0b", bg: "#fffbeb", border: "#fde68a",
    events: [
      { title: "Boston Harborfest",         date: "Late June – July 4",    location: "Downtown & Waterfront",      desc: "Week-long Independence celebration with tours, events, and fireworks.",               lines: ["Blue", "Green"] },
      { title: "July 4th Fireworks",        date: "July 4",                location: "Charles River Esplanade",    desc: "Boston Pops perform live followed by one of the nation's biggest fireworks shows.",  lines: ["Red", "Green"] },
      { title: "Boston Seafood Festival",   date: "Early August",          location: "Fish Pier, South Boston",    desc: "New England seafood heritage with tastings, cooking demos, and live music.",          lines: ["Red"] },
      { title: "Free Friday Flicks",        date: "Every Friday, Jul–Aug", location: "City Hall Plaza",            desc: "Free outdoor movie screenings all summer long.",                                    lines: ["Green", "Blue"] },
      { title: "Puerto Rican Festival",     date: "Late July",             location: "Columbus Park, East Boston", desc: "Cultural celebration with music, food, dancing, and heritage.",                     lines: ["Blue"] },
      { title: "August Moon Festival",      date: "Mid-August",            location: "Chinatown",                  desc: "Mid-autumn festival with lanterns, performances, and street food.",                 lines: ["Orange", "Red"] },
    ],
  },
  {
    name: "Fall", months: "Sep – Nov", emoji: "🍂",
    color: "#ea580c", bg: "#fff7ed", border: "#fed7aa",
    events: [
      { title: "Head of the Charles",       date: "Third Weekend of October", location: "Charles River",           desc: "The world's largest two-day rowing event with crews from across the globe.",         lines: ["Red"] },
      { title: "Boston Book Festival",      date: "Mid-October",              location: "Copley Square",           desc: "Free literary festival with author talks and community readings.",                   lines: ["Green"] },
      { title: "Oktoberfest",               date: "Early October",            location: "Harvard Square",          desc: "Street festival with German food, beer, live music, and family fun.",               lines: ["Red"] },
      { title: "Salem Haunted Happenings",  date: "All of October",           location: "Salem, MA",               desc: "Month-long Halloween festival in the Witch City — 30 min by commuter rail.",        lines: ["Orange"] },
      { title: "Honk! Festival",            date: "Columbus Day Weekend",     location: "Davis Square, Somerville",desc: "Free festival of activist street bands from around the world.",                     lines: ["Red"] },
      { title: "Boston Arts Festival",      date: "Late September",           location: "Christopher Columbus Park",desc: "Waterfront juried art show with local painters, sculptors, and craftspeople.",    lines: ["Blue", "Green"] },
    ],
  },
  {
    name: "Winter", months: "Dec – Feb", emoji: "❄️",
    color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd",
    events: [
      { title: "Boston Common Holiday Lighting", date: "Late November",    location: "Boston Common",              desc: "Annual tree lighting kicking off the holiday season.",                              lines: ["Green", "Red"] },
      { title: "First Night Boston",             date: "December 31",      location: "Copley Square & Downtown",   desc: "Family-friendly New Year's Eve with art installations and fireworks.",              lines: ["Green"] },
      { title: "Chinese New Year Parade",        date: "Late Jan / Early Feb", location: "Chinatown",             desc: "Dragon dances, firecrackers, and vibrant cultural performances.",                   lines: ["Orange", "Red"] },
      { title: "Boston Wine Expo",               date: "Mid-February",     location: "Seaport World Trade Center", desc: "One of the nation's largest consumer wine events.",                                lines: ["Red"] },
      { title: "Beanpot Hockey Tournament",      date: "First Two Mondays of Feb", location: "TD Garden",         desc: "BU, BC, Harvard, and Northeastern compete in this beloved college hockey event.",   lines: ["Green", "Orange"] },
      { title: "Winter Restaurant Week",         date: "Mid-March",        location: "Restaurants Citywide",       desc: "Prix-fixe menus at hundreds of Boston restaurants at reduced prices.",             lines: ["Red", "Green", "Orange", "Blue"] },
    ],
  },
];

const BostonSeasonalEvents = () => {
  const month = new Date().getMonth();
  let idx = 3; // Winter default
  if (month >= 2 && month <= 4) idx = 0;
  else if (month >= 5 && month <= 7) idx = 1;
  else if (month >= 8 && month <= 10) idx = 2;

  const season = SEASONS[idx];

  return (
    <div style={{ marginTop: 48 }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>{season.emoji}</span>
        <div>
          <h2 style={{ fontFamily: "var(--eb-font-h)", fontSize: 18, margin: "0 0 2px", color: "var(--eb-text)" }}>
            {season.name} Events in Boston
          </h2>
          <p style={{ fontSize: 13, color: "var(--eb-muted)", margin: 0 }}>
            {season.months} · Things to do for visitors and locals — get there by MBTA.
          </p>
        </div>
      </div>

      {/* Events grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
        gap: "1px", background: "var(--eb-border)",
        border: "1px solid var(--eb-border)",
        borderRadius: "var(--eb-radius)", overflow: "hidden",
      }}>
        {season.events.map((event, i) => (
          <div key={i} style={{ background: "white", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--eb-text)" }}>{event.title}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: season.color }}>📅 {event.date}</div>
            <div style={{ fontSize: 11, color: "var(--eb-muted)" }}>📍 {event.location}</div>
            <div style={{ fontSize: 12, color: "var(--eb-muted)", lineHeight: 1.5 }}>{event.desc}</div>
            {/* MBTA line badges */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 2 }}>
              <span style={{ fontSize: 10, color: "var(--eb-muted)", fontWeight: 600, alignSelf: "center" }}>🚇</span>
              {event.lines.map(line => {
                const c = LINE_BADGE_COLORS[line] || { bg: "#f3f4f6", color: "#6b7280" };
                return (
                  <span key={line} style={{
                    fontSize: 10, fontWeight: 700,
                    padding: "2px 8px", borderRadius: 20,
                    background: c.bg, color: c.color,
                    border: `1px solid ${c.color}30`,
                  }}>
                    {line} Line
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Planned Work ── */
const LINE_PILL = {
  Red:    { bg: "#DA291C", abbr: "RL" },
  Orange: { bg: "#ED8B00", abbr: "OL" },
  Green:  { bg: "#00843D", abbr: "GL" },
  Blue:   { bg: "#003DA5", abbr: "BL" },
};

const EFFECT_LABEL = {
  SHUTTLE:         "Shuttles",
  SUSPENSION:      "Suspension",
  DELAY:           "Delays",
  DETOUR:          "Detour",
  STOP_CLOSURE:    "Stop Closure",
  STATION_CLOSURE: "Station Closure",
  SERVICE_CHANGE:  "Service Change",
};

function fmtRange(start, end) {
  const opts = { weekday: "short", month: "short", day: "numeric" };
  const s = start ? new Date(start).toLocaleDateString("en-US", opts) : null;
  const e = end   ? new Date(end).toLocaleDateString("en-US", opts)   : null;
  if (s && e) return `${s} – ${e}`;
  if (s) return `From ${s}`;
  return "Upcoming";
}

function groupByWeek(items) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfNextWeek = new Date(startOfToday);
  startOfNextWeek.setDate(startOfToday.getDate() + (7 - startOfToday.getDay() || 7));
  const endOfNextWeek = new Date(startOfNextWeek);
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 7);

  const groups = { "This Week": [], "Next Week": [], "Upcoming": [] };
  for (const item of items) {
    const d = item.start ? new Date(item.start) : null;
    if (!d || d < startOfNextWeek) groups["This Week"].push(item);
    else if (d < endOfNextWeek)    groups["Next Week"].push(item);
    else                           groups["Upcoming"].push(item);
  }
  return groups;
}

const PlannedWork = () => {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8081/api/mbta-planned")
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ marginTop: 40, color: "var(--eb-muted)", fontSize: 13 }}>Loading planned work…</div>
  );
  if (!items.length) return null;

  const groups = groupByWeek(items);

  return (
    <div style={{ marginTop: 48 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 20 }}>🔧</span>
        <div>
          <h2 style={{ fontFamily: "var(--eb-font-h)", fontSize: 18, margin: "0 0 2px", color: "var(--eb-text)" }}>
            Planned Work
          </h2>
          <p style={{ fontSize: 13, color: "var(--eb-muted)", margin: 0 }}>
            Upcoming MBTA service changes and construction work.
          </p>
        </div>
      </div>

      {/* Groups */}
      {Object.entries(groups).map(([label, groupItems]) => {
        if (!groupItems.length) return null;
        return (
          <div key={label} style={{ marginBottom: 28 }}>
            {/* Week label */}
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
              color: "var(--eb-muted)", textTransform: "uppercase",
              marginBottom: 10,
            }}>
              {label}
            </div>

            {/* Cards */}
            <div style={{
              border: "1px solid var(--eb-border)",
              borderRadius: "var(--eb-radius)",
              overflow: "hidden",
              background: "white",
              boxShadow: "var(--eb-shadow)",
            }}>
              {groupItems.map((item, i) => {
                const pill  = LINE_PILL[item.line] || { bg: "#6b7280", abbr: "??" };
                const label = EFFECT_LABEL[item.effect] || item.effect || "Work";
                const isOpen = expanded === item._id;
                const isLast = i === groupItems.length - 1;

                return (
                  <div key={item._id}>
                    {/* Row */}
                    <div
                      onClick={() => setExpanded(isOpen ? null : item._id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "14px 18px",
                        borderBottom: (!isLast || isOpen) ? "1px solid var(--eb-border)" : "none",
                        cursor: "pointer",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#f9fafb"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "white"; }}
                    >
                      {/* Line pill */}
                      <span style={{
                        background: pill.bg, color: "white",
                        fontWeight: 800, fontSize: 11,
                        padding: "4px 10px", borderRadius: 20,
                        flexShrink: 0,
                      }}>
                        {pill.abbr}
                      </span>

                      {/* Bus/shuttle icon */}
                      <span style={{ fontSize: 15, flexShrink: 0 }}>
                        {item.effect === "SHUTTLE" ? "🚌" : "🔧"}
                      </span>

                      {/* Date range + type */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--eb-text)" }}>
                          {fmtRange(item.start, item.end)}
                          <span style={{
                            marginLeft: 8,
                            fontSize: 12, fontWeight: 700,
                            color: "#16A34A",
                          }}>
                            {label}
                          </span>
                        </div>
                        <div style={{
                          fontSize: 12, color: "var(--eb-muted)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {item.title}
                        </div>
                      </div>

                      {/* Chevron */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        style={{
                          flexShrink: 0, color: "var(--eb-muted)",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>

                    {/* Expanded body */}
                    {isOpen && (
                      <div style={{ padding: "16px 20px", background: "#f9fafb", borderBottom: isLast ? "none" : "1px solid var(--eb-border)" }}>
                        {/* Description paragraphs */}
                        {item.description
                          ? item.description.split(/\n+/).map((para, pi) => {
                              const isBold = /^[A-Z][^a-z]*:/.test(para.trim());
                              return para.trim() ? (
                                <p key={pi} style={{
                                  fontSize: 13, color: isBold ? "var(--eb-text)" : "var(--eb-muted)",
                                  fontWeight: isBold ? 700 : 400,
                                  lineHeight: 1.6, margin: "0 0 8px",
                                }}>
                                  {para.trim()}
                                </p>
                              ) : null;
                            })
                          : <p style={{ fontSize: 13, color: "var(--eb-muted)" }}>{item.title}</p>
                        }

                        {/* Branches */}
                        {item.branches && item.branches.length > 0 && (
                          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                            <span style={{ fontSize: 11, color: "var(--eb-muted)", alignSelf: "center" }}>Branches:</span>
                            {item.branches.map(b => (
                              <span key={b} style={{
                                fontSize: 11, fontWeight: 700,
                                padding: "2px 8px", borderRadius: 20,
                                background: "#F3F4F6", color: "#374151",
                              }}>{b}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════
   ALERT PAGE
══════════════════════════════ */
const AlertPage = () => {
  const [alerts, setAlerts]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [submitting, setSubmitting]   = useState(false);
  const [formError, setFormError]     = useState("");

  const fetchAlerts = async () => {
    setLoading(true);
    setError("");
    try {
      const [manualRes, mbtaRes] = await Promise.allSettled([
        axios.get("http://localhost:8081/api/alerts"),
        axios.get("http://localhost:8081/api/mbta-alerts"),
      ]);

      const manual = manualRes.status === "fulfilled"
        ? manualRes.value.data.map(a => ({ ...a, source: "manual" }))
        : [];

      const mbta = mbtaRes.status === "fulfilled"
        ? mbtaRes.value.data.map(a => ({ ...a, source: "mbta" }))
        : [];

      if (manualRes.status === "rejected" && mbtaRes.status === "rejected") {
        setError("Cannot reach the backend server. Make sure it is running on port 8081.");
      }

      // Manual alerts first, then live MBTA alerts
      setAlerts([...manual, ...mbta]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8081/api/alerts/${id}`);
      setAlerts(prev => prev.filter(a => a._id !== id));
    } catch {
      alert("Failed to delete alert.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setFormError("Title and description are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const { data } = await axios.post("http://localhost:8081/api/alerts", form);
      setAlerts(prev => [data, ...prev]);
      setShowModal(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Failed to create alert."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="eb-page">

      <div className="sr-page-wrap">

        {/* ── Page Header ── */}
        <div className="sr-page-header">
          <div className="sr-header-icon"><IcoBell /></div>
          <div>
            <h1 className="sr-page-title">Service Alerts</h1>
            <p className="sr-page-sub">Real-time MBTA service disruptions and advisories.</p>
          </div>
          <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
            <button
              onClick={fetchAlerts}
              disabled={loading}
              title="Refresh alerts"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 16px",
                background: "white",
                border: "1.5px solid var(--eb-border)",
                borderRadius: 8,
                fontSize: 13, fontWeight: 600,
                fontFamily: "var(--eb-font)",
                color: "var(--eb-text)",
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "border-color 0.15s, box-shadow 0.15s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = "var(--eb-blue)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--eb-border)"; }}
            >
              <IcoRefresh /> Refresh
            </button>
            <button
              onClick={() => { setShowModal(true); setFormError(""); setForm(EMPTY_FORM); }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 18px",
                background: "var(--eb-blue)",
                border: "none",
                borderRadius: 8,
                fontSize: 13, fontWeight: 700,
                fontFamily: "var(--eb-font)",
                color: "white",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,61,165,0.25)",
                transition: "background 0.15s, transform 0.1s, box-shadow 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#002d7a"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,61,165,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--eb-blue)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,61,165,0.25)"; }}
            >
              <IcoPlus /> New Alert
            </button>
          </div>
        </div>

        {/* ── Subway Status ── */}
        <SubwayStatus alerts={alerts} loading={loading} onDelete={handleDelete} />

        {/* ── Error ── */}
        {error && (
          <div className="sr-error">
            <strong>Could not load alerts</strong> — {error}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="sr-loading-card">
            <div className="sr-loading-spinner" />
            <p>Loading service alerts…</p>
          </div>
        )}

        {/* ── Planned Work ── */}
        <PlannedWork />

        {/* ── Boston Events by Season ── */}
        <BostonSeasonalEvents />

      </div>

      {/* ── Create Alert Modal ── */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "var(--eb-radius)",
              padding: 32,
              width: "100%",
              maxWidth: 480,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "var(--eb-font-h)", fontSize: 20, margin: 0, color: "var(--eb-text)" }}>
                New Service Alert
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  marginLeft: "auto", background: "none", border: "none",
                  cursor: "pointer", color: "var(--eb-muted)", padding: 4,
                }}
              >
                <IcoX />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <div className="sr-field-label">MBTA Line</div>
                <select
                  value={form.line}
                  onChange={e => setForm(f => ({ ...f, line: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 12px",
                    border: "1px solid var(--eb-border)", borderRadius: "var(--eb-radius-sm)",
                    fontFamily: "var(--eb-font)", fontSize: 14, color: "var(--eb-text)",
                    background: "white", cursor: "pointer",
                  }}
                >
                  <option value="Red">Red Line</option>
                  <option value="Green">Green Line</option>
                  <option value="Orange">Orange Line</option>
                  <option value="Blue">Blue Line</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div className="sr-field-label">Title</div>
                <input
                  type="text"
                  placeholder="e.g. Delays on Red Line toward Braintree"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 12px",
                    border: "1px solid var(--eb-border)", borderRadius: "var(--eb-radius-sm)",
                    fontFamily: "var(--eb-font)", fontSize: 14, boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <div className="sr-field-label">Description</div>
                <textarea
                  placeholder="Describe the disruption, affected stops, and expected duration…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={4}
                  style={{
                    width: "100%", padding: "10px 12px",
                    border: "1px solid var(--eb-border)", borderRadius: "var(--eb-radius-sm)",
                    fontFamily: "var(--eb-font)", fontSize: 14, resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {formError && (
                <div className="sr-error" style={{ marginBottom: 16 }}>{formError}</div>
              )}

              <button
                type="submit"
                className="sr-find-btn"
                disabled={submitting}
                style={{ width: "100%" }}
              >
                {submitting ? <span className="sr-spinner" /> : <><IcoPlus /> Post Alert</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertPage;
