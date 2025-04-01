const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '031001',
    database: 'Electronicshop'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        process.exit(1);
    }
    console.log('Connected to database.');
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Hardcoded credentials
const credentials = {
    admin: {
        username: 'admin',
        password: 'admin123'
    },
    employee: {
        username: 'employee',
        password: 'emp123'
    }
};

// Home Route - Display Items
app.get('/', (req, res) => {
    db.query('SELECT * FROM Item', (err, results) => {
        if (err) {
            console.error('Error fetching items:', err);
            return res.status(500).send('An error occurred while fetching items.');
        }
        res.render('home', { items: results });
    });
});

// Inventory Route - Display Inventory
app.get('/inventory', (req, res) => {
    const sql = `
        SELECT 
            i.Item_ID,
            i.Item_brand,
            i.Item_name,
            i.Item_category,
            i.Item_type,
            i.Item_quantity
        FROM Item i
        ORDER BY i.Item_ID ASC`;  // Sort by Item_ID in ascending order

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching inventory:', err);
            return res.status(500).send('An error occurred while fetching inventory.');
        }
        res.render('inventory', { inventory: results });
    });
});

// Add Item Route
app.post('/add-item', (req, res) => {
    const { Item_brand, Item_name, Item_category, Item_type, Item_quantity } = req.body;
    const sql = 'INSERT INTO Item (Item_brand, Item_name, Item_category, Item_type, Item_quantity) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [Item_brand, Item_name, Item_category, Item_type, Item_quantity], (err, result) => {
        if (err) {
            console.error('Error adding item:', err);
            return res.status(500).send('An error occurred while adding the item.');
        }
        res.redirect('/inventory'); // Changed from '/' to '/inventory'
    });
});

// Delete Item Route
app.post('/delete-item/:id', (req, res) => {
    const sql = 'DELETE FROM Item WHERE Item_ID = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting item:', err);
            return res.status(500).send('An error occurred while deleting the item.');
        }
        res.redirect('/inventory'); // Changed from '/' to '/inventory'
    });
});

// Add Customer Route
app.post('/add-customer', (req, res) => {
    const { Name, Phone_no, Item_name, Item_category, Item_brand, Quantity_Purchased } = req.body;
    const sql = 'INSERT INTO Customer (Name, Phone_no, Item_name, Item_category, Item_brand, Quantity_Purchased) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [Name, Phone_no, Item_name, Item_category, Item_brand, Quantity_Purchased], (err, result) => {
        if (err) {
            console.error('Error adding customer:', err);
            return res.status(500).send('An error occurred while adding the customer.');
        }
        res.redirect('/');
    });
});

// Add Employee Route
app.post('/add-employee', (req, res) => {
    const { Name, Employee_category, Role } = req.body;
    const sql = 'INSERT INTO Employee (Name, Employee_category, Role) VALUES (?, ?, ?)';
    db.query(sql, [Name, Employee_category, Role], (err, result) => {
        if (err) {
            console.error('Error adding employee:', err);
            return res.status(500).send('An error occurred while adding the employee.');
        }
        res.redirect('/');
    });
});

// Login Route
app.post('/login', (req, res) => {
    const { username, password, role } = req.body;
    
    console.log('Login attempt:', { username, role });
    
    if (role === 'admin') {
        if (username === credentials.admin.username && password === credentials.admin.password) {
            res.redirect('/admin-dashboard');
        } else {
            res.render('home', { error: 'Invalid admin credentials' });
        }
    } else if (role === 'employee') {
        if (username === credentials.employee.username && password === credentials.employee.password) {
            // Mark attendance as present when employee logs in
            const markAttendanceSQL = `
                INSERT INTO Attendance (Employee_ID, Status, Date) 
                VALUES ((SELECT Employee_ID FROM Employee WHERE username = ?), 'Present', CURDATE())
                ON DUPLICATE KEY UPDATE Status = 'Present'`;
            
            db.query(markAttendanceSQL, [username], (err, result) => {
                if (err) {
                    console.error('Error marking attendance:', err);
                }
                res.redirect('/employee-dashboard');
            });
        } else {
            res.render('home', { error: 'Invalid employee credentials' });
        }
    } else {
        res.render('home', { error: 'Invalid role selected' });
    }
});

// Admin Dashboard Route
app.get('/admin-dashboard', (req, res) => {
    db.query('SELECT * FROM Item', (err, items) => {
        if (err) {
            console.error('Error fetching items:', err);
            return res.status(500).send('An error occurred while fetching items.');
        }
        db.query('SELECT * FROM Employee', (err, employees) => {
            if (err) {
                console.error('Error fetching employees:', err);
                return res.status(500).send('An error occurred while fetching employees.');
            }
            res.render('admin-dashboard', { items, employees });
        });
    });
});

// Employee Dashboard Route
app.get('/employee-dashboard', (req, res) => {
    // Fetch both inventory items and attendance status
    db.query('SELECT * FROM Item', (err, items) => {
        if (err) {
            console.error('Error fetching items:', err);
            return res.status(500).send('An error occurred while fetching items.');
        }
        res.render('employee-dashboard', { items });
    });
});

// Mark Attendance Route
app.post('/mark-attendance', (req, res) => {
    const { Employee_ID, Status } = req.body;
    const sql = `
        INSERT INTO Attendance (Employee_ID, Status, Date) 
        VALUES (?, ?, CURDATE())
        ON DUPLICATE KEY UPDATE Status = ?`;
    
    db.query(sql, [Employee_ID, Status, Status], (err, result) => {
        if (err) {
            console.error('Error marking attendance:', err);
            return res.status(500).send('An error occurred while marking attendance.');
        }
        res.redirect('/employee-dashboard');
    });
});

// Employee Management Route
app.get('/employees', (req, res) => {
    const sql = `
        SELECT 
            e.Employee_ID,
            e.Name,
            e.Employee_category,
            e.Role,
            COALESCE(a.Status, 'Not Marked') as Today_Status,
            DATE_FORMAT(a.Date, '%Y-%m-%d') as Last_Attendance
        FROM Employee e
        LEFT JOIN Attendance a ON e.Employee_ID = a.Employee_ID
        AND a.Date = CURDATE()
        ORDER BY e.Employee_ID`;

    db.query(sql, (err, employees) => {
        if (err) {
            console.error('Error fetching employees:', err);
            return res.status(500).send('Error fetching employee data');
        }
        res.render('employee-list', { employees });
    });
});

// Edit Employee Route
app.get('/edit-employee/:id', (req, res) => {
    const employeeId = req.params.id;
    const sql = `
        SELECT 
            e.*,
            COALESCE(a.Status, 'Not Marked') as Today_Status,
            DATE_FORMAT(a.Date, '%Y-%m-%d') as Last_Attendance
        FROM Employee e
        LEFT JOIN Attendance a ON e.Employee_ID = a.Employee_ID
        AND a.Date = CURDATE()
        WHERE e.Employee_ID = ?`;

    db.query(sql, [employeeId], (err, results) => {
        if (err) {
            console.error('Error fetching employee:', err);
            return res.status(500).send('Error fetching employee data');
        }
        res.render('edit-employee', { employee: results[0] });
    });
});

// Update Employee Route
app.post('/update-employee/:id', (req, res) => {
    const employeeId = req.params.id;
    const { Name, Employee_category, Role, Status } = req.body;

    // Update employee details
    const updateEmployeeSQL = `
        UPDATE Employee 
        SET Name = ?, Employee_category = ?, Role = ?
        WHERE Employee_ID = ?`;

    db.query(updateEmployeeSQL, [Name, Employee_category, Role, employeeId], (err) => {
        if (err) {
            console.error('Error updating employee:', err);
            return res.status(500).send('Error updating employee');
        }

        // Update attendance if status is provided
        if (Status) {
            const updateAttendanceSQL = `
                INSERT INTO Attendance (Employee_ID, Status, Date)
                VALUES (?, ?, CURDATE())
                ON DUPLICATE KEY UPDATE Status = ?`;

            db.query(updateAttendanceSQL, [employeeId, Status, Status], (err) => {
                if (err) {
                    console.error('Error updating attendance:', err);
                }
            });
        }

        res.redirect('/employees');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});