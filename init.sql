CREATE DATABASE IF NOT EXISTS SOEN287new;

USE SOEN287new;

CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    service_name VARCHAR(100),
    service_date DATE,
    status ENUM('Completed', 'Canceled', 'Pending') DEFAULT 'Pending',
    cost DECIMAL(10, 2)
);

CREATE TABLE IF NOT EXISTS AboutContent (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aboutTitle VARCHAR(255) NOT NULL,      
  aboutDescription TEXT NOT NULL,         
  teamTitle VARCHAR(255) NOT NULL,        
  teamMembers JSON NOT NULL               
);

CREATE TABLE Descriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,       -- Unique identifier for the row
    welcomeTitle VARCHAR(255) NOT NULL,      -- Title for the welcome section
    welcomeSlogan TEXT NOT NULL,             -- Slogan for the welcome section
    coreValuesTitle VARCHAR(255) NOT NULL,   -- Title for the core values section
    coreValuesText TEXT NOT NULL             -- Text for the core values section
);

 INSERT INTO Descriptions (welcomeTitle, welcomeSlogan, coreValuesTitle, coreValuesText) VALUES ('Default Title', 'Default Slogan', 'Default Core Values Title', 'Default Core Values Text');

CREATE TABLE `Register Informations` (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Fname VARCHAR(50) NOT NULL,
    Lname VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    choice ENUM('admin', 'client') NOT NULL
);

CREATE TABLE AdminProfile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    pn VARCHAR(15), -- Phone number
    address VARCHAR(255),
    city VARCHAR(100),
    pt VARCHAR(50), -- Province or territory
    pc VARCHAR(10)  -- Postal code
);


CREATE TABLE ClientProfile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fname VARCHAR(50) NOT NULL,
    lname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    pn VARCHAR(15), -- Phone number
    address VARCHAR(255),
    city VARCHAR(100),
    pt VARCHAR(50), -- Province or territory
    pc VARCHAR(10), -- Postal code
    card_number VARCHAR(16), -- Credit card number
    expiry_date DATE,        -- Credit card expiry date
    card_name VARCHAR(100)   -- Name on the credit card
);


CREATE TABLE Service (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(100) NOT NULL,
    Description TEXT NOT NULL,
    Price DECIMAL(10, 2) NOT NULL
);


INSERT INTO AboutContent (aboutTitle, aboutDescription, teamTitle, teamMembers)
VALUES (
  'About Us',
  'Welcome to our SOEN 287 Group Project website.',
  'Meet Our Team',
  '[
    {"name": "Yana", "role": "Developer", "email": "yana.vassilyev@gmail.com"},
    {"name": "Lucas", "role": "Developer", "email": "lucas.pentlandhyde@gmail.com"},
    {"name": "Jorane-Tiana", "role": "Developer", "email": "jorane1234@gmail.com"},
    {"name": "Daniel", "role": "Developer", "email": "daniel05.ayass@gmail.com"}
  ]'
);