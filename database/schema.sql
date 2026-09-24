CREATE DATABASE employee_management;

-- Connect to employee_management before running this:

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(15),
    department VARCHAR(100),
    salary NUMERIC(10, 2),
    joining_date DATE DEFAULT CURRENT_DATE
);