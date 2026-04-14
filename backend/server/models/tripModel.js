const mongoose = require("mongoose");

// A single transit segment (one line, list of stops)
const segmentSchema = new mongoose.Schema(
  {
    line:      { type: String, required: true },   // e.g. "Red", "Green"
    color:     { type: String },                   // hex color for display
    direction: { type: String },                   // e.g. "toward Alewife"
    boardAt:   { type: String },                   // name of boarding stop
    exitAt:    { type: String },                   // name of exit stop
    stops:     [{ type: String }],                 // all stop names in order
    stopCount: { type: Number },
  },
  { _id: false }  // no separate _id for sub-documents
);

// One full route option (recommended or alternative)
const routeSchema = new mongoose.Schema(
  {
    type:              { type: String },   
    label:             { type: String },   
    boardingStop:      { type: String },
    exitStop:          { type: String },
    primaryLine:       { type: String },
    primaryColor:      { type: String },
    transfers:         { type: Number },
    totalStops:        { type: Number },
    estimatedMinutes:  { type: Number },
    walkToStopMinutes: { type: Number },
    walkToStopMeters:  { type: Number },
    segments:          [segmentSchema],
  },
  { _id: false }
);


const tripSchema = new mongoose.Schema(
  {
    // Which user saved this — stored as the MongoDB _id from the users collection
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",      
      required: true,
    },

    // Origin info returned by the smart-route API
    origin: {
      stopId:         { type: String },
      name:           { type: String, required: true },
      distanceMeters: { type: Number, default: 0 },
      originMode:     { type: String },  // "gps" | "text" | "default"
    },

    // Destination info returned by the smart-route API
    destination: {
      stopId: { type: String },
      name:   { type: String, required: true },
    },

    // All route options returned by the API
    routes: [routeSchema],

    // When the user clicked "Save Trip"
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "trips" }
);

module.exports = mongoose.model("trips", tripSchema);
