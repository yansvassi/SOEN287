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
