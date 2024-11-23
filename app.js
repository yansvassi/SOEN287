const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 7011;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); // Serve static files like CSS and JS
app.use(express.static(path.join(__dirname))); // Serve static files at root level

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "SOEN287", // Replace with your database name
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
    } else {
        console.log("Connected to the database.");
    }
});

app.get("/view-only/addclient", (req, res) => {
    res.send("This is the addclient endpoint. Use POST to submit data.");
});

// Add a new client 
app.post("/view-only/addclient", (req, res) => {
    const client = {
        Fname: req.body.Fname,
        Lname: req.body.Lname,
        Email: req.body.Email, 
        Password: req.body.Password,
        choice: req.body['login-type'],

        
    };

    if (!client.Fname || !client.Lname || !client.Email || !client.Password || !client.choice) {
        return res.status(400).send("All fields are required.");
    }

    const checkEmail = "SELECT * FROM `Register Informations` WHERE Email = ?";
    db.query(checkEmail, client.Email, (err, results) => 
    {
        if (err)
            {
                console.error("Error checking email!");
                return res.status(500).send("An error occurred while checking the email");
            }
            if (results.length > 0) {
                // Email already exists
                return res.status(400).send("This email is already registered. Please return to the main site and try again.");
    }

    const sql = "INSERT INTO `Register Informations` SET ?";
    db.query(sql, client, (err, result) => {
        if (err) {
            console.error("Error inserting record:", err.message);
            res.status(500).send("Could not insert new record!");
        } else {
            if (client.choice == "admin")
                {
                    res.sendFile(path.join(__dirname, "BA-Logged-in/BAHome.html"));

                }

            if (client.choice = "client")
                {
                    res.sendFile(path.join(__dirname, "User-Logged-in/HomeLoggedin.html"));
                }
        }
    });

    });
    
})

// Fetch all services (Admin page)
app.get("/services", (req, res) => {
    const sql = "SELECT * FROM services";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching services:", err);
            return res.status(500).send("Error fetching services.");
        }
        res.json(results);
    });
});

// Add a new service
app.post("/services", (req, res) => {
    const { customer_name, service_name, service_date, status, cost } = req.body;

    if (!customer_name || !service_name || !service_date || !cost) {
        return res.status(400).send("All fields are required.");
    }

    const sql = "INSERT INTO services SET ?";
    const newService = { customer_name, service_name, service_date, status: status || "Pending", cost };

    db.query(sql, newService, (err) => {
        if (err) {
            console.error("Error adding service:", err);
            return res.status(500).send("Failed to add service.");
        }
        res.send("Service added successfully.");
    });
});

// Update a service
app.put("/services/:id", (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;

    const sql = "UPDATE services SET ? WHERE id = ?";
    db.query(sql, [updatedData, id], (err) => {
        if (err) {
            console.error("Error updating service:", err);
            return res.status(500).send("Failed to update service.");
        }
        res.send("Service updated successfully.");
    });
});

// Get the descriptions for Home and About
app.get("/api/descriptions", (req,res) => {
    const sql = "SELECT * FROM Descriptions";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error getting descriptions:", err);
            res.status(500).json({ error: "Error getting descriptions." });
        } 
        else {
            res.json(results);
        }
    });
});

// Update descriptions
app.put("/api/descriptions", (req, res) => {
    const { section, description } = req.body;
    const sql = "UPDATE Descriptions SET description = ? WHERE section = ?";
    db.query(sql, [description, section], (err) => {
        if (err){
            console.error("Error updating description:", err);
            res.status(500).json({ error: "Error updating description." });
        }
        else {
            res.json({ message: '${section} description updated successfully!' });
        }
    });
});

// Serve the admin page
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "BA-Logged-in/view-services.html"));
});

// Serve the client page
app.get("/client", (req, res) => {
    res.sendFile(path.join(__dirname, "User-Logged-in/client_services.html"));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
