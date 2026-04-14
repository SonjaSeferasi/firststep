import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../exbosHome.css";

const LINE_COLORS = {
  Red:    "#DA291C",
  Green:  "#00843D",
  Orange: "#ED8B00",
  Blue:   "#003DA5",
};

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
const IcoTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const EMPTY_FORM = { title: "", description: "", line: "Red" };

/* ══════════════════════════════
   ALERT PAGE
══════════════════════════════ */
const AlertPage = () => {
  const [alerts, setAlerts]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [activeFilter, setFilter]   = useState("All");
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");
  const [deletingId, setDeletingId] = useState(null);

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

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`http://localhost:8081/api/alerts/${id}`);
      setAlerts(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      alert("Failed to delete alert.");
    } finally {
      setDeletingId(null);
    }
  };

  const filters = ["All", "Red", "Green", "Orange", "Blue"];
  const visible = activeFilter === "All"
    ? alerts
    : alerts.filter(a => a.line === activeFilter);

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

        {/* ── Line Filter ── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {filters.map(f => {
            const color = LINE_COLORS[f];
            const isActive = activeFilter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: `2px solid ${color || "var(--eb-border)"}`,
                  background: isActive ? (color || "var(--eb-text)") : "white",
                  color: isActive ? "white" : (color || "var(--eb-text)"),
                  fontFamily: "var(--eb-font)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {f === "All" ? "All Lines" : `${f} Line`}
              </button>
            );
          })}
        </div>

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

        {/* ── Alert List ── */}
        {!loading && !error && visible.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visible.map((alert) => {
              const lineColor = LINE_COLORS[alert.line] || "var(--eb-muted)";
              return (
                <div
                  key={alert._id}
                  style={{
                    background: "white",
                    border: "1px solid var(--eb-border)",
                    borderLeft: `4px solid ${lineColor}`,
                    borderRadius: "var(--eb-radius)",
                    padding: "18px 20px",
                    boxShadow: "var(--eb-shadow)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <span className="sr-line-badge" style={{ background: lineColor }}>
                      {alert.line} Line
                    </span>
                    {alert.source === "mbta" ? (
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 8px",
                        borderRadius: 20, background: "#EFF6FF", color: "#2563EB",
                        border: "1px solid #BFDBFE", letterSpacing: "0.03em",
                      }}>LIVE · MBTA</span>
                    ) : (
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 8px",
                        borderRadius: 20, background: "#F0FDF4", color: "#16A34A",
                        border: "1px solid #BBF7D0", letterSpacing: "0.03em",
                      }}>MANUAL</span>
                    )}
                    <span style={{ fontSize: 12, color: "var(--eb-muted)" }}>
                      {formatDate(alert.createdAt)}
                    </span>
                    {alert.source === "manual" && (
                      <button
                        onClick={() => handleDelete(alert._id)}
                        disabled={deletingId === alert._id}
                        title="Delete alert"
                        style={{
                          marginLeft: "auto",
                          background: "none",
                          border: "1px solid #FECACA",
                          borderRadius: 6,
                          padding: "4px 8px",
                          cursor: "pointer",
                          color: "#EF4444",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          opacity: deletingId === alert._id ? 0.5 : 1,
                        }}
                      >
                        <IcoTrash /> {deletingId === alert._id ? "Deleting…" : "Delete"}
                      </button>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--eb-text)", marginBottom: 6 }}>
                    {alert.title}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--eb-muted)", lineHeight: 1.6 }}>
                    {alert.description}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: "var(--eb-muted)", display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {LINE_ROUTES[alert.line] && (
                      <span>Affected route: {LINE_ROUTES[alert.line]}</span>
                    )}
                    {alert.effect && alert.effect !== "UNKNOWN_EFFECT" && (
                      <span style={{ fontWeight: 600, textTransform: "capitalize" }}>
                        Effect: {alert.effect.replace(/_/g, " ").toLowerCase()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && visible.length === 0 && (
          <div className="sr-empty">
            <div className="sr-empty-icon">✅</div>
            <h3>No active alerts</h3>
            <p>
              {activeFilter === "All"
                ? "All MBTA lines are operating normally."
                : `The ${activeFilter} Line is currently operating normally.`}
            </p>
          </div>
        )}

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
