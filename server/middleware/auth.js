const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const sequelize = require("../utils/sequelize");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization").split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user exists in the database
    const existingUser = await sequelize.query(
      `SELECT email FROM users WHERE email = '${decoded.email}'`,
      { type: QueryTypes.SELECT }
    );

    if (!existingUser.length) {
      return res.status(401).json({ error: "Unauthorized: Invalid Token" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Error verifying token" });
  }
};

module.exports = authMiddleware;