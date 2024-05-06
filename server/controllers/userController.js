const { QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const emailvalidator = require("email-validator");
const sequelize = require("../db/connection");

exports.registerUser = async (req, res) => {
  const { fullName,  email, password} = req.body;

  let profilePic = null;
  if (req.file) {
    profilePic = req.file.filename;
  }

//   if (
//     !fullName ||
//     !email ||
//     !password ||
//     !profilePic
//   ) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

  try {
    if (!emailvalidator.validate(email)) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be atleast 6 characters" });
    }

    // Checking if the user already exists
    const getAuther = await sequelize.query(
      `SELECT * FROM users WHERE email = '${email}'`,
      { type: QueryTypes.SELECT }
    );

    if (getAuther.length) {
      return res.status(400).json({ message: "email already exists" });
    }

    // Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    await sequelize.query(
      `INSERT INTO users (fullName, email, password) VALUES ('${fullName}',  '${email}', '${hashedPassword}')`,
      { type: QueryTypes.INSERT }
    );

    return res.status(200).json({ message: "success" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    // Checking if the user exists
    const getUser = await sequelize.query(
      `SELECT * FROM users WHERE email = :email`,
      {
        replacements: { email },
        type: QueryTypes.SELECT,
      }
    );

    // Checking if the user exists
    if (!getUser.length) {
      return res.status(400).json({ message: "wrong email" });
    }

    // Getting the hashed password from the database
    const hashedPassword = getUser[0].password;

    // Comparing the password
    const validPassword = await bcrypt.compare(password, hashedPassword);

    if (!validPassword) {
      return res.status(400).json({ message: "wrong password" });
    } else {
      return jwt.sign(
        {
          userId: getUser[0].userId,
          email: getUser[0].email,
          fullName: getUser[0].fullName,
          profilePic: getUser[0].profilePic
        },
        process.env.JWT_SECRET || "NisharAlam",
        { expiresIn: "1h" },
        (err, token) => {
          if (err) {
            return res.status(500).json({ message: err.message });
          }
          return res.status(200).json({ message: "success", token });
        }
      );
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { userId,} = req.user;

  try {
    const [user] = await sequelize.query(
      `SELECT * FROM users WHERE userId = :userId`,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    //Delete the product
    await sequelize.query(`DELETE FROM users WHERE userId = :userId`, {
      replacements: { userId },
      type: sequelize.QueryTypes.DELETE,
    });

    return res.status(200).json({ message: "success" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};