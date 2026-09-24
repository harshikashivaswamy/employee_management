const API_URL = "http://localhost:5000/api/employees";
const notification =
    document.getElementById("notification");


function showNotification(message, type) {

    notification.textContent = message;

    notification.className =
        "notification " + type + " show";


    setTimeout(function () {

        notification.classList.remove("show");

    }, 3000);
}

// =====================================
// ELEMENTS
// =====================================

const employeeForm =
    document.getElementById("employeeForm");

const employeeTableBody =
    document.getElementById("employeeTableBody");

const searchInput =
    document.getElementById("search");
const financeEmployees =
    document.getElementById("financeEmployees");
const totalSalary =
    document.getElementById("totalSalary");

const averageSalary =
    document.getElementById("averageSalary");
const departmentFilter =
    document.getElementById("departmentFilter");

const submitButton =
    document.getElementById("submitButton");

const cancelButton =
    document.getElementById("cancelButton");


// Employee currently being edited
let editingEmployeeId = null;


// =====================================
// LOAD EMPLOYEES
// =====================================

async function loadEmployees() {

    try {
        employeeTableBody.innerHTML = `
    <tr>
        <td colspan="8">
            Loading employees...
        </td>
    </tr>
`;
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load employees");
        }

        const employees = await response.json();

        displayEmployees(employees);

    } catch (error) {

        console.error(error);

        employeeTableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    Failed to load employees
                </td>
            </tr>
        `;
    }
}


// =====================================
// DISPLAY EMPLOYEES
// =====================================

function displayEmployees(employeeList) {

    employeeTableBody.innerHTML = "";


    if (employeeList.length === 0) {

        employeeTableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    No employees found
                </td>
            </tr>
        `;

        return;
    }


    employeeList.forEach(function (employee) {

        const row = document.createElement("tr");


        row.innerHTML = `

            <td>${employee.id}</td>

            <td>${employee.name}</td>

            <td>${employee.email}</td>

            <td>${employee.phone || ""}</td>

            <td>${employee.department || ""}</td>

            <td>₹${employee.salary || 0}</td>

            <td>${employee.joining_date || ""}</td>

            <td>

                <button
                    onclick="editEmployee(${employee.id})">
                    Edit
                </button>

                <button
                    onclick="deleteEmployee(${employee.id})">
                    Delete
                </button>

            </td>
        `;


        employeeTableBody.appendChild(row);

    });
}


// =====================================
// ADD / UPDATE EMPLOYEE
// =====================================

employeeForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const employee = {

            name:
                document.getElementById("name").value,

            email:
                document.getElementById("email").value,

            phone:
                document.getElementById("phone").value,

            department:
                document.getElementById("department").value,

            salary:
                document.getElementById("salary").value,

            joiningDate:
                document.getElementById("joiningDate").value
        };


        try {

            let response;


            // =================================
            // UPDATE
            // =================================

            if (editingEmployeeId !== null) {

                response = await fetch(
                    `${API_URL}/${editingEmployeeId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(employee)
                    }
                );

            }


            // =================================
            // ADD
            // =================================

            else {

                response = await fetch(
                    API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(employee)
                    }
                );

            }


            if (!response.ok) {

                throw new Error(
                    "Failed to save employee"
                );

            }


            if (editingEmployeeId !== null) {

                alert(
                    "Employee updated successfully!"
                );

            } else {

                alert(
                    "Employee added successfully!"
                );

            }


            // Reset
            employeeForm.reset();

            editingEmployeeId = null;

            submitButton.textContent =
                "Add Employee";

            cancelButton.style.display =
                "none";


            // Reload database data
            loadEmployees();


        } catch (error) {

            console.error(error);

            alert(
                "Failed to save employee"
            );
        }

    }
);


// =====================================
// EDIT EMPLOYEE
// =====================================

async function editEmployee(id) {

    try {

        const response = await fetch(
            `${API_URL}/${id}`
        );


        if (!response.ok) {

            throw new Error(
                "Employee not found"
            );

        }


        const employee =
            await response.json();


        // Put data into form

        document.getElementById("name").value =
            employee.name;

        document.getElementById("email").value =
            employee.email;

        document.getElementById("phone").value =
            employee.phone || "";

        document.getElementById("department").value =
            employee.department || "";

        document.getElementById("salary").value =
            employee.salary || "";

        document.getElementById("joiningDate").value =
            employee.joining_date || "";


        // Store ID
        editingEmployeeId = id;


        // Change button
        submitButton.textContent =
            "Update Employee";


        // Show cancel
        cancelButton.style.display =
            "inline-block";


        // Scroll to form
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(error);

        alert(
            "Failed to load employee"
        );
    }
}


// =====================================
// CANCEL EDIT
// =====================================

cancelButton.addEventListener(
    "click",
    function () {

        employeeForm.reset();

        editingEmployeeId = null;

        submitButton.textContent =
            "Add Employee";

        cancelButton.style.display =
            "none";
    }
);


// =====================================
// DELETE EMPLOYEE
// =====================================

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


        if (!response.ok) {

            throw new Error(
                "Failed to delete employee"
            );

        }


        alert(
            "Employee deleted successfully!"
        );


        loadEmployees();


    } catch (error) {

        console.error(error);

        alert(
            "Failed to delete employee"
        );
    }
}


// =====================================
// SEARCH
// =====================================

searchInput.addEventListener(
    "input",
    async function () {

        try {

            const searchText =
                searchInput.value.toLowerCase();


            const response =
                await fetch(API_URL);


            const employees =
                await response.json();


            const filteredEmployees =
                employees.filter(
                    function (employee) {

                        return (

                            employee.name
                                .toLowerCase()
                                .includes(searchText)

                            ||

                            employee.email
                                .toLowerCase()
                                .includes(searchText)

                            ||

                            (
                                employee.department || ""
                            )
                                .toLowerCase()
                                .includes(searchText)
                        );

                    }
                );


            displayEmployees(
                filteredEmployees
            );


        } catch (error) {

            console.error(error);
        }

    }
);


// =====================================
// LOAD WHEN PAGE OPENS
// =====================================

loadEmployees();