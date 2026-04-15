import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";

var SUBWAY_LINES = [
  { id: "Red",                             name: "Red Line"    },
  { id: "Orange",                          name: "Orange Line" },
  { id: "Green-B,Green-C,Green-D,Green-E", name: "Green Line"  },
  { id: "Blue",                            name: "Blue Line"   },
];

function ReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = getUserInfo();
  const userId = user?._id || user?.id;

  const [allStations, setAllStations] = useState([]);
  const [lineStations, setLineStations] = useState({});
  const [pickerMode, setPickerMode] = useState("search");
  const [stationSearch, setStationSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLine, setSelectedLine] = useState("");
  const [selectedStation, setSelectedStation] = useState("");
  const [selectedStationName, setSelectedStationName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [sort, setSort] = useState("newest");
  const [filterRating, setFilterRating] = useState("");
  // Filter reviews by station — separate from the form's selected station
  const [filterStationId, setFilterStationId] = useState("");
  const [filterStationSearch, setFilterStationSearch] = useState("");
  const [showFilterSuggestions, setShowFilterSuggestions] = useState(false);
  const [filterPickerMode, setFilterPickerMode] = useState("search");
  const [filterSelectedLine, setFilterSelectedLine] = useState("");
  const [filterStationName, setFilterStationName] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load ALL stations once (used for both search modes)
  useEffect(function() {
    fetch("https://api-v3.mbta.com/stops?filter[location_type]=1")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var stops = data.data.map(function(stop) {
          return { id: stop.id, name: stop.attributes.name };
        });
        stops.sort(function(a, b) { return a.name.localeCompare(b.name); });
        setAllStations(stops);
      })
      .catch(function(err) { console.error("Error loading stations", err); });
  }, []);

  // Load stations for selected line (dropdown mode)
  useEffect(function() {
    if (!selectedLine) return;
    if (lineStations[selectedLine]) return;

    fetch("https://api-v3.mbta.com/stops?filter[route]=" + selectedLine + "&filter[location_type]=1")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var stops = data.data.map(function(stop) {
          return { id: stop.id, name: stop.attributes.name };
        });
        stops.sort(function(a, b) { return a.name.localeCompare(b.name); });
        setLineStations(function(prev) {
          var next = Object.assign({}, prev);
          next[selectedLine] = stops;
          return next;
        });
      })
      .catch(function(err) { console.error("Error loading line stations", err); });
  }, [selectedLine]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load stations for selected filter line (dropdown mode)
  useEffect(function() {
    if (!filterSelectedLine) return;
    if (lineStations[filterSelectedLine]) return;

    fetch("https://api-v3.mbta.com/stops?filter[route]=" + filterSelectedLine + "&filter[location_type]=1")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var stops = data.data.map(function(stop) {
          return { id: stop.id, name: stop.attributes.name };
        });
        stops.sort(function(a, b) { return a.name.localeCompare(b.name); });
        setLineStations(function(prev) {
          var next = Object.assign({}, prev);
          next[filterSelectedLine] = stops;
          return next;
        });
      })
      .catch(function(err) { console.error("Error loading line stations", err); });
  }, [filterSelectedLine]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(function() {
    var line = searchParams.get("line");
    if (line) {
      switchMode("dropdown");
      setSelectedLine(line);
    }

    var stationId = searchParams.get("stationId");
    var stationName = searchParams.get("stationName");
    if (stationId) {
      var selectedName = stationName || "";
      var match = allStations.find(function(s) { return s.id === stationId; });
      if (!selectedName && match) {
        selectedName = match.name;
      }

      switchMode("search");
      setSelectedStation(stationId);
      if (selectedName) {
        setStationSearch(selectedName);
        setSelectedStationName(selectedName);
      }

      // Also pre-fill filter state so reviews are filtered for this station.
      setFilterPickerMode("search");
      setFilterStationId(stationId);
      setFilterStationName(selectedName || stationId);
      setFilterStationSearch(selectedName || stationId);
    }
  }, [allStations, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Suggestions for the review form station picker
  var suggestions = stationSearch.length > 0
    ? allStations.filter(function(s) {
        return s.name.toLowerCase().indexOf(stationSearch.toLowerCase()) !== -1;
      }).slice(0, 8)
    : [];

  // Suggestions for the filter-by-station search box
  var filterSuggestions = filterStationSearch.length > 0
    ? allStations.filter(function(s) {
        return s.name.toLowerCase().indexOf(filterStationSearch.toLowerCase()) !== -1;
      }).slice(0, 8)
    : [];

  var handleSelectStation = function(station) {
    setSelectedStation(station.id);
    setSelectedStationName(station.name);
    setStationSearch(station.name);
    setShowSuggestions(false);
  };

  var handleSelectFilterStation = function(station) {
    setFilterStationId(station.id);
    setFilterStationName(station.name);
    setFilterStationSearch(station.name);
    setShowFilterSuggestions(false);
  };

  var handleClearFilterStation = function() {
    setFilterStationId("");
    setFilterStationName("");
    setFilterStationSearch("");
    setFilterSelectedLine("");
  };

  var switchFilterMode = function(mode) {
    setFilterPickerMode(mode);
    setFilterStationId("");
    setFilterStationName("");
    setFilterStationSearch("");
    setFilterSelectedLine("");
    setShowFilterSuggestions(false);
  };

  var handleFilterLineChange = function(e) {
    setFilterSelectedLine(e.target.value);
    setFilterStationId("");
    setFilterStationName("");
  };

  var handleDropdownFilterStationChange = function(e) {
    var id = e.target.value;
    var stationList = lineStations[filterSelectedLine] || [];
    var match = stationList.find(function(s) { return s.id === id; });
    setFilterStationId(id);
    setFilterStationName(match ? match.name : "");
  };

  var handleLineChange = function(e) {
    setSelectedLine(e.target.value);
    setSelectedStation("");
    setSelectedStationName("");
  };

  var handleDropdownStationChange = function(e) {
    var id = e.target.value;
    var stationList = lineStations[selectedLine] || [];
    var match = stationList.find(function(s) { return s.id === id; });
    setSelectedStation(id);
    setSelectedStationName(match ? match.name : "");
  };

  var switchMode = function(mode) {
    setPickerMode(mode);
    setSelectedStation("");
    setSelectedStationName("");
    setStationSearch("");
    setSelectedLine("");
    setShowSuggestions(false);
  };

  // Load reviews — respects sort, rating, and station filters
  var loadReviews = function(overrideStationId) {
    var stationId = overrideStationId !== undefined ? overrideStationId : filterStationId;
    var url = "http://localhost:8081/api/reviews?sort=" + sort;
    if (filterRating) url += "&rating=" + filterRating;
    if (stationId) url += "&targetId=" + encodeURIComponent(stationId);

    fetch(url)
      .then(function(res) {
        // Check if the response status is 200-299
        if (!res.ok) {
          throw new Error("Server returned status " + res.status);
        }
        var ct = res.headers.get("content-type");
        if (!ct || ct.indexOf("application/json") === -1) {
          throw new Error("Expected JSON but got " + ct);
        }
        return res.json();
      })
      .then(function(data) {
        if (Array.isArray(data)) {
          setReviews(data);
        }
      })
      .catch(function(err) {
        console.error("Error loading reviews:", err.message);
        // Add UI feedback here, e.g., setReviewsError(true);
      });
  };

  useEffect(function() {
    loadReviews();
  }, [sort, filterRating, filterStationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Submit review
  var handleSubmit = function(e) {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!user || !userId) {
      navigate("/login");
      return;
    }

    if (!selectedStation) {
      setSubmitError("Please select a station before submitting.");
      return;
    }

    if (!reviewText.trim()) {
      setSubmitError("Please write a review before submitting.");
      return;
    }

    var submittedStationId = selectedStation;
    var submittedStationName = selectedStationName;

    var body = JSON.stringify({
      userId: userId,
      targetType: "station",
      targetId: submittedStationId,
      rating: Number(rating),
      reviewText: reviewText.trim(),
    });

    var postUrl = "http://localhost:8081/api/reviews?sort=" + sort;

    fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    })
      .then(function(res) {
        var ct = res.headers.get("content-type");
        if (!ct || ct.indexOf("application/json") === -1) {
          setSubmitError("Server error — make sure your backend is running on port 8081.");
          return null;
        }
        return res.json().then(function(data) {
          return { ok: res.ok, status: res.status, data: data };
        });
      })
      .then(function(result) {
        if (!result) return;

        if (!result.ok) {
          setSubmitError(result.data.message || "Submission failed. Please try again.");
          return;
        }

        // The backend now returns the full list of reviews for the station.
        if (Array.isArray(result.data)) {
          setReviews(result.data);
        }

        // Reset the form
        setReviewText("");
        setRating(5);
        setSelectedStation("");
        setSelectedStationName("");
        setStationSearch("");
        setSelectedLine("");
        setSubmitSuccess(true);
        setTimeout(function() { setSubmitSuccess(false); }, 3000);

        // Automatically filter the reviews list to show the station just reviewed
        setFilterPickerMode("search");
        setFilterStationId(submittedStationId);
        setFilterStationName(submittedStationName);
        setFilterStationSearch(submittedStationName);
      })
      .catch(function(err) {
        console.error("Submit error:", err);
        setSubmitError("Could not connect to the server. Make sure your backend is running.");
      });
  };

  var inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    fontSize: "15px",
    boxSizing: "border-box",
    color: "#111827",
    background: "white",
  };

  var cardStyle = {
    background: "white",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
    border: "1px solid #e5e7eb",
  };

  var pillStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 600,
  };

  var buttonPrimary = {
    padding: "12px 24px",
    background: "#003DA5",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  };

  var buttonSecondary = {
    padding: "10px 18px",
    background: "#eef2ff",
    color: "#1d4ed8",
    border: "1px solid #dbeafe",
    borderRadius: "10px",
    fontSize: "14px",
    cursor: "pointer",
  };

  var tabStyle = function(active) {
    return {
      padding: "10px 18px",
      borderRadius: "12px",
      border: active ? "1px solid #003DA5" : "1px solid #e5e7eb",
      background: active ? "#eff6ff" : "#f8fafc",
      color: active ? "#003DA5" : "#374151",
      fontWeight: active ? 700 : 600,
      cursor: "pointer",
      fontSize: "14px",
      marginRight: "8px",
    };
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9", padding: "32px 20px" }}>
      <div style={{ maxWidth: "980px", margin: "auto", display: "grid", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#111827", marginBottom: 6 }}>Station Reviews</div>
              <p style={{ margin: 0, color: "#4b5563", fontSize: 15, maxWidth: 700 }}>
                Browse rider reviews, filter by line or station, and submit feedback for the MBTA stops you care about.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span style={Object.assign({}, pillStyle, { background: "#e0f2fe", color: "#0369a1" })}>{reviews.length} reviews</span>
              <span style={Object.assign({}, pillStyle, { background: "#f0f9ff", color: "#1d4ed8" })}>{filterStationName ? filterStationName : "All stations"}</span>
            </div>
          </div>
        </div>

        {user && userId ? (
          <form onSubmit={handleSubmit} style={Object.assign({}, cardStyle, { display: "grid", gap: 24 })}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 6 }}>Write a review</div>
                <p style={{ margin: 0, color: "#4b5563", fontSize: 14 }}>Choose a station, rate it, and share your experience with other riders.</p>
              </div>
              {selectedStationName && (
                <span style={Object.assign({}, pillStyle, { background: "#eff6ff", color: "#1d4ed8" })}>Selected: {selectedStationName}</span>
              )}
            </div>

          {/* Mode tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              style={tabStyle(pickerMode === "search")}
              onClick={function() { switchMode("search"); }}
            >
              Search by Name
            </button>
            <button
              type="button"
              style={tabStyle(pickerMode === "dropdown")}
              onClick={function() { switchMode("dropdown"); }}
            >
              Browse by Line
            </button>
          </div>

          {/* Tab panel */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "18px", padding: "18px", marginBottom: "0" }}>

            {pickerMode === "search" && (
              <div style={{ position: "relative" }}>
                <label style={{ fontWeight: 600, display: "block", marginBottom: "10px", color: "#374151" }}>
                  Search Station
                </label>
                <input
                  type="text"
                  placeholder="e.g. Park Street, Kendall..."
                  value={stationSearch}
                  onChange={function(e) {
                    setStationSearch(e.target.value);
                    setSelectedStation("");
                    setSelectedStationName("");
                    setShowSuggestions(true);
                  }}
                  onFocus={function() { setShowSuggestions(true); }}
                  onBlur={function() {
                    setTimeout(function() { setShowSuggestions(false); }, 150);
                  }}
                  style={inputStyle}
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    border: "1px solid #ccc",
                    borderRadius: "0 0 6px 6px",
                    background: "#fff",
                    zIndex: 10,
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}>
                    {suggestions.map(function(s) {
                      return (
                        <div
                          key={s.id}
                          onMouseDown={function() { handleSelectStation(s); }}
                          style={{ padding: "8px 12px", cursor: "pointer", fontSize: "14px", borderBottom: "1px solid #f0f0f0" }}
                          onMouseEnter={function(e) { e.currentTarget.style.background = "#f0f5ff"; }}
                          onMouseLeave={function(e) { e.currentTarget.style.background = "#fff"; }}
                        >
                          {s.name}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {pickerMode === "dropdown" && (
              <div style={{ display: "grid", gap: "16px" }}>
                <div>
                  <label style={{ fontWeight: 600, display: "block", marginBottom: "10px", color: "#374151" }}>Line</label>
                  <select
                    value={selectedLine}
                    onChange={handleLineChange}
                    style={Object.assign({}, inputStyle, { marginBottom: "0" })}
                  >
                    <option value="">Select a Line</option>
                    {SUBWAY_LINES.map(function(line) {
                      return <option key={line.id} value={line.id}>{line.name}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: 600, display: "block", marginBottom: "10px", color: "#374151" }}>Station</label>
                  <select
                    value={selectedStation}
                    onChange={handleDropdownStationChange}
                    disabled={!selectedLine || !lineStations[selectedLine]}
                    style={inputStyle}
                  >
                    <option value="">
                      {!selectedLine ? "Select a line first" : !lineStations[selectedLine] ? "Loading stations..." : "Select a Station"}
                    </option>
                    {(lineStations[selectedLine] || []).map(function(s) {
                      return <option key={s.id} value={s.id}>{s.name}</option>;
                    })}
                  </select>
                </div>
              </div>
            )}

            {selectedStation && (
              <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <span style={Object.assign({}, pillStyle, { background: "#eff6ff", color: "#1d4ed8" })}>{selectedStationName}</span>
                <Link
                  to={`/stations/${selectedStation}`}
                  style={Object.assign({}, buttonSecondary, { padding: "8px 14px", fontSize: "13px" })}
                >
                  View station
                </Link>
              </div>
            )}
          </div>

          {/* Rating */}
          <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>Rating</label>
          <select
            value={rating}
            onChange={function(e) { setRating(e.target.value); }}
            style={Object.assign({}, inputStyle, { width: "auto", marginBottom: "16px" })}
          >
            <option value="1">1 ⭐</option>
            <option value="2">2 ⭐</option>
            <option value="3">3 ⭐</option>
            <option value="4">4 ⭐</option>
            <option value="5">5 ⭐</option>
          </select>

          <div style={{ display: "grid", gap: "10px" }}>
            <label style={{ fontWeight: 600, color: "#374151" }}>Review</label>
            <textarea
              rows="5"
              style={Object.assign({}, inputStyle, { minHeight: "130px", resize: "vertical" })}
              placeholder="Write your review..."
              value={reviewText}
              onChange={function(e) { setReviewText(e.target.value); }}
            />
          </div>

          {submitError && (
            <div style={{ marginBottom: "10px", color: "#cc0000", fontWeight: 600, fontSize: "14px" }}>
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div style={{ marginBottom: "10px", color: "#00843D", fontWeight: 600, fontSize: "14px" }}>
              Review submitted! Showing all reviews for {filterStationName || filterStationSearch}.
            </div>
          )}

          <button
            type="submit"
            style={buttonPrimary}
          >
            Submit Review
          </button>
        </form>
      ) : (
        <div style={Object.assign({}, cardStyle, { textAlign: "center" })}>
          <p style={{ margin: 0, color: "#4b5563" }}>You must be logged in to write a review.</p>
          <button
            type="button"
            onClick={function() { navigate("/login"); }}
            style={Object.assign({}, buttonPrimary, { marginTop: "16px" })}
          >
            Login
          </button>
        </div>
      )}

      <div style={Object.assign({}, cardStyle, { display: "grid", gap: 24 })}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#111827" }}>Filter reviews</div>
          <p style={{ margin: 0, color: "#4b5563" }}>Choose a station or sort order to narrow the review feed.</p>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <div>
            <label style={{ fontWeight: 600, display: "block", marginBottom: "10px", color: "#374151" }}>Filter by Station</label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
              <button
                type="button"
                style={tabStyle(filterPickerMode === "search")}
                onClick={function() { switchFilterMode("search"); }}
              >
                Search by Name
              </button>
              <button
                type="button"
                style={tabStyle(filterPickerMode === "dropdown")}
                onClick={function() { switchFilterMode("dropdown"); }}
              >
                Browse by Line
              </button>
            </div>

            <div style={{ border: "1px solid #e5e7eb", borderRadius: "18px", background: "#f8fafc", padding: "18px" }}>
              {filterPickerMode === "search" && (
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="e.g. Park Street, Kendall..."
                    value={filterStationSearch}
                    onChange={function(e) {
                      setFilterStationSearch(e.target.value);
                      setFilterStationId("");
                      setFilterStationName("");
                      setShowFilterSuggestions(true);
                    }}
                    onFocus={function() { setShowFilterSuggestions(true); }}
                    onBlur={function() {
                      setTimeout(function() { setShowFilterSuggestions(false); }, 150);
                    }}
                    style={inputStyle}
                    autoComplete="off"
                  />
                  {showFilterSuggestions && filterSuggestions.length > 0 && (
                    <div style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      border: "1px solid #d1d5db",
                      borderRadius: "0 0 12px 12px",
                      background: "#fff",
                      zIndex: 10,
                      maxHeight: "220px",
                      overflowY: "auto",
                    }}>
                      {filterSuggestions.map(function(s) {
                        return (
                          <div
                            key={s.id}
                            onMouseDown={function() { handleSelectFilterStation(s); }}
                            style={{ padding: "10px 14px", cursor: "pointer", fontSize: "14px", borderBottom: "1px solid #f0f0f0" }}
                            onMouseEnter={function(e) { e.currentTarget.style.background = "#f0f5ff"; }}
                            onMouseLeave={function(e) { e.currentTarget.style.background = "#fff"; }}
                          >
                            {s.name}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {filterPickerMode === "dropdown" && (
                <div style={{ display: "grid", gap: "16px" }}>
                  <div>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: "10px", color: "#374151" }}>Line</label>
                    <select
                      value={filterSelectedLine}
                      onChange={handleFilterLineChange}
                      style={inputStyle}
                    >
                      <option value="">Select a Line</option>
                      {SUBWAY_LINES.map(function(line) {
                        return <option key={line.id} value={line.id}>{line.name}</option>;
                      })}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: "10px", color: "#374151" }}>Station</label>
                    <select
                      value={filterStationId}
                      onChange={handleDropdownFilterStationChange}
                      disabled={!filterSelectedLine || !lineStations[filterSelectedLine]}
                      style={inputStyle}
                    >
                      <option value="">
                        {!filterSelectedLine ? "Select a line first" : !lineStations[filterSelectedLine] ? "Loading stations..." : "All Stations"}
                      </option>
                      {(lineStations[filterSelectedLine] || []).map(function(s) {
                        return <option key={s.id} value={s.id}>{s.name}</option>;
                      })}
                    </select>
                  </div>
                </div>
              )}

              {filterStationId && (
                <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={Object.assign({}, pillStyle, { background: "#eff6ff", color: "#1d4ed8" })}>
                    Filtered by: {filterStationName}
                  </span>
                  <Link
                    to={`/stations/${filterStationId}`}
                    style={Object.assign({}, buttonSecondary, { padding: "8px 14px", fontSize: "13px" })}
                  >
                    View Station
                  </Link>
                  <button
                    type="button"
                    onClick={handleClearFilterStation}
                    style={Object.assign({}, buttonSecondary, { background: "white", borderColor: "#d1d5db" })}
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <div style={{ display: "grid", gap: "8px" }}>
              <label style={{ fontWeight: 600, color: "#374151" }}>Sort</label>
              <select value={sort} onChange={function(e) { setSort(e.target.value); }} style={inputStyle}>
                <option value="newest">Newest</option>
                <option value="highest">Highest Rating</option>
              </select>
            </div>
            <div style={{ display: "grid", gap: "8px" }}>
              <label style={{ fontWeight: 600, color: "#374151" }}>Rating</label>
              <select value={filterRating} onChange={function(e) { setFilterRating(e.target.value); }} style={inputStyle}>
                <option value="">All</option>
                <option value="5">5 ⭐</option>
                <option value="4">4 ⭐</option>
                <option value="3">3 ⭐</option>
                <option value="2">2 ⭐</option>
                <option value="1">1 ⭐</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>
            Reviews{filterStationName ? " — " + filterStationName : ""}
          </div>
          <span style={Object.assign({}, pillStyle, { background: "#f8fafc", color: "#0f172a" })}>{reviews.length} reviews</span>
        </div>

        </div>

        <div style={{ display: "grid", gap: "16px" }}>
          {reviews.length === 0 ? (
            <p style={{ color: "#6b7280" }}>
              {filterStationName
                ? "No reviews yet for " + filterStationName + "."
                : "No reviews yet. Be the first to write one!"}
            </p>
          ) : (
            reviews.map(function(review) {
              var stationName = review.targetId;
              var matchedStation = allStations.find(function(s) { return s.id === review.targetId; });
              if (matchedStation) {
                stationName = matchedStation.name;
              }

              return (
                <div
                  key={review._id}
                  style={Object.assign({}, cardStyle, { padding: "18px", borderColor: "#e5e7eb" })}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>
                        {review.rating} ⭐ Rating
                      </div>
                      <div style={{ color: "#4b5563", fontSize: "14px" }}>{review.reviewText.slice(0, 80) + (review.reviewText.length > 80 ? "..." : "")}</div>
                    </div>
                    <span style={{ color: "#003DA5", fontWeight: 600, fontSize: "14px" }}>
                      📍 {stationName}
                    </span>
                  </div>

                  <div style={{ color: "#111827", lineHeight: 1.7 }}>
                    {review.reviewText}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginTop: "16px", color: "#6b7280", fontSize: "13px" }}>
                    <span>{(review.userId && review.userId.name) ? review.userId.name : "User"}</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewPage;