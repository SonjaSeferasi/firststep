const express = require("express");
const router = express.Router();

router.post("/nearby", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({
        error: "latitude and longitude must be numbers",
      });
    }

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({
        error: "Missing GOOGLE_PLACES_API_KEY in .env",
      });
    }

    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.location,places.primaryType",
        },
        body: JSON.stringify({
          includedTypes: [
            "restaurant",
            "tourist_attraction",
            "museum",
            "park",
            "shopping_mall",
          ],
          maxResultCount: 10,
          locationRestriction: {
            circle: {
              center: {
                latitude,
                longitude,
              },
              radius: 1000,
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Google Places request failed",
        details: data,
      });
    }

    const places = (data.places || []).map((place) => ({
      name: place.displayName?.text || "Unknown",
      address: place.formattedAddress || "No address available",
      category: place.primaryType || "other",
      latitude: place.location?.latitude || null,
      longitude: place.location?.longitude || null,
    }));

    return res.status(200).json(places);
  } catch (error) {
    console.error("Error fetching nearby locations:", error);
    return res.status(500).json({
      error: "Server error while fetching nearby locations",
    });
  }
});

module.exports = router;

