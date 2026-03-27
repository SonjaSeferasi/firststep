const express = require("express");
const app = express();
const cors = require('cors')
const loginRoute = require('./routes/userLogin')
const getAllUsersRoute = require('./routes/userGetAllUsers')
const registerRoute = require('./routes/userSignUp')
const getUserByIdRoute = require('./routes/userGetUserById')
const dbConnection = require('./config/db.config')
const editUser = require('./routes/userEditUser')
const deleteUser = require('./routes/userDeleteAll')
const createTripRoute = require("./routes/trips/createTrip");
const getAllTripsRoute = require("./routes/trips/getAllTrips");
const createReviewRoute = require("./routes/reviews/Reviews");
const getAllReviewsRoute = require("./routes/reviews/getReviews");
const createAlertRoute = require("./routes/serviceAlerts/createAlert");
const getAlertsRoute = require("./routes/serviceAlerts/getAlert");
const createPois = require ("./routes/pois/createPointOfInterest");
const getPois = require("./routes/pois/getPointOfInterest");
const smartRoute = require("./routes/smartRoute/getSmartRoute");
const { loadStops } = require("./data/mbtaStops");

require('dotenv').config();
const SERVER_PORT = 8081

dbConnection()
app.use(cors({origin: '*'}))
app.use(express.json())
app.use('/user', loginRoute)
app.use('/user', registerRoute)
app.use('/user', getAllUsersRoute)
app.use('/user', getUserByIdRoute)
app.use('/user', editUser)
app.use('/user', deleteUser)
app.use("/api/trips", createTripRoute);   // POST /api/trips
app.use("/api/trips", getAllTripsRoute);  // GET  /api/trips
app.use("/api/reviews", createReviewRoute);
app.use("/api/reviews", getAllReviewsRoute);
app.use("/api/alerts", createAlertRoute);
app.use("/api/alerts", getAlertsRoute);
app.use("/api/pois", createPois);
app.use("/api/pois", getPois);
app.use("/api/smart-route", smartRoute);

// Start server immediately so it's always reachable.
// MBTA stop data loads in the background — the route handler
// returns a 503 if a request arrives before loading finishes.
app.listen(SERVER_PORT, () => {
    console.log(`The backend service is running on port ${SERVER_PORT} and waiting for requests.`);
});

loadStops(process.env.MBTA_API_KEY).catch(err => {
    console.error("[MBTA] loadStops failed:", err.message);
});
