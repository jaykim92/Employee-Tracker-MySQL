DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;
USE employees_db;

-- create schema
CREATE TABLE Department
(
    id INT AUTO_INCREMENT NOT NULL,
    dept_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE Emp_Role
(
    id INT AUTO_INCREMENT NOT NULL,
    role_title VARCHAR(30) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    dept_id INT NOT NULL,
    PRIMARY KEY (id)
);

Create TABLE Employee
(
    id INT AUTO_INCREMENT NOT NULL,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT,
    PRIMARY KEY (id)
);

-- seeds
INSERT INTO Department (dept_name)
VALUES ("Admin");

INSERT INTO Emp_Role (role_title, salary, dept_id)
VALUES ("Supervisor", 50000.50, 1);

INSERT INTO Employee (first_name, last_name, role_id, manager_id)
VALUES ("Jay", "Kim", 1, 1);