const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.set("view engine", "ejs"); // Use EJS for templating

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "soen287project",
});

db.connect((err) => {
    if (err) console.error("Error connecting to DB:", err);
    else console.log("Connected to DB");
});

// Routes

// 1. Render Client Services Page
app.get("/client-services", (req, res) => {
    const sql = "SELECT * FROM services";
    db.query(sql, (err, results) => {
        if (err) res.status(500).send("Error fetching services.");
        else res.render("client_services", { services: results });
    });
});

// 2. Render Admin Services Page
app.get("/view-services", (req, res) => {
    const sql = "SELECT * FROM services";
    db.query(sql, (err, results) => {
        if (err) res.status(500).send("Error fetching services.");
        else res.render("view_services", { services: results });
    });
});

// 3. Add a New Service (Admin)
app.post("/services", (req, res) => {
    const { customer_name, service_name, service_date, status, cost } = req.body;
    const sql = "INSERT INTO services SET ?";
    db.query(sql, { customer_name, service_name, service_date, status, cost }, (err) => {
        if (err) res.status(500).send("Error adding service.");
        else res.redirect("/view-services");
    });
});

// 4. Update Service Status (Client/Admin)
app.post("/services/update/:id", (req, res) => {
    const { status } = req.body;
    const sql = "UPDATE services SET status = ? WHERE id = ?";
    db.query(sql, [status, req.params.id], (err) => {
        if (err) res.status(500).send("Error updating service status.");
        else res.redirect(req.get("Referer")); // Redirect to the previous page
    });
});

// 5. Delete a Service (Admin)
app.post("/services/delete/:id", (req, res) => {
    const sql = "DELETE FROM services WHERE id = ?";
    db.query(sql, [req.params.id], (err) => {
        if (err) res.status(500).send("Error deleting service.");
        else res.redirect("/view-services");
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
