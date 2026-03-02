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
const createReviewRoute = require("./routes/reviews/Review");
const getAllReviewsRoute = require("./routes/reviews/getAllReviews");
const createPointOfInterest = require("./routes/pois/createPointOfInterest");
const getPointOfInterest = require("./routes/pois/getPointOfInterest");




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
app.use("/api/pois", createPointOfInterest); // POST /api/trips
app.use("/api/pois", getPointOfInterest); // GET /api/pois

app.listen(SERVER_PORT, (req, res) => {
    console.log(`The backend service is running on port ${SERVER_PORT} and waiting for requests.`);
})
