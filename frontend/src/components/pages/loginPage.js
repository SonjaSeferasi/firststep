import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import getUserInfo from "../../utilities/decodeJwt";
import "../../exbosHome.css";

const url = `${process.env.REACT_APP_BACKEND_SERVER_URI}/user/login`;

const Login = () => {
  const [data, setData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getUserInfo()) navigate("/privateUserProfile");
  }, [navigate]);

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data: res } = await axios.post(url, data);
      localStorage.setItem("accessToken", res.accessToken);
      navigate("/privateUserProfile");
    } catch (err) {
      if (err.response?.status >= 400 && err.response?.status <= 500) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--eb-bg)",
      fontFamily: "var(--eb-font)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52,
            background: "var(--eb-blue)",
            borderRadius: "var(--eb-radius-sm)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, margin: "0 auto 14px",
            boxShadow: "0 4px 16px rgba(0,61,165,0.25)",
          }}>
            🚇
          </div>
          <h1 style={{
            fontFamily: "var(--eb-font-h)",
            fontSize: 28, fontWeight: 800,
            color: "var(--eb-text)", margin: "0 0 6px",
            letterSpacing: "-0.5px",
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: "var(--eb-muted)", margin: 0 }}>
            Sign in to your ExBos account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "white",
          borderRadius: "var(--eb-radius)",
          border: "1px solid var(--eb-border)",
          boxShadow: "var(--eb-shadow)",
          padding: "32px",
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Username */}
            <div>
              <label style={{
                display: "block",
                fontSize: 11, fontWeight: 700,
                color: "var(--eb-muted)",
                textTransform: "uppercase", letterSpacing: "0.6px",
                marginBottom: 8,
              }}>
                Username
              </label>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                border: "1px solid var(--eb-border)",
                borderRadius: "var(--eb-radius-sm)",
                padding: "10px 14px",
                background: "var(--eb-bg)",
              }}>
                <span style={{ color: "var(--eb-muted)", fontSize: 16 }}>👤</span>
                <input
                  type="text"
                  name="username"
                  value={data.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  style={{
                    flex: 1, border: "none", outline: "none",
                    background: "transparent", fontSize: 14,
                    fontFamily: "var(--eb-font)", color: "var(--eb-text)",
                    padding: 0,
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: "block",
                fontSize: 11, fontWeight: 700,
                color: "var(--eb-muted)",
                textTransform: "uppercase", letterSpacing: "0.6px",
                marginBottom: 8,
              }}>
                Password
              </label>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                border: "1px solid var(--eb-border)",
                borderRadius: "var(--eb-radius-sm)",
                padding: "10px 14px",
                background: "var(--eb-bg)",
              }}>
                <span style={{ color: "var(--eb-muted)", fontSize: 16 }}>🔒</span>
                <input
                  type="password"
                  name="password"
                  value={data.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  style={{
                    flex: 1, border: "none", outline: "none",
                    background: "transparent", fontSize: 14,
                    fontFamily: "var(--eb-font)", color: "var(--eb-text)",
                    padding: 0,
                  }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "#FFF2F2", border: "1px solid #FECACA",
                borderRadius: "var(--eb-radius-sm)", padding: "10px 14px",
                fontSize: 13, color: "#991B1B",
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "var(--eb-blue)", color: "white", border: "none",
                borderRadius: "var(--eb-radius-sm)", padding: "13px",
                fontSize: 14, fontWeight: 700, fontFamily: "var(--eb-font)",
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "background 0.2s, transform 0.1s",
                marginTop: 4,
              }}
              onMouseOver={e => { if (!loading) e.currentTarget.style.background = "#002d7a"; }}
              onMouseOut={e => { e.currentTarget.style.background = "var(--eb-blue)"; }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "sr-spin 0.7s linear infinite",
                  }} />
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <p style={{ textAlign: "center", fontSize: 14, color: "var(--eb-muted)", marginTop: 20 }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{
            color: "var(--eb-blue)", fontWeight: 600, textDecoration: "none",
          }}>
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
