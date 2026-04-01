import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";

var SUBWAY_LINES = [
  { id: "Red",                             name: "Red Line"    },
  { id: "Orange",                          name: "Orange Line" },
  { id: "Green-B,Green-C,Green-D,Green-E", name: "Green Line"  },
  { id: "Blue",                            name: "Blue Line"   },
];

function ReviewPage() {
  const navigate = useNavigate();
  const user = getUserInfo();

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
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load ALL stations once (search mode)
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

  var suggestions = stationSearch.length > 0
    ? allStations.filter(function(s) {
        return s.name.toLowerCase().indexOf(stationSearch.toLowerCase()) !== -1;
      }).slice(0, 8)
    : [];

  var handleSelectStation = function(station) {
    setSelectedStation(station.id);
    setSelectedStationName(station.name);
    setStationSearch(station.name);
    setShowSuggestions(false);
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

  // Load reviews from backend
  var loadReviews = function() {
    var url = "/api/reviews?sort=" + sort;
    if (filterRating) url += "&rating=" + filterRating;

    fetch(url)
      .then(function(res) {
        var ct = res.headers.get("content-type");
        if (!ct || ct.indexOf("application/json") === -1) {
          console.error("Expected JSON from /reviews but got HTML — check proxy in package.json");
          return null;
        }
        return res.json();
      })
      .then(function(data) {
        if (Array.isArray(data)) {
          setReviews(data);
        }
      })
      .catch(function(err) { console.error("Error loading reviews:", err); });
  };

  useEffect(function() {
    loadReviews();
  }, [sort, filterRating]); // eslint-disable-line react-hooks/exhaustive-deps

  // Submit review
  var handleSubmit = function(e) {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!user) {
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

    var body = JSON.stringify({
      userId: user._id,
      targetType: "station",
      targetId: selectedStation,
      rating: Number(rating),
      reviewText: reviewText.trim(),
      photos: [],
    });

    console.log("Submitting review:", body);

    fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    })
      .then(function(res) {
        var ct = res.headers.get("content-type");
        if (!ct || ct.indexOf("application/json") === -1) {
          setSubmitError("Server error — check that your backend is running on port 8081 and proxy is set.");
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

        // Success — reset form
        setReviewText("");
        setRating(5);
        setSelectedStation("");
        setSelectedStationName("");
        setStationSearch("");
        setSelectedLine("");
        setSubmitSuccess(true);
        setTimeout(function() { setSubmitSuccess(false); }, 3000);
        loadReviews();
      })
      .catch(function(err) {
        console.error("Submit error:", err);
        setSubmitError("Could not connect to the server. Make sure your backend is running.");
      });
  };

  var inputStyle = {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
  };

  var tabStyle = function(active) {
    return {
      padding: "7px 18px",
      border: "1px solid #ccc",
      borderBottom: active ? "2px solid #003DA5" : "1px solid #ccc",
      borderRadius: "6px 6px 0 0",
      background: active ? "#fff" : "#f5f5f5",
      color: active ? "#003DA5" : "#555",
      fontWeight: active ? 700 : 400,
      cursor: "pointer",
      fontSize: "14px",
      marginRight: "4px",
    };
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "30px" }}>
      <h1>MBTA Station Reviews</h1>

      {user ? (
        <form onSubmit={handleSubmit}>
          <h3>Write a Review</h3>

          {/* Mode tabs */}
          <div style={{ marginBottom: "-1px" }}>
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
          <div style={{ border: "1px solid #ccc", borderRadius: "0 6px 6px 6px", padding: "16px", marginBottom: "16px" }}>

            {pickerMode === "search" && (
              <div style={{ position: "relative" }}>
                <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
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
              <div>
                <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>Line</label>
                <select
                  value={selectedLine}
                  onChange={handleLineChange}
                  style={Object.assign({}, inputStyle, { marginBottom: "12px" })}
                >
                  <option value="">Select a Line</option>
                  {SUBWAY_LINES.map(function(line) {
                    return <option key={line.id} value={line.id}>{line.name}</option>;
                  })}
                </select>

                <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>Station</label>
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
            )}

            {selectedStation && (
              <div style={{ marginTop: "10px", color: "#00843D", fontWeight: 600, fontSize: "13px" }}>
                {"Selected: " + selectedStationName}
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

          <br />

          {/* Review text */}
          <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>Review</label>
          <textarea
            rows="4"
            style={inputStyle}
            placeholder="Write your review..."
            value={reviewText}
            onChange={function(e) { setReviewText(e.target.value); }}
          />

          <br /><br />

          {/* Error / success messages */}
          {submitError && (
            <div style={{ marginBottom: "10px", color: "#cc0000", fontWeight: 600, fontSize: "14px" }}>
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div style={{ marginBottom: "10px", color: "#00843D", fontWeight: 600, fontSize: "14px" }}>
              Review submitted successfully!
            </div>
          )}

          <button
            type="submit"
            style={{
              padding: "10px 24px",
              background: "#003DA5",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Submit Review
          </button>
        </form>
      ) : (
        <p>
          You must be logged in to write a review.{" "}
          <button onClick={function() { navigate("/login"); }}>Login</button>
        </p>
      )}

      <hr />

      <h3>Filter Reviews</h3>

      <label>Sort: </label>
      <select value={sort} onChange={function(e) { setSort(e.target.value); }}>
        <option value="newest">Newest</option>
        <option value="highest">Highest Rating</option>
      </select>

      <label style={{ marginLeft: "20px" }}>Rating: </label>
      <select value={filterRating} onChange={function(e) { setFilterRating(e.target.value); }}>
        <option value="">All</option>
        <option value="5">5 ⭐</option>
        <option value="4">4 ⭐</option>
        <option value="3">3 ⭐</option>
        <option value="2">2 ⭐</option>
        <option value="1">1 ⭐</option>
      </select>

      <hr />

      <h2>Reviews</h2>

      {reviews.length === 0 && (
        <p style={{ color: "#888" }}>No reviews yet. Be the first to write one!</p>
      )}

      {reviews.map(function(review) {
        return (
          <div
            key={review._id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "6px",
            }}
          >
            <strong>{"Rating: " + review.rating + " ⭐"}</strong>
            <p>{review.reviewText}</p>
            <small>
              {(review.userId && review.userId.name) ? review.userId.name : "User"}
              {" • "}
              {new Date(review.createdAt).toLocaleDateString()}
            </small>
          </div>
        );
      })}
    </div>
  );
}

export default ReviewPage;