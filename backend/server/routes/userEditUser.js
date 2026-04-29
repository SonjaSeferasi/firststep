const express = require("express");
const router = express.Router();
const z = require('zod')
const bcrypt = require("bcrypt");
const newUserModel = require('../models/userModel')
const { newUserValidation } = require('../models/userValidator');
const { generateAccessToken } = require('../utilities/generateToken');

router.post('/editUser', async (req, res) =>
{
    // validate new user information
    const { error } = newUserValidation(req.body);
    if (error) return res.status(400).send({ message: error.errors[0].message });

    // store new user information
    const {userId, username, email, password} = req.body

    // check if username is available
    const user = await newUserModel.findOne({ username: username })
    if (user) userIdReg = JSON.stringify(user._id).replace(/["]+/g, '')
    if (user && userIdReg !== userId) return res.status(409).send({ message: "Username is taken, pick another" })

    // generates the hash
    const generateHash = await bcrypt.genSalt(Number(10))

    // parse the generated hash into the password
    const hashPassword = await bcrypt.hash(password, generateHash)

    // find and update user using stored information
    newUserModel.findByIdAndUpdate(userId, {
        username : username, 
        email : email, 
        password : hashPassword
    } ,function (err, user) {
    if (err){
        console.log(err);
    } else {
        // create and send new access token to local storage
        const accessToken = generateAccessToken(user._id, email, username, hashPassword)  
        res.header('Authorization', accessToken).send({ accessToken: accessToken })
    }
    });

})

// GET /user/profile/:id
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await newUserModel.findById(req.params.id).select('username email profilePic firstName lastName');
    if (!user) return res.status(404).send({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// POST /user/updateProfilePic
router.post('/updateProfilePic', async (req, res) => {
  const { userId, profilePic } = req.body;
  if (!userId) return res.status(400).send({ message: "userId is required" });
  try {
    await newUserModel.findByIdAndUpdate(userId, { profilePic });
    res.status(200).send({ message: "Profile picture updated" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// POST /user/updateProfile
router.post('/updateProfile', async (req, res) => {
  const { userId, firstName, lastName } = req.body;
  if (!userId) return res.status(400).send({ message: "userId is required" });
  try {
    await newUserModel.findByIdAndUpdate(userId, { firstName, lastName });
    res.status(200).send({ message: "Profile updated" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// POST /user/changePassword
router.post('/changePassword', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  if (!userId || !currentPassword || !newPassword)
    return res.status(400).send({ message: "All fields are required." });
  if (newPassword.length < 8)
    return res.status(400).send({ message: "New password must be at least 8 characters." });
  try {
    const user = await newUserModel.findById(userId);
    if (!user) return res.status(404).send({ message: "User not found." });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).send({ message: "Current password is incorrect." });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    await newUserModel.findByIdAndUpdate(userId, { password: hashed });
    res.status(200).send({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;