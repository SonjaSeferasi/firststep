import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";
import "../../exbosHome.css";

const LINES = [
  { name: "Red Line",    color: "#DA291C", bg: "linear-gradient(135deg,#fff1f1,#ffe4e4)", route: "Alewife ↔ Braintree / Ashmont" },
  { name: "Green Line",  color: "#00843D", bg: "linear-gradient(135deg,#f0fdf4,#dcfce7)", route: "Lechmere ↔ Heath St / Riverside" },
  { name: "Orange Line", color: "#ED8B00", bg: "linear-gradient(135deg,#fff7ed,#ffedd5)", route: "Oak Grove ↔ Forest Hills" },
  { name: "Blue Line",   color: "#003DA5", bg: "linear-gradient(135deg,#eff6ff,#dbeafe)", route: "Wonderland ↔ Bowdoin" },
];

const IcoLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IcoEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IcoCamera = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const PrivateUserProfile = () => {
  const [user, setUser]           = useState(null);
  const [profilePic, setProfilePic] = useState("");
  const [editingPic, setEditingPic] = useState(false);
  const [picInput, setPicInput]   = useState("");
  const [savingPic, setSavingPic] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm]       = useState({ firstName: "", lastName: "" });
  const [savingProfile, setSavingProfile]   = useState(false);
  const [showConfirm, setConfirm] = useState(false);
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
    <div style={{ minHeight: "100vh", background: "#F0F4FA", fontFamily: "var(--eb-font)" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 20px 80px" }}>

        {/* ── Hero Card ── */}
        <div style={{
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,61,165,0.15)",
          marginBottom: 24,
        }}>
          {/* Banner */}
          <div style={{
            background: "linear-gradient(135deg, #001f6b 0%, #003DA5 45%, #1a7fd4 80%, #38bdf8 100%)",
            height: 140,
            position: "relative",
            overflow: "hidden",
          }}>
            {/* decorative circles */}
            <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }}/>
            <div style={{ position:"absolute", bottom:-60, left:-20, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }}/>
            <div style={{ position:"absolute", top:20, right:100, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }}/>

            {/* Log out */}
            <button
              onClick={() => setConfirm(true)}
              style={{
                position:"absolute", top:16, right:16,
                display:"flex", alignItems:"center", gap:6,
                padding:"8px 16px", borderRadius:10,
                border:"1.5px solid rgba(255,255,255,0.35)",
                background:"rgba(255,255,255,0.12)",
                backdropFilter:"blur(8px)",
                color:"white", fontSize:13, fontWeight:600,
                fontFamily:"var(--eb-font)", cursor:"pointer",
                transition:"background 0.2s",
              }}
              onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,0.22)"}
              onMouseOut={e => e.currentTarget.style.background="rgba(255,255,255,0.12)"}
            >
              <IcoLogout /> Log Out
            </button>
          </div>

          {/* White body */}
          <div style={{ background:"white", padding:"0 32px 32px" }}>
            {/* Avatar row */}
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
              <div style={{ position:"relative", marginTop:-52 }}>
                <div style={{
                  width:96, height:96, borderRadius:"50%",
                  background:"linear-gradient(135deg,#003DA5,#38bdf8)",
                  border:"5px solid white",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:32, fontWeight:800, color:"white",
                  fontFamily:"var(--eb-font-h)",
                  boxShadow:"0 8px 24px rgba(0,61,165,0.35)",
                  overflow:"hidden",
                }}>
                  {profilePic
                    ? <img src={profilePic} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    : initials}
                </div>
                <button
                  onClick={() => { setEditingPic(v => !v); setPicInput(profilePic); }}
                  title="Change photo"
                  style={{
                    position:"absolute", bottom:3, right:3,
                    width:28, height:28, borderRadius:"50%",
                    background:"var(--eb-blue)", border:"2.5px solid white",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    cursor:"pointer", padding:0, color:"white",
                    boxShadow:"0 2px 8px rgba(0,0,0,0.25)",
                  }}
                >
                  <IcoCamera />
                </button>
              </div>

              <div style={{ paddingBottom:6 }}>
                <h1 style={{
                  fontFamily:"var(--eb-font-h)", fontSize:26,
                  color:"var(--eb-text)", margin:"0 0 3px",
                  letterSpacing:"-0.5px",
                }}>
                  {displayName}
                </h1>
                <p style={{ fontSize:13, color:"var(--eb-muted)", margin:0 }}>
                  @{user.username}
                </p>
              </div>
            </div>

            {/* Photo URL editor */}
            {editingPic && (
              <div style={{ marginTop:20, display:"flex", gap:8, flexWrap:"wrap" }}>
                <input
                  type="url"
                  placeholder="Paste image URL…"
                  value={picInput}
                  onChange={e => setPicInput(e.target.value)}
                  style={{
                    flex:1, minWidth:200, padding:"10px 14px",
                    border:"1.5px solid var(--eb-border)", borderRadius:10,
                    fontFamily:"var(--eb-font)", fontSize:13, outline:"none",
                    background:"var(--eb-bg)",
                  }}
                />
                <button onClick={handleSavePic} disabled={savingPic} style={{
                  padding:"10px 20px", borderRadius:10,
                  background:"var(--eb-blue)", color:"white", border:"none",
                  fontFamily:"var(--eb-font)", fontSize:13, fontWeight:600,
                  cursor:"pointer", opacity:savingPic?0.7:1,
                  boxShadow:"0 2px 8px rgba(0,61,165,0.25)",
                }}>
                  {savingPic ? "Saving…" : "Save"}
                </button>
                {profilePic && (
                  <button onClick={handleDeletePic} disabled={savingPic} style={{
                    padding:"10px 16px", borderRadius:10,
                    background:"white", color:"#EF4444",
                    border:"1.5px solid #EF4444",
                    fontFamily:"var(--eb-font)", fontSize:13, fontWeight:600,
                    cursor:"pointer",
                  }}>
                    Remove
                  </button>
                )}
                <button onClick={() => setEditingPic(false)} style={{
                  padding:"10px 16px", borderRadius:10,
                  background:"var(--eb-bg)", color:"var(--eb-muted)",
                  border:"1.5px solid var(--eb-border)",
                  fontFamily:"var(--eb-font)", fontSize:13, cursor:"pointer",
                }}>
                  Cancel
                </button>
              </div>
            )}

            {/* Stats bar */}
            <div style={{
              display:"flex", gap:0,
              marginTop:24,
              background:"var(--eb-bg)",
              borderRadius:14,
              overflow:"hidden",
              border:"1px solid var(--eb-border)",
            }}>
              {[
                { value:"4",       label:"Lines" },
                { value:"Boston",  label:"City"  },
                { value:"Active",  label:"Status"},
              ].map((s, i) => (
                <div key={s.label} style={{
                  flex:1, textAlign:"center", padding:"14px 8px",
                  borderRight: i < 2 ? "1px solid var(--eb-border)" : "none",
                }}>
                  <div style={{ fontSize:17, fontWeight:800, color:"var(--eb-text)", fontFamily:"var(--eb-font-h)" }}>{s.value}</div>
                  <div style={{ fontSize:11, color:"var(--eb-muted)", marginTop:2, fontWeight:500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:24 }}>
          {[
            { to:"/smart-route",  icon:"🚇", label:"Smart Route",  sub:"Plan your next trip",  gradient:"linear-gradient(135deg,#003DA5,#1a7fd4)" },
            { to:"/trip-history", icon:"📋", label:"Trip History", sub:"View past journeys",   gradient:"linear-gradient(135deg,#00843D,#34d399)"  },
            { to:"/explore",      icon:"🗺️", label:"Explore",      sub:"Discover Boston",      gradient:"linear-gradient(135deg,#7c3aed,#a78bfa)"  },
            { to:"/alerts",       icon:"🔔", label:"Alerts",       sub:"Live service updates", gradient:"linear-gradient(135deg,#ED8B00,#fbbf24)"  },
          ].map(a => (
            <Link key={a.label} to={a.to} style={{ textDecoration:"none" }}>
              <div
                style={{
                  background:"white", borderRadius:18,
                  border:"1.5px solid var(--eb-border)",
                  boxShadow:"0 2px 12px rgba(0,0,0,0.06)",
                  padding:"20px", display:"flex", alignItems:"center", gap:16,
                  cursor:"pointer", transition:"transform 0.15s, box-shadow 0.15s",
                }}
                onMouseOver={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,0.11)"; }}
                onMouseOut={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.06)"; }}
              >
                <div style={{
                  width:46, height:46, borderRadius:14,
                  background:a.gradient,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:22, flexShrink:0,
                  boxShadow:"0 4px 12px rgba(0,0,0,0.15)",
                }}>
                  {a.icon}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:"var(--eb-text)" }}>{a.label}</div>
                  <div style={{ fontSize:12, color:"var(--eb-muted)", marginTop:2 }}>{a.sub}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Profile Settings ── */}
        <div style={{
          background:"white", borderRadius:20,
          border:"1.5px solid var(--eb-border)",
          boxShadow:"0 2px 16px rgba(0,0,0,0.06)",
          overflow:"hidden",
          marginBottom:24,
        }}>
          <div style={{
            padding:"20px 28px",
            borderBottom:"1px solid var(--eb-border)",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            background:"linear-gradient(90deg, #fafbff, white)",
          }}>
            <div style={{ fontWeight:700, fontSize:15, color:"var(--eb-text)" }}>
              Profile Settings
            </div>
            {!editingProfile && (
              <button
                onClick={() => { setEditingProfile(true); setProfileForm({ firstName, lastName }); }}
                style={{
                  display:"flex", alignItems:"center", gap:6,
                  padding:"7px 16px", borderRadius:8,
                  border:"1.5px solid var(--eb-border)", background:"white",
                  fontFamily:"var(--eb-font)", fontSize:13, fontWeight:600,
                  color:"var(--eb-text)", cursor:"pointer",
                  transition:"border-color 0.2s, color 0.2s",
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor="var(--eb-blue)"; e.currentTarget.style.color="var(--eb-blue)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor="var(--eb-border)"; e.currentTarget.style.color="var(--eb-text)"; }}
              >
                <IcoEdit /> Edit
              </button>
            )}
          </div>

          <div style={{ padding:"24px 28px" }}>
            {editingProfile ? (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  {[
                    { key:"firstName", label:"FIRST NAME", placeholder:"First name" },
                    { key:"lastName",  label:"LAST NAME",  placeholder:"Last name"  },
                  ].map(f => (
                    <div key={f.key}>
                      <div style={{ fontSize:11, fontWeight:700, color:"var(--eb-muted)", letterSpacing:"0.07em", marginBottom:7 }}>{f.label}</div>
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        value={profileForm[f.key]}
                        onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{
                          width:"100%", boxSizing:"border-box",
                          padding:"11px 14px",
                          border:"1.5px solid var(--eb-border)", borderRadius:10,
                          fontFamily:"var(--eb-font)", fontSize:14, outline:"none",
                          background:"var(--eb-bg)", transition:"border-color 0.2s",
                        }}
                        onFocus={e => e.target.style.borderColor="var(--eb-blue)"}
                        onBlur={e => e.target.style.borderColor="var(--eb-border)"}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={handleSaveProfile} disabled={savingProfile} style={{
                    padding:"11px 24px", borderRadius:10,
                    background:"var(--eb-blue)", color:"white", border:"none",
                    fontFamily:"var(--eb-font)", fontSize:13, fontWeight:700,
                    cursor:"pointer", opacity:savingProfile?0.7:1,
                    boxShadow:"0 4px 12px rgba(0,61,165,0.3)",
                  }}>
                    {savingProfile ? "Saving…" : "Save changes"}
                  </button>
                  <button onClick={() => setEditingProfile(false)} style={{
                    padding:"11px 18px", borderRadius:10,
                    background:"var(--eb-bg)", color:"var(--eb-muted)",
                    border:"1.5px solid var(--eb-border)",
                    fontFamily:"var(--eb-font)", fontSize:13, cursor:"pointer",
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                {[
                  { label:"FIRST NAME", value:firstName || "Not set", empty:!firstName },
                  { label:"LAST NAME",  value:lastName  || "Not set", empty:!lastName  },
                  { label:"USERNAME",   value:`@${user.username}`, empty:false },
                  { label:"EMAIL",      value:user.email,          empty:false },
                ].map(({ label, value, empty }) => (
                  <div key={label}>
                    <div style={{ fontSize:11, fontWeight:700, color:"var(--eb-muted)", letterSpacing:"0.07em", marginBottom:6 }}>
                      {label}
                    </div>
                    <div style={{
                      fontSize:14, fontWeight:empty?400:600,
                      color:empty?"var(--eb-muted)":"var(--eb-text)",
                    }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── MBTA Lines ── */}
        <div style={{
          background:"white", borderRadius:20,
          border:"1.5px solid var(--eb-border)",
          boxShadow:"0 2px 16px rgba(0,0,0,0.06)",
          overflow:"hidden",
        }}>
          <div style={{
            padding:"20px 28px",
            borderBottom:"1px solid var(--eb-border)",
            fontWeight:700, fontSize:15, color:"var(--eb-text)",
            background:"linear-gradient(90deg, #fafbff, white)",
          }}>
            MBTA Subway Lines
          </div>
          <div style={{ padding:"20px 28px", display:"flex", flexDirection:"column", gap:10 }}>
            {LINES.map(line => (
              <div key={line.name} style={{
                display:"flex", alignItems:"center", gap:14,
                padding:"14px 18px", borderRadius:14,
                background:line.bg,
                transition:"transform 0.15s",
                cursor:"default",
              }}
                onMouseOver={e => e.currentTarget.style.transform="translateX(4px)"}
                onMouseOut={e => e.currentTarget.style.transform="translateX(0)"}
              >
                <div style={{
                  width:16, height:16, borderRadius:"50%",
                  background:line.color, flexShrink:0,
                  boxShadow:`0 0 0 4px ${line.color}30`,
                }}/>
                <span style={{ fontWeight:700, fontSize:14, color:line.color, minWidth:110 }}>
                  {line.name}
                </span>
                <span style={{ fontSize:13, color:"#374151" }}>{line.route}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Logout Confirm ── */}
      {showConfirm && (
        <div onClick={() => setConfirm(false)} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.5)",
          display:"flex", alignItems:"center", justifyContent:"center",
          zIndex:1000, backdropFilter:"blur(4px)",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background:"white", borderRadius:24,
            padding:"40px 36px", maxWidth:380, width:"100%",
            boxShadow:"0 32px 80px rgba(0,0,0,0.2)", textAlign:"center",
          }}>
            <div style={{
              width:64, height:64, borderRadius:"50%",
              background:"#FFF1F1", margin:"0 auto 16px",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:28,
            }}>
              👋
            </div>
            <h2 style={{ fontFamily:"var(--eb-font-h)", fontSize:22, color:"var(--eb-text)", margin:"0 0 8px" }}>
              Log out?
            </h2>
            <p style={{ fontSize:14, color:"var(--eb-muted)", marginBottom:28, lineHeight:1.6 }}>
              You'll need to sign in again to access your account.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirm(false)} style={{
                flex:1, padding:"13px", borderRadius:12,
                border:"1.5px solid var(--eb-border)", background:"white",
                fontFamily:"var(--eb-font)", fontSize:14, cursor:"pointer",
                color:"var(--eb-text)", fontWeight:500,
              }}>
                Cancel
              </button>
              <button onClick={handleLogout} style={{
                flex:1, padding:"13px", borderRadius:12,
                border:"none", background:"linear-gradient(135deg,#EF4444,#dc2626)",
                fontFamily:"var(--eb-font)", fontSize:14, fontWeight:700,
                cursor:"pointer", color:"white",
                boxShadow:"0 4px 14px rgba(239,68,68,0.35)",
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
