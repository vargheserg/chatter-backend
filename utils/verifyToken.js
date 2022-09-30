const jwt = require('jsonwebtoken');

function verifyToken(token) {
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken.userID;
  } catch (err) { // Disregard error
    return false;
  }
}

module.exports = verifyToken;