const sequelize = require('../db/connection')
const bcryptjs = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 


const registerUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).send('Please fill all required fields');
        }

        // Check if the email already exists
        const [existingUser] = await sequelize.query(
            'SELECT * FROM Users WHERE email = :email', 
            { replacements: { email }, type: sequelize.QueryTypes.SELECT }
        );

        if (existingUser && existingUser.length > 0) {
            return res.status(400).send('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Perform raw query to insert user data
        const [result] = await sequelize.query(`
            INSERT INTO Users (fullName, email, password) 
            VALUES (?, ?, ?)
        `, {
            replacements: [fullName, email, hashedPassword]
        });

        if (result && result.affectedRows > 0) {
            return res.status(200).send('User registered successfully');
        } else {
            return res.status(500).send('Failed to register user');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Perform raw query to fetch user by email
        const [users, metadata] = await sequelize.query(
            'SELECT * FROM Users WHERE email = :email', 
            { replacements: { email }, type: sequelize.QueryTypes.SELECT }
        );

        // Check if user exists
        if (!users || users.length === 0) {
            return res.status(400).send('User email or password is incorrect');
        }

        const user = users[0];

        // Compare hashed password
        const validateUser = await bcryptjs.compare(password, user.password);
        if (!validateUser) {
            return res.status(400).send('User email or password is incorrect');
        }

        // Generate JWT token
        const payload = {
            userId: user.id,
            email: user.email
        };
        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'THIS_IS_A_JWT_SECRET_KEY';
        const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 84600 });

        // Update user with token
        await sequelize.query(
            'UPDATE Users SET token = :token WHERE id = :userId',
            { replacements: { token, userId: user.id } }
        );

        // Respond with user details and token
        res.status(200).json({ user: { id: user.id, email: user.email, fullName: user.fullName }, token });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = { registerUser, loginUser };
