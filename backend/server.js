const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// ================================
// HOME
// ================================

app.get("/", (req, res) => {
    res.send("Employee Management Backend is running!");
});


// ================================
// GET ALL EMPLOYEES
// ================================

app.get("/api/employees", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT * FROM employees ORDER BY id"
        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch employees"
        });
    }
});


// ================================
// GET EMPLOYEE BY ID
// ================================

app.get("/api/employees/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM employees WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch employee"
        });
    }
});


// ================================
// ADD EMPLOYEE
// ================================

app.post("/api/employees", async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            department,
            salary,
            joiningDate
        } = req.body;

        // Backend validation

        if (!name || name.trim().length < 3) {

            return res.status(400).json({
                message: "Name must contain at least 3 characters"
            });
        }


        if (!email || !email.includes("@")) {

            return res.status(400).json({
                message: "Valid email is required"
            });
        }


        if (phone && !/^\d{10}$/.test(phone)) {

            return res.status(400).json({
                message: "Phone must contain 10 digits"
            });
        }


        if (!department) {

            return res.status(400).json({
                message: "Department is required"
            });
        }


        if (salary === undefined ||
            salary === null ||
            Number(salary) < 0) {

            return res.status(400).json({
                message: "Valid salary is required"
            });
        }


        if (!joiningDate) {

            return res.status(400).json({
                message: "Joining date is required"
            });
        }
        const result = await pool.query(
            `INSERT INTO employees
            (name, email, phone, department, salary, joining_date)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                name,
                email,
                phone,
                department,
                salary,
                joiningDate
            ]
        );


        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error(error);


        // Duplicate email
        if (error.code === "23505") {

            return res.status(409).json({
                message: "Email already exists"
            });
        }


        res.status(500).json({
            message: "Failed to add employee"
        });
    }

});
// ================================
// UPDATE EMPLOYEE
// ================================

app.put("/api/employees/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const {
            name,
            email,
            phone,
            department,
            salary,
            joiningDate
        } = req.body;


        const result = await pool.query(
            `UPDATE employees
             SET name = $1,
                 email = $2,
                 phone = $3,
                 department = $4,
                 salary = $5,
                 joining_date = $6
             WHERE id = $7
             RETURNING *`,
            [
                name,
                email,
                phone,
                department,
                salary,
                joiningDate,
                id
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Employee not found"
            });
        }


        res.json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to update employee"
        });
    }
});


// ================================
// DELETE EMPLOYEE
// ================================

async function deleteEmployee(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this employee?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete employee"
            );
        }


        alert(
            "Employee deleted successfully!"
        );


        loadEmployees();

    }

    catch (error) {

        console.error(error);

        alert(error.message);
    }
}


// ================================
// START SERVER
// ================================

pool.connect()
    .then(client => {

        console.log("PostgreSQL connected successfully");

        client.release();

    })
    .catch(error => {

        console.error(
            "PostgreSQL connection failed:"
        );

        console.error(error.message);
    });


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});