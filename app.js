var mysql = require("mysql");
var inquirer = require("inquirer");
var consoletable = require("console.table");
require("dotenv").config();

// set up connection
var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DB,
});

// start connection and begin the inquirer prompt
connection.connect(function (err) {
  if (err) throw err;
  beginPrompt();
});

// function for main inquirer menu
beginPrompt = () => {
  inquirer
    .prompt({
      type: "list",
      name: "options",
      message: "Select option?",
      choices: [
        "Add department",
        "Add role",
        "Add employee",
        "View all departments",
        "View all roles",
        "view all employees",
        "Update employee roles",
        "Exit",
      ],
    })
    .then((response) => {
      switch (response.options) {
        case "Add department":
          addDept();
          break;
        case "Add role":
          addRole();
          break;
        case "Add employee":
          addEmp();
          break;
        case "View all departments":
          viewDept();
          break;
        case "View all roles":
          viewRole();
          break;
        case "view all employees":
          viewEmp();
          break;
        case "Update employee roles":
          updateEmpRoles();
          break;
        case "Exit":
          connection.end();
          break;
      }
    });
};

// function for adding a new row in the department table
addDept = () => {
  inquirer
    .prompt({
      type: "input",
      name: "dept",
      message: "Enter the name of the department",
    })
    .then((response) => {
      const query = connection.query(
        "INSERT INTO Department SET ?",
        { dept_name: response.dept },
        (err, rows) => {
          if (err) throw err;
        }
      );
      beginPrompt();
    });
};

// function for adding a new row in the role table
addRole = () => {
  // get the rows/result from the database query in the form of an array of objects
  connection.query("SELECT * FROM Department", (err, rows) => {
    if (err) throw err;
    // make a new string array of dept_name instead of an array of objects that we get back from connection.query
    // map a new array to make it the correct format for inquirer to show all rows as choices for a list
    const deptNames = rows.map((row) => row.dept_name);
    // prompt the user for row entry
    inquirer
      .prompt([
        {
          type: "input",
          name: "roletitle",
          message: "Enter the name of the role",
        },
        {
          type: "input",
          name: "sal",
          message: "Enter the salary of the employee",
        },
        {
          type: "list",
          name: "deptid",
          message: "Select the employee's department",
          choices: deptNames,
        },
      ])
      .then((response) => {
        // only get back the row with unique id that corresponds to the user's input
        const filteredRows = rows.filter(
          (obj) => obj.dept_name === response.deptid
        );
        // get back an array of just a single id in an array that we can then use for the row input into table
        const newObjectArray = filteredRows.map((row) => row.id);
        // insert the user's input into the table as a new row
        connection.query(
          "INSERT INTO Emp_Role SET ?",
          {
            role_title: response.roletitle,
            salary: response.sal,
            dept_id: newObjectArray[0],
          },
          (err, res) => {
            if (err) throw err;
          }
        );
        beginPrompt();
      });
  });
};

//function for adding a new row in the employee department
addEmp = () => {
    // get back an array of objects for Emp_Role to identify user's role_id as well as manager's role_id
    connection.query("SELECT * FROM Emp_Role", (err, rows) => {
      if (err) throw err;
      // map a new array to make it the correct format for inquirer to show all rows as choices for a list
      const empRoles = rows.map((row) => row.role_title);
      // prompt for user input
      inquirer
        .prompt([
          {
            type: "input",
            name: "firstname",
            message: "Enter the first name of the employee",
          },
          {
            type: "input",
            name: "lastname",
            message: "Enter the last name of the employee",
          },
          {
            type: "list",
            name: "roleid",
            message: "Select employee's role",
            choices: empRoles,
          }
        ])
        .then((response) => {
          // only get back the row with unique id that corresponds to the user's input
          const filteredRole = rows.filter(
            (obj) => obj.role_title === response.roleid
          );
          // get back an array of just a single id in an array that we can then use for the row input into table
          const roleidArray = filteredRole.map((row) => row.id);
          // insert the user's input into the table as a new row
          connection.query(
            "INSERT INTO Employee SET ?",
            {
              first_name: response.firstname,
              last_name: response.lastname,
              role_id: roleidArray[0],
            },
            (err, res) => {
              if (err) throw err;
            }
          );
          updateManager();
        });
    });
}

updateManager = () => {
  connection.query("SELECT id, CONCAT(first_name, ' ', last_name) AS full_name FROM Employee", (err, rows) => {
    if (err) throw err;
    const empList = rows.map(row => row.full_name)
    inquirer.prompt([
      {
        type: "list",
        name: "manager",
        message: "Choose the employee's manager",
        choices: empList
      }
    ]).then(response => {
      // get only the object of the manager that was picked in the response
      const filteredManager = rows.filter(obj => obj.full_name === response.manager);
      // convert the info into a single array holding the id number for the manager
      const managerArray = filteredManager.map(row => row.id)
      connection.query("UPDATE Employee SET manager_id = ? WHERE manager_id IS NULL",
      [managerArray[0]],
      (err, res) => {
        if (err) throw err;
      })
      beginPrompt();
    })
  });
}

// function to update employee roles
updateEmpRoles = () => {
  connection.query("SELECT Employee.id, Emp_Role.role_title, CONCAT(first_name, ' ', last_name) AS full_name FROM Employee INNER JOIN Emp_Role ON Employee.role_id = Emp_Role.id", (err, rows) => {
    if (err) throw err;
    const employeeList = rows.map(row => row.full_name)
    inquirer.prompt([
      {
        type: "list",
        name: "employee",
        message: "Choose the employee you want to update role for",
        choices: employeeList
      }
    ]).then(response => {

      connection.query("SELECT * from Emp_Role", (err, data) => {
        if (err) throw err;
        const roleList = data.map(obj => obj.role_title)
        inquirer.prompt([
          {
            type: "list",
            name: "newrole",
            message: "Pick new role for this employee",
            choices: roleList
          }
        ]).then(res => {
          // filter rows we get back from the Emp_Role table to a new array with only the role title that matches with the user's input
          const filteredRoles = data.filter(obj => obj.role_title === res.newrole)
          // make this into an array of strings, just holding the id number for this unique role
          const newroleid = filteredRoles.map(obj => obj.id);

          // get back the id for the employee based on user input
          const filteredEmployee = rows.filter(obj => obj.full_name === response.employee);
          const correspondingid = filteredEmployee.map(obj => obj.id)

          // update the role in the Employee's row where the id matches the name that the user is looking for
          connection.query("UPDATE Employee SET role_id = ? WHERE id = ?", [newroleid[0], correspondingid[0]], (err, res) => {
            if (err) throw err;
            beginPrompt();
          })
        })
      })
    })
  })
};

// function to view all columns and all rows from the Department table
viewDept = () => {
  connection.query("SELECT * FROM Department", (err, rows) => {
    if (err) throw err;
    console.table(rows);
    beginPrompt();
  });
};

// function to view all columns and rows from Emp_Role table
viewRole = () => {
  connection.query("SELECT * FROM Emp_Role", (err, rows) => {
    if (err) throw err;
    console.table(rows);
    beginPrompt();
  });
};

// function to view all columns and rows from Employee table
viewEmp = () => {
  connection.query("SELECT * FROM Employee", (err, rows) => {
    if (err) throw err;
    console.table(rows);
    beginPrompt();
  });
};
