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
        "Exit"
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
          updateEmp();
        break;
        case "Exit":
          connection.end();
        break;
      }
    });
};

// function for adding department
addDept = () => {
  inquirer
    .prompt({
      type: "input",
      name: "dept",
      message: "Enter the name of the department",
    }).then(response => {
      const query = connection.query(
        "INSERT INTO Department SET ?",
        {dept_name: response.dept},
        (err, rows) => {
          if (err) throw err;
        }
      );
      beginPrompt();
    });
};


addRole = () => {
  connection.query("SELECT * FROM Department", (err, rows) => {
    if (err) throw err;
    // make a new string array of dept_name instead of an array of objects that we get back from connection.query
    const deptNames = rows.map(row => row.dept_name);
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
        message: "Enter the salary of the employee"
      },
      {
        type: "list",
        name: "deptid",
        message: "Select the employee's department",
        choices: deptNames
      }
    ]).then(response => {
      const filteredRows = rows.filter(obj => obj.dept_name === response.deptid);
      const newObjectArray = filteredRows.map(row => row.id);
      console.log(newObjectArray);
      
      
      connection.query(
        "INSERT INTO Emp_Role SET ?",
        {
          role_title: response.roletitle,
          salary: response.sal,
          dept_id: newObjectArray[0]
        },
        (err, res) => {
          if (err) throw err
        }
      );
      beginPrompt();
    })  
  })
  };

// addEmp = () => {
//   const roles = connection.query("SELECT * FROM Emp_Role", (err, rows) => {
//     if (err) return "Could not select from Emp_Role table";
//   });

//   const managers = connection.query("SELECT * FROM Employee WHERE ?", {}, (err, rows) => {});
//   inquirer
//     .prompt([
//       {
//       type: "input",
//       name: "employee",
//       message: "Enter the first name of the employee",
//       },
//       {
//         type: "input",
//         name: "firstname",
//         message: "Enter the last name of the employee"
//       },
//       {
//         type: "list",
//         name: "roleid",
//         message: "Select employee's role",
//         choices: connection.query("SELECT ")
//       },
//       {
//         type: "list",
//         name: "managerid",
//         message: "Select the employee's manager",
//         choices: ["test"]
//       }
//     ])
//     .then();
// };

// function to view all columns and all rows from the Department table
viewDept = () => {
  connection.query("SELECT * FROM Department", (err, rows) => {
    if (err) throw err;
    console.table(rows);
    beginPrompt();
  })
};

// function to view all columns and rows from Emp_Role table
viewRole = () => {
  connection.query("SELECT * FROM Emp_Role", (err, rows) => {
    if (err) throw err;
    console.table(rows);
    beginPrompt();
  })
};

// function to view all columns and rows from Employee table
viewEmp = () => {
  connection.query("SELECT * FROM Employee", (err, rows) => {
    if (err) throw err;
    console.table(rows);
    beginPrompt();
  })
}