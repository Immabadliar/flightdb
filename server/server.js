const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MySQL URI connection string
const dbUri = 'mysql://49YQ4o6FcT48Ja4.root:7MOuMnsfcWag9TSI@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/test';

// Create connection using the URI
const connection = mysql.createConnection(dbUri);

connection.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to TiDB!');
    }
});

// Route for user registration (hashing password with bcrypt)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    connection.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error during login', error: err.message });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = results[0];

        // Compare the entered password with the stored hashed password
        try {
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                res.json({ message: 'Login successful!' });
            } else {
                res.status(401).json({ message: 'Incorrect password' });
            }
        } catch (compareError) {
            console.error('Error comparing passwords:', compareError);
            res.status(500).json({ message: 'Error during password comparison', error: compareError.message });
        }
    });
});


// Start the server
app.listen(5500, () => {
    console.log('Server running on http://localhost:5500');
});
