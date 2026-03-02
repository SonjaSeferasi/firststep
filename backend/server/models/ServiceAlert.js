const mongoose = require("mongoose");

const ServiceAlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  line: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}); 


module.exports = mongoose.model("ServiceAlert", ServiceAlertSchema);