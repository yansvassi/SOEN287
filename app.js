const express = require("express");
const mysql = require("mysql");
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
    password: "",
    database: "SOEN287project", // Replace with your database name
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

app.get("/addlogin", (req, res) => {
    res.send("This is the addlogin endpoint. Use POST to submit data.");
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


app.post("/addlogin", (req, res) => {
    const client = {
        Email: req.body.Email,
        Password: req.body.Password,
        choice: req.body["login-type"],
    };

    if (!client.Email || !client.Password || !client.choice) {
        return res.status(400).send("All fields are required.");
    }

    const checkEmail = "SELECT * FROM `Register Informations` WHERE Email = ?";
    db.query(checkEmail, [client.Email], (err, results) => {
        if (err) {
            console.error("Error checking email:", err.message);
            return res.status(500).send("An error occurred while checking the email.");
        }

        if (results.length === 0) {
            return res.status(401).send("Email not registered.");
        }

        const user = results[0];

        if (user.Password !== client.Password) {
            return res.status(401).send("Incorrect password.");
        }

        // Redirect based on user role
        if (client.choice === "admin" && user.choice === "admin") {
            return res.sendFile(path.join(__dirname, "BA-Logged-in/BAHome.html"));
        } else if (client.choice === "client" && user.choice === "client") {
            return res.sendFile(path.join(__dirname, "User-Logged-in/HomeLoggedin.html"));
        } else {
            return res.status(400).send("Invalid role specified.");
        }
    });
});

app.post("/BA-Logged-in/editprofile", (req, res) => {

    const info = {
        fname: fname.req.body,
        email: email.req.body,
        pn: pn.req.body,
        address: address.req.body,
        city: city.req.body,
        pt: pt.req.body,
        pc: pc.req.body

    }

    if (fname)
        {
            const sql = "UPDATE AdminProfile SET fname ? WHERE 1";
        }
    if (email)
        {
            const sql = "UPDATE AdminProfile SET email ? WHERE 1";
        }
    if (pn)
        {
            const sql = "UPDATE AdminProfile SET pn ? WHERE 1";
        }
    if (address)
        {
            const sql = "UPDATE AdminProfile SET address ? WHERE 1";
        }
    if (ciy)
        {
            const sql = "UPDATE AdminProfile SET city ? WHERE 1";
        }

    // Check if there are fields to update
    if (updates.length === 0) {
        return res.status(400).send("No fields to update.");
    }

    // Construct the SQL query
    const sql = "UPDATE AdminProfile SET ";

    // Execute the query
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating profile:", err.message);
            return res.status(500).send("An error occurred while updating the profile.");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("No profile found to update.");
        }

        res.status(200).send("Profile updated successfully.");
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
app.delete("/services/:id", (req, res) => {
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
  