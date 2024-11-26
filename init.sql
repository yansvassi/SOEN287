CREATE DATABASE IF NOT EXISTS soen287project;

USE soen287project;

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