const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "SOEN287",
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL Database.");
    }
});

// Routes
app.get("/services", (req, res) => {
    const query = "SELECT * FROM services";
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send("Error fetching services.");
        } else {
            res.json(results);
        }
    });
});

app.post("/services", (req, res) => {
    const { name, description, price } = req.body;
    const query = "INSERT INTO services (name, description, price) VALUES (?, ?, ?)";
    db.query(query, [name, description, price], (err, result) => {
        if (err) {
            res.status(500).send("Error adding service.");
        } else {
            res.send("Service added successfully!");
        }
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
