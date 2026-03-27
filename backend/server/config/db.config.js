const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

module.exports = () => {
    const databaseParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
    mongoose.connect(process.env.DB_URL)
        .then(() => console.log("The backend has connected to the MongoDB database."))
        .catch(err => console.error(`MongoDB connection failed: ${err.message}`));
}

