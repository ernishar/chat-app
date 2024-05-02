const sequelize = require('../db/connection');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).send('Please fill all required fields');
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Perform raw query to insert user data
        const [result, _] = await sequelize.query(`
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

        if (!email || !password) {
            res.status(400).send('Please fill all required fields');
            return;
        }

        // Perform raw query to fetch user by email
        const [users, metadata] = await sequelize.query(
            'SELECT * FROM Users WHERE email = :email', 
            { replacements: { email }, type: sequelize.QueryTypes.SELECT }
        );

        // Check if user exists
        if (!users || users.length === 0) {
            res.status(400).send('User email or password is incorrect');
            return;
        }

        const user = users[0];

        // Compare hashed password
        const validateUser = await bcryptjs.compare(password, user.password);
        if (!validateUser) {
            res.status(400).send('User email or password is incorrect');
            return;
        }

        // Generate JWT token
        const payload = {
            userId: user.id,
            email: user.email
        };
        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'THIS_IS_A_JWT_SECRET_KEY';
        jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 84600 }, async (err, token) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Update user with token (you may need to modify this part according to your user model)
            await sequelize.query(
                'UPDATE Users SET token = :token WHERE id = :userId',
                { replacements: { token, userId: user.id } }
            );

            res.status(200).json({ user: { id: user.id, email: user.email, fullName: user.fullName }, token });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {registerUser, loginUser}
