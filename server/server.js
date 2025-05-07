const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '..'))); // Serve static files from the root

const connection = mysql.createConnection({
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '49YQ4o6FcT48Ja4.root',
    password: 'X4LAjcGlc4Vdfzh3',
    database: 'test',
    ssl: {
        ca: fs.readFileSync(path.join(__dirname, 'isrgrootx1.pem')),
        rejectUnauthorized: true
    }
});

connection.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to TiDB!');
        initializeDatabase();
    }
});

function initializeDatabase() {
    connection.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            rank_id INT DEFAULT 0
        )
    `, (err) => {
        if (err) {
            console.error('Failed to create users table:', err);
        } else {
            console.log('Users table ready.');
        }
    });
}

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    connection.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, password],
        (err, results) => {
            if (err) {
                console.error('Registration error:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Username already exists' });
                }
                return res.status(500).json({ message: 'Database error' });
            }

            res.json({ message: 'User registered successfully' });
        }
    );
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = results[0];

        if (password === user.password) {
            res.json({
                message: 'Login successful',
                username: user.username,
                rank_id: user.rank_id,
                panel: getPanel(user.rank_id) // Add panel info
            });
        } else {
            res.status(401).json({ message: 'Incorrect password' });
        }
    });
});

// Utility function to determine the panel based on rank_id
function getPanel(rankId) {
    if (rankId >= 255) return 'creator';
    if (rankId >= 220) return 'dev';
    if (rankId >= 190) return 'admin';
    return 'user'; // Default to user access
}


app.listen(5500, () => {
    console.log('Server running on http://localhost:5500');
});
