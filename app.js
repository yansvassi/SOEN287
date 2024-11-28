const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const session = require('express-session');
const PORT = 8080;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); // Serve static files like CSS and JS
app.use(express.static(path.join(__dirname))); // Serve static files at root level

// Session
app.use(session({
  secret: 'key',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false}
}));

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root", //Changed to personal code
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

    console.log("BOOTY!");

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
      console.log("Fetched user:", user); // Log the fetched user object
      req.session.userId = user.ID;
      console.log("User ID saved in session:", req.session.userId);
   

        // Validate password
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

// Logout 
app.get('/logout', (req,res) => {
  req.session.destroy((err) => {
    if(err){
      return res.status(500).json({success:false});
    }
    res.redirect('/view-only/Home.html');
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
  db.query(sql, values, (err, result) => {
      if (err) {
          console.error("Error updating or inserting profile:", err.message);
          return res.status(500).send("Failed to update profile.");
      }

      console.log("Query result:", result);
      res.send("Profile updated successfully.");
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




app.get('/editClientProfile', (req, res) => {
  const query = 'SELECT ID, fname, lname, email, pn, address, city, pt, pc, card_number, expiry_date, card_name FROM ClientProfile WHERE id = ?';
  const userId = req.session.userId;

  if (!userId) {
      return res.status(400).send("User ID not found in session. Please log in again.");
  }

  db.query(query, [userId], (err, results) => {
      if (err) {
          console.error('Error fetching client profile:', err.message);
          return res.status(500).json({ error: 'Failed to fetch client profile' });
      }
      res.json(results[0]); 
  });
});

app.post("/editClientProfile", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
      return res.status(400).send("User ID not found in session. Please log in again.");
  }

  const info = {
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      pn: req.body.pn,
      address: req.body.address,
      city: req.body.city,
      pt: req.body.pt,
      pc: req.body.pc,
      card_number: req.body.card_number,
      expiry_date: req.body.expiry_date,
      card_name: req.body.card_name,
  };

  // Filter out undefined or null values
  const fields = Object.keys(info).filter((key) => info[key] !== undefined && info[key] !== null);
  const values = fields.map((key) => info[key]);

  if (fields.length === 0) {
      return res.status(400).send("No data provided to update.");
  }

  // Dynamically construct the SQL query for UPDATE
  const updateFields = fields.map((key) => `${key} = ?`).join(", ");
  const updateSql = `
      UPDATE ClientProfile
      SET ${updateFields}
      WHERE id = ?
  `;

  // Add userId to the values array for the WHERE clause
  values.push(userId);

  // Execute the UPDATE query
  db.query(updateSql, values, (err) => {
      if (err) {
          console.error("Error updating client profile:", err.message);
          return res.status(500).send("Failed to update client profile.");
      }
      res.send("Profile updated successfully.");
  });
});

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
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

  app.get("/db-info", (req, res) => {
    const sql = "SELECT @@hostname AS hostname, @@port AS port;";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching database info:", err);
            return res.status(500).send("Database error.");
        }
        res.json(results[0]);
    });
});


app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/view-only/Home.html"));
});
