const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files like CSS and JS

// Database Connection
const db = mysql.createConnection({
    host: "localhost", // XAMPP MySQL default host
    user: "root", // Default username
    password: "", // Default password for XAMPP
    database: "soen287project", // Your database name
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
    } else {
        console.log("Connected to the database.");
    }
});

// Routes

// 1. Fetch All Services (for both admin and client pages)
app.get("/services", (req, res) => {
    const sql = "SELECT * FROM services";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send("Error fetching services.");
        res.json(results); // Return services as JSON
    });
});

// 2. Add a New Service (Admin only)
app.post("/services", (req, res) => {
    const { customer_name, service_name, service_date, status, cost } = req.body;
    const sql = "INSERT INTO services SET ?";
    const newService = { customer_name, service_name, service_date, status, cost };
    db.query(sql, newService, (err) => {
        if (err) return res.status(500).send("Error adding service.");
        res.send("Service added successfully.");
    });
});

// 3. Update Service Status (e.g., cancel service)
app.put("/services/:id", (req, res) => {
    const { status } = req.body;
    const sql = "UPDATE services SET status = ? WHERE id = ?";
    db.query(sql, [status, req.params.id], (err) => {
        if (err) return res.status(500).send("Error updating service.");
        res.send("Service status updated successfully.");
    });
});

// 4. Delete a Service (Admin only)
app.delete("/services/:id", (req, res) => {
    const sql = "DELETE FROM services WHERE id = ?";
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).send("Error deleting service.");
        res.send("Service deleted successfully.");
    });
});

// 5. Serve HTML Files for Admin and Client Pages
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "BA-Logged-in","view-services.html"));
});

app.get("/client", (req, res) => {
    res.sendFile(path.join(__dirname, "User-Logged-in","client_services.html"));
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
