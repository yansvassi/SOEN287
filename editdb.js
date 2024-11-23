const mysql = require("mysql");

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "SOEN287", // Replace with your database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database.");

  // Call the desired function here (addColumn or deleteTable)
  addColumn("Register Informations", "choice", "VARCHAR(255)", () => {
    console.log("Column added successfully!");

    // Uncomment the deleteTable function to delete a table after adding a column
    // deleteTable("OldTable", () => console.log("Table deleted successfully!"));
    db.end(); // Close the database connection
  });
});