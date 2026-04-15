import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";
import "../../exbosHome.css";

const LINES = [
  { name: "Red Line",    color: "#DA291C", bg: "#FFF1F1", route: "Cambridge ↔ Braintree / Ashmont" },
  { name: "Green Line",  color: "#00843D", bg: "#F0FDF4", route: "Lechmere ↔ Heath St / Riverside" },
  { name: "Orange Line", color: "#ED8B00", bg: "#FFF7ED", route: "Oak Grove ↔ Forest Hills" },
  { name: "Blue Line",   color: "#003DA5", bg: "#EFF6FF", route: "Wonderland ↔ Bowdoin" },
];

const IcoEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IcoLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IcoHistory = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="12 8 12 12 14 14"/>
    <path d="M3.05 11a9 9 0 1 1 .5 4M3 16v-5h5"/>
  </svg>
);
const IcoRoute = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/>
    <path d="M12 19h4.5a3.5 3.5 0 0 0 0-7h-8a3.5 3.5 0 0 1 0-7H12"/>
  </svg>
);
const IcoCamera = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const QuickCard = ({ to, icon, label, sub, iconBg, iconColor }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "white",
          borderRadius: 16,
          border: hovered ? "1.5px solid var(--eb-blue)" : "1.5px solid var(--eb-border)",
          boxShadow: hovered ? "0 8px 24px rgba(0,61,165,0.12)" : "0 2px 8px rgba(0,0,0,0.05)",
          padding: "20px",
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12,
          cursor: "pointer",
          transition: "border-color 0.2s, box-shadow 0.2s, transform 0.15s",
          transform: hovered ? "translateY(-2px)" : "none",
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: iconBg, display: "flex", alignItems: "center",
          justifyContent: "center", color: iconColor,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--eb-text)" }}>{label}</div>
          <div style={{ fontSize: 12, color: "var(--eb-muted)", marginTop: 2 }}>{sub}</div>
        </div>
      </div>
    </Link>
  );
};

const PrivateUserProfile = () => {
  const [user, setUser]             = useState(null);
  const [profilePic, setProfilePic] = useState("");
  const [editingPic, setEditingPic] = useState(false);
  const [picInput, setPicInput]     = useState("");
  const [savingPic, setSavingPic]   = useState(false);
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm]       = useState({ firstName: "", lastName: "" });
  const [savingProfile, setSavingProfile]   = useState(false);
  const [showConfirm, setConfirm]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const info = getUserInfo();
    if (!info) navigate("/login");
    else {
      setUser(info);
      fetch(`http://localhost:8081/user/profile/${info.id}`)
        .then(r => r.json())
        .then(data => {
          setProfilePic(data.profilePic || "");
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
        })
        .catch(() => {});
    }
  }, [navigate]);

  const handleSavePic = async () => {
    setSavingPic(true);
    try {
      await fetch("http://localhost:8081/user/updateProfilePic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, profilePic: picInput }),
      });
      setProfilePic(picInput);
      setEditingPic(false);
    } catch {} finally { setSavingPic(false); }
  };

  const handleDeletePic = async () => {
    setSavingPic(true);
    try {
      await fetch("http://localhost:8081/user/updateProfilePic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, profilePic: "" }),
      });
      setProfilePic("");
      setEditingPic(false);
    } catch {} finally { setSavingPic(false); }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await fetch("http://localhost:8081/user/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, firstName: profileForm.firstName, lastName: profileForm.lastName }),
      });
      setFirstName(profileForm.firstName);
      setLastName(profileForm.lastName);
      setEditingProfile(false);
    } catch {} finally { setSavingProfile(false); }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  if (!user) return null;

  const initials = user.username ? user.username.slice(0, 2).toUpperCase() : "??";
  const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : user.username;

  return (
    <div className="eb-page" style={{ background: "#F7F9FC", minHeight: "100vh" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* ── Profile Hero Card ── */}
        <div style={{
          borderRadius: 20, overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
          marginBottom: 24,
        }}>
          {/* Banner */}
          <div style={{
            background: "linear-gradient(135deg, #003DA5 0%, #1a56c4 40%, #0ea5e9 100%)",
            height: 120,
            position: "relative",
          }}>
            {/* Log out button top-right */}
            <button
              onClick={() => setConfirm(true)}
              style={{
                position: "absolute", top: 16, right: 16,
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8,
                border: "1.5px solid rgba(255,255,255,0.4)",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(6px)",
                color: "white", fontSize: 13, fontWeight: 600,
                fontFamily: "var(--eb-font)", cursor: "pointer",
              }}
            >
              <IcoLogout /> Log Out
            </button>
          </div>

          {/* Avatar + name */}
          <div style={{ background: "white", padding: "0 32px 28px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              {/* Avatar */}
              <div style={{ position: "relative", marginTop: -44 }}>
                <div style={{
                  width: 88, height: 88, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--eb-blue), #0ea5e9)",
                  border: "4px solid white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 30, fontWeight: 800, color: "white",
                  fontFamily: "var(--eb-font-h)",
                  boxShadow: "0 4px 16px rgba(0,61,165,0.25)",
                  overflow: "hidden",
                }}>
                  {profilePic
                    ? <img src={profilePic} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : initials}
                </div>
                {/* Camera edit button */}
                <button
                  onClick={() => { setEditingPic(v => !v); setPicInput(profilePic); }}
                  title="Change profile picture"
                  style={{
                    position: "absolute", bottom: 2, right: 2,
                    width: 26, height: 26, borderRadius: "50%",
                    background: "var(--eb-blue)", border: "2px solid white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", padding: 0, color: "white",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}
                >
                  <IcoCamera />
                </button>
              </div>

              {/* Name */}
              <div style={{ paddingBottom: 4 }}>
                <h1 style={{ fontFamily: "var(--eb-font-h)", fontSize: 24, color: "var(--eb-text)", margin: "0 0 2px" }}>
                  {displayName}
                </h1>
                {(firstName || lastName) && (
                  <p style={{ fontSize: 13, color: "var(--eb-muted)", margin: 0 }}>@{user.username}</p>
                )}
              </div>
            </div>

            {/* Photo URL input */}
            {editingPic && (
              <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="url"
                  placeholder="Paste image URL…"
                  value={picInput}
                  onChange={e => setPicInput(e.target.value)}
                  style={{
                    flex: 1, padding: "9px 12px",
                    border: "1.5px solid var(--eb-border)", borderRadius: 9,
                    fontFamily: "var(--eb-font)", fontSize: 13, outline: "none",
                  }}
                />
                <button onClick={handleSavePic} disabled={savingPic} style={{
                  padding: "9px 18px", borderRadius: 9,
                  background: "var(--eb-blue)", color: "white", border: "none",
                  fontFamily: "var(--eb-font)", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", opacity: savingPic ? 0.7 : 1,
                }}>
                  {savingPic ? "Saving…" : "Save"}
                </button>
                {profilePic && (
                  <button onClick={handleDeletePic} disabled={savingPic} style={{
                    padding: "9px 14px", borderRadius: 9,
                    background: "white", color: "#EF4444",
                    border: "1.5px solid #EF4444",
                    fontFamily: "var(--eb-font)", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", opacity: savingPic ? 0.7 : 1,
                  }}>
                    Remove photo
                  </button>
                )}
                <button onClick={() => setEditingPic(false)} style={{
                  padding: "9px 14px", borderRadius: 9,
                  background: "white", color: "var(--eb-muted)",
                  border: "1.5px solid var(--eb-border)",
                  fontFamily: "var(--eb-font)", fontSize: 13, cursor: "pointer",
                }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <QuickCard to="/smart-route" icon={<IcoRoute />} label="Smart Route"   sub="Find your next trip"   iconBg="#EFF6FF" iconColor="var(--eb-blue)" />
          <QuickCard to="/trip-history" icon={<IcoHistory />} label="Trip History" sub="Your saved routes"    iconBg="#F0FDF4" iconColor="#00843D" />
        </div>

        {/* ── Profile Settings ── */}
        <div style={{
          background: "white", borderRadius: 16,
          border: "1.5px solid var(--eb-border)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          padding: "24px 28px", marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--eb-text)" }}>Profile Settings</div>
            {!editingProfile && (
              <button
                onClick={() => { setEditingProfile(true); setProfileForm({ firstName, lastName }); }}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 14px", borderRadius: 8,
                  border: "1.5px solid var(--eb-border)", background: "white",
                  fontFamily: "var(--eb-font)", fontSize: 13, fontWeight: 600,
                  color: "var(--eb-text)", cursor: "pointer",
                }}
              >
                <IcoEdit /> Edit
              </button>
            )}
          </div>

          {editingProfile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--eb-muted)", letterSpacing: "0.06em", marginBottom: 6 }}>FIRST NAME</div>
                  <input type="text" placeholder="First name" value={profileForm.firstName}
                    onChange={e => setProfileForm(f => ({ ...f, firstName: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", border: "1.5px solid var(--eb-border)", borderRadius: 9, fontFamily: "var(--eb-font)", fontSize: 14, outline: "none" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--eb-muted)", letterSpacing: "0.06em", marginBottom: 6 }}>LAST NAME</div>
                  <input type="text" placeholder="Last name" value={profileForm.lastName}
                    onChange={e => setProfileForm(f => ({ ...f, lastName: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", border: "1.5px solid var(--eb-border)", borderRadius: 9, fontFamily: "var(--eb-font)", fontSize: 14, outline: "none" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleSaveProfile} disabled={savingProfile} style={{
                  padding: "10px 22px", borderRadius: 9,
                  background: "var(--eb-blue)", color: "white", border: "none",
                  fontFamily: "var(--eb-font)", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", opacity: savingProfile ? 0.7 : 1,
                  boxShadow: "0 2px 8px rgba(0,61,165,0.2)",
                }}>
                  {savingProfile ? "Saving…" : "Save changes"}
                </button>
                <button onClick={() => setEditingProfile(false)} style={{
                  padding: "10px 16px", borderRadius: 9,
                  background: "white", color: "var(--eb-muted)",
                  border: "1.5px solid var(--eb-border)",
                  fontFamily: "var(--eb-font)", fontSize: 13, cursor: "pointer",
                }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {[
                { label: "FIRST NAME", value: firstName || "Not set", muted: !firstName },
                { label: "LAST NAME",  value: lastName  || "Not set", muted: !lastName  },
                { label: "USERNAME",   value: `@${user.username}`,    muted: false },
                { label: "EMAIL",      value: user.email,             muted: false },
              ].map(({ label, value, muted }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--eb-muted)", letterSpacing: "0.06em", marginBottom: 5 }}>{label}</div>
                  <div style={{ fontSize: 14, color: muted ? "var(--eb-muted)" : "var(--eb-text)", fontWeight: muted ? 400 : 500 }}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── MBTA Lines ── */}
        <div style={{
          background: "white", borderRadius: 16,
          border: "1.5px solid var(--eb-border)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          padding: "24px 28px",
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--eb-text)", marginBottom: 18 }}>
            MBTA Subway Lines
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {LINES.map(line => (
              <div key={line.name} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 16px", borderRadius: 12,
                background: line.bg,
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: "50%",
                  background: line.color, flexShrink: 0,
                  boxShadow: `0 0 0 3px ${line.color}30`,
                }}/>
                <span style={{ fontWeight: 700, fontSize: 14, color: line.color, minWidth: 100 }}>
                  {line.name}
                </span>
                <span style={{ fontSize: 13, color: "var(--eb-muted)" }}>{line.route}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Logout Confirm Modal ── */}
      {showConfirm && (
        <div onClick={() => setConfirm(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "white", borderRadius: 20,
            padding: "36px 32px", maxWidth: 380, width: "100%",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)", textAlign: "center",
          }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>👋</div>
            <h2 style={{ fontFamily: "var(--eb-font-h)", fontSize: 20, color: "var(--eb-text)", margin: "0 0 8px" }}>
              Log out?
            </h2>
            <p style={{ fontSize: 14, color: "var(--eb-muted)", marginBottom: 28 }}>
              You'll need to log back in to access your profile.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirm(false)} style={{
                flex: 1, padding: "11px", borderRadius: 10,
                border: "1.5px solid var(--eb-border)", background: "white",
                fontFamily: "var(--eb-font)", fontSize: 14, cursor: "pointer",
                color: "var(--eb-text)",
              }}>
                Cancel
              </button>
              <button onClick={handleLogout} style={{
                flex: 1, padding: "11px", borderRadius: 10,
                border: "none", background: "#EF4444",
                fontFamily: "var(--eb-font)", fontSize: 14, fontWeight: 700,
                cursor: "pointer", color: "white",
                boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
              }}>
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivateUserProfile;
