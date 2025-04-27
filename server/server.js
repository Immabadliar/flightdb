const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const connection = mysql.createConnection({
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '49YQ4o6FcT48Ja4.root',
    password: '7MOuMnsfcWag9TSI',
    database: 'test',
    ssl: {
        rejectUnauthorized: true
    }
});

connection.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to TiDB!');
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    connection.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            res.json({ message: 'Login successful!' });
            window.Location.href = 'http://localhost:5500/page.html';
        } else {
            res.status(401).json({ message: 'Incorrect password' });
        }
    });
});

app.listen(5500, () => {
    console.log('Server running on http://localhost:5500');
});
