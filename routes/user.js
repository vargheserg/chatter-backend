const User = require("../models/userModel")
const crypto = require("crypto");
const express = require('express');

const router = express.Router();

/*
    Return JWT for session?
    Update response message schema??
*/

router.post('/login', async function(req, res) {
  if (!req.body.username ||
    !req.body.password) {
    return res.status(400).json({
      message: "Invalid Request"
    });
  };

  const user = await User.findOne({
    username: req.body.username
  });

  if (!user) {
    return res.status(404).json({ 
      message: "User not found"
    });
  };

  const hashedPassword = crypto.scryptSync(req.body.password, user.salt, 64).toString("hex");

  if (hashedPassword !== user.password) {
    return res.status(401).json({ // Not sure about the response code
      message: "Invalid password"
    });
  };

  res.status(201).json({
    message: "Success"
  });
});

router.post('/signup', async function(req, res) { 
  if (!req.body.name ||
    !req.body.username ||
    !req.body.password) {
    return res.status(400).json({
      message: "Invalid request"
    });
  };

  const doesExists = await User.exists({
    username: req.body.username
  });

  if (doesExists) {
    return res.status(409).json({ // Not sure about the response code
      message: "Username exists"
    });
  };

  const salt = crypto.randomBytes(16).toString("hex");

  const hashedPassword = crypto.scryptSync(req.body.password, salt, 64).toString("hex");

  const newUser = new User({
    name: req.body.name,
    username: req.body.username,
    salt: salt,
    password: hashedPassword
  });
  await newUser.save();

  res.status(201).json({
    message: "Success"
  });
});

function createMissingParamMessage(res, missingValue) {
  return res.status(400).json({
    error: `Invalid Request - Missing ${missingValue}`
  });
};

module.exports = router;