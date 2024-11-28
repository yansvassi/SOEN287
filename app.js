const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 7013;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); // Serve static files like CSS and JS
app.use(express.static(path.join(__dirname))); // Serve static files at root level

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "new_password",
    database: "SOEN287new", // Replace with your database name
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
    db.query(checkEmail, client.Email, (err, results) => {
        if (err) {
            console.error("Error checking email!");
            return res.status(500).send("An error occurred while checking the email");
        }

        if (results.length > 0) {
            // Email already exists
            return res.status(400).json({ success: false, message: "This email is already registered. Please return to the main site and try again." });
        }

        const sql = "INSERT INTO `Register Informations` SET ?";
        db.query(sql, client, (err, result) => {
            if (err) {
                console.error("Error inserting record:", err.message);
                return res.status(500).json({ success: false, message: "Could not insert new record!" });
            }

            // Send JSON response instead of sending files
            if (client.choice === "admin") {
                return res.json({ success: true, redirectUrl: "/BA-Logged-in/BAHome.html" });
            } else if (client.choice === "client") {
                return res.json({ success: true, redirectUrl: "/User-Logged-in/HomeLoggedin.html" });
            } else {
                return res.status(400).json({ success: false, message: "Invalid role specified." });
            }
        });
    });
});


app.get("/addlogin", (req, res) => {
    res.send("This is the addlogin endpoint. Use POST to submit data.");
});

app.post("/addlogin", (req, res) => {
    const client = {
        Email: req.body.Email,
        Password: req.body.Password,
        choice: req.body["login-type"],
    };

    if (!client.Email || !client.Password || !client.choice) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const checkEmail = "SELECT * FROM `Register Informations` WHERE Email = ?";
    db.query(checkEmail, [client.Email], (err, results) => {
        if (err) {
            console.error("Error checking email:", err.message);
            return res.status(500).json({ success: false, message: "An error occurred while checking the email." });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "Email not registered." });
        }

        const user = results[0];

        if (user.Password !== client.Password) {
            return res.status(401).json({ success: false, message: "Incorrect password." });
        }

        const fullName = `${user.Fname} ${user.Lname}`;

        // Redirect based on user role
        if (client.choice === "admin" && user.choice === "admin") {
            return res.json({ success: true, redirectUrl: "/BA-Logged-in/BAHome.html", user: { fullName } });
        } else if (client.choice === "client" && user.choice === "client") {
            return res.json({ success: true, redirectUrl: "/User-Logged-in/HomeLoggedin.html", user: { fullName } });
        } else {
            return res.status(400).json({ success: false, message: "Invalid role specified." });
        }
    });
});

app.post("/BA-Logged-in/editprofile", (req, res) => {
    // Extract the provided information, using "N/A" as a fallback
    const info = {
        fname: req.body.fname,
        email: req.body.email,
        pn: req.body.pn,
        address: req.body.address,
        city: req.body.city,
        pt: req.body.pt,
        pc: req.body.pc,
    };

    // Ensure all fields are provided
    const missingFields = Object.keys(info).filter((key) => info[key] == null || info[key].trim() === "");
    if (missingFields.length > 0) {
        return res.status(400).send(`Missing fields: ${missingFields.join(", ")}`);
    }

    // Build the SQL query for insert or update
    const fields = Object.keys(info);
    const values = Object.values(info);
    const updateFields = fields.map((key) => `${key} = VALUES(${key})`).join(", ");

    const sql = `
      INSERT INTO AdminProfile (${fields.join(", ")})
      VALUES (${fields.map(() => "?").join(", ")})
      ON DUPLICATE KEY UPDATE ${updateFields}
  `;

    console.log("SQL Query:", sql);
    console.log("Values:", values);

    // Execute the query
    db.query(sql, [...values, ...values], (err, result) => {
        if (err) {
            console.error("Error updating or inserting profile:", err.message);
            return res.status(500).send("Failed to update profile.");
        }

        console.log("Query result:", result);
        res.send("Profile updated successfully.");
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


//yana
const cors = require("cors");

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Route: Add a new service
app.post("/servicess", (req, res) => {
  const {Title, Description, Price } = req.body;

  if (!Title || !Description || Price == null) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  const query = "INSERT INTO Service (Title, Description, Price) VALUES (?, ?, ?)";
  db.query(query, [Title, Description, Price], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ success: false, message: "Database error." });
    }
    res.json({ success: true, id: result.insertId });
  });
});

// Route: Get all services
app.get("/servicess", (req, res) => {
  const query = "SELECT * FROM Service";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({ success: false, message: "Database error." });
    }
    res.json(results);
  });
});

// Route: Update a service
app.put("/servicess/:id", (req, res) => {
  const { id } = req.params;
  const { Title, Description, Price } = req.body;

  if (!Title || !Description || Price == null) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  const query = "UPDATE Service SET Title = ?, Description = ?, Price = ? WHERE id = ?";
  db.query(query, [Title, Description, Price, id], (err, result) => {
    if (err) {
      console.error("Error updating data:", err);
      return res.status(500).json({ success: false, message: "Database error." });
    }
    res.json({ success: true });
  });
});

// Route: Delete a service
app.delete("/servicess/:id", (req, res) => {
  const { id } = req.params;

  console.log(`Received delete request for ID: ${id}`); // Debug log

  const query = "DELETE FROM Service WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting data:", err);
      return res.status(500).json({ success: false, message: "Database error." });
    }

    if (result.affectedRows > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Service not found." });
    }
  });
});

// Route to fetch descriptions
// Route to fetch descriptions
app.get("/api/get-descriptions", (req, res) => {
    const query = "SELECT * FROM Descriptions LIMIT 1";
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching descriptions:", err);
        return res.status(500).json({ success: false, message: "Database error." });
      }
  
      if (results.length > 0) {
        res.json({ success: true, data: results[0] });
      } else {
        res.status(404).json({ success: false, message: "No descriptions found." });
      }
    });
  });
  
  // Route to update descriptions
  app.post("/api/update-descriptions", (req, res) => {
    const { welcomeTitle, welcomeSlogan, coreValuesTitle, coreValuesText } = req.body;
  
    if (!welcomeTitle || !welcomeSlogan || !coreValuesTitle || !coreValuesText) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
  
    const query = `
      UPDATE Descriptions
      SET welcomeTitle = ?, welcomeSlogan = ?, coreValuesTitle = ?, coreValuesText = ?`;
  
    db.query(query, [welcomeTitle, welcomeSlogan, coreValuesTitle, coreValuesText], (err) => {
      if (err) {
        console.error("Error updating descriptions:", err);
        return res.status(500).json({ success: false, message: "Database error." });
      }
  
      res.json({ success: true, message: "Descriptions updated successfully!" });
    });
  });


app.post("/purchase", (req, res) => {
    const { customer_name, service_name, service_date, cost, status } = req.body;
    if (!customer_name || !service_name || !service_date || !cost) {
        return res.status(400).send("All fields are required.");
    }
    // Insert into Services Availed table
    const availedQuery = "INSERT INTO `Services Availed` (customer_name, service_name, service_date, cost, status) VALUES (?, ?, ?, ?, ?)";
    db.query(availedQuery, [customer_name, service_name, service_date, cost, status || "Pending"], (err) => {
        if (err) {
            console.error("Error adding to Services Availed:", err);
            return res.status(500).send("Failed to add to Services Availed.");
        }
        res.status(200).send("Purchase recorded successfully.");
    });
});
app.get("/services-availed", (req, res) => {
    const query = "SELECT * FROM `Services Availed`";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching data from Services Availed:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        res.json(results);
    });
});
app.get("/services-availed/:id", (req, res) => {
    const id = req.params.id;
    const query = `
        SELECT id, customer_name, service_name, service_date, status, cost
        FROM \`Services Availed\`
        WHERE id = ?
    `;
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error fetching service details:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Service not found." });
        }
        res.json(results[0]);
    });
});

app.get("/client-services/:customer_name", (req, res) => {
    const customerName = req.params.customer_name;
    const query = `
        SELECT id, service_name, DATE_FORMAT(service_date, '%Y-%m-%d') AS service_date, status, cost
        FROM \`Services Availed\`
        WHERE customer_name = ?
    `;
    db.query(query, [customerName], (err, results) => {
        if (err) {
            console.error("Error fetching client services:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        console.log("Fetched services:", results); // Debugging: Log the results
        res.json(results);
    });
});

app.put("/services-availed/:id", (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;

    const query = `
        UPDATE \`Services Availed\`
        SET ?
        WHERE id = ?
    `;
    db.query(query, [updatedData, id], (err) => {
        if (err) {
            console.error("Error updating Services Availed:", err);
            return res.status(500).send("Failed to update entry in Services Availed.");
        }
        res.send("Entry updated successfully.");
    });
});

app.get("/api/get-about-content", (req, res) => {
    console.log("Received request for /api/get-about-content");
    const query = "SELECT aboutTitle, aboutDescription, teamTitle, teamMembers FROM AboutContent LIMIT 1";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching About Us content:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        if (results.length > 0) {
            const content = results[0];
            res.json({
                success: true,
                aboutTitle: content.aboutTitle,
                aboutDescription: content.aboutDescription,
                teamTitle: content.teamTitle,
                teamMembers: JSON.parse(content.teamMembers),
            });
        } else {
            res.status(404).json({ success: false, message: "About Us content not found." });
        }
    });
});


app.post("/api/update-about-content", (req, res) => {
    const { aboutTitle, aboutDescription, teamTitle, teamMembers } = req.body;

    if (!aboutTitle || !aboutDescription || !teamTitle || !teamMembers) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const query = `
        UPDATE AboutContent
        SET aboutTitle = ?, aboutDescription = ?, teamTitle = ?, teamMembers = ?
    `;

    db.query(query, [aboutTitle, aboutDescription, teamTitle, JSON.stringify(teamMembers)], (err) => {
        if (err) {
            console.error("Error updating About Us content:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }

        res.json({ success: true, message: "About Us content updated successfully!" });
    });
});

app.get("/admin-profile", (req, res) => {
    const sql = "SELECT fname, email, pn, address, city, pt, pc FROM AdminProfile WHERE id = 1";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching admin profile:", err.message);
            return res.status(500).json({ success: false, message: "Database error." });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "No admin profile found." });
        }

        // Send the admin profile as JSON
        res.json({
            success: true,
            fname: results[0].fname,
            email: results[0].email,
            pn: results[0].pn,
            address: results[0].address,
            city: results[0].city,
            pt: results[0].pt,
            pc: results[0].pc
        });
    });
});