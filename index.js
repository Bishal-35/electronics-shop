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
app.use(express.json()); // for parsing application/json
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

// Inventory Route
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
        ORDER BY i.Item_ID ASC`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching inventory:', err);
            return res.status(500).send('An error occurred while fetching inventory.');
        }
        res.render('inventory', { inventory: results });
    });
});

// Add Item
app.post('/add-item', (req, res) => {
    const { Item_brand, Item_name, Item_category, Item_type, Item_quantity } = req.body;
    const sql = 'INSERT INTO Item (Item_brand, Item_name, Item_category, Item_type, Item_quantity) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [Item_brand, Item_name, Item_category, Item_type, Item_quantity], (err) => {
        if (err) {
            console.error('Error adding item:', err);
            return res.status(500).send('An error occurred while adding the item.');
        }
        res.redirect('/inventory');
    });
});

// Delete Item
app.post('/delete-item/:id', (req, res) => {
    const sql = 'DELETE FROM Item WHERE Item_ID = ?';
    db.query(sql, [req.params.id], (err) => {
        if (err) {
            console.error('Error deleting item:', err);
            return res.status(500).send('An error occurred while deleting the item.');
        }
        res.redirect('/inventory');
    });
});

// Add Customer
app.post('/add-customer', (req, res) => {
    const { Name, Phone_no, Item_name, Item_category, Item_brand, Quantity_Purchased } = req.body;
    const sql = 'INSERT INTO Customer (Name, Phone_no, Item_name, Item_category, Item_brand, Quantity_Purchased) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [Name, Phone_no, Item_name, Item_category, Item_brand, Quantity_Purchased], (err) => {
        if (err) {
            console.error('Error adding customer:', err);
            return res.status(500).send('An error occurred while adding the customer.');
        }
        res.redirect('/');
    });
});

// Add Employee
app.post('/add-employee', (req, res) => {
    const { Name, Employee_category, Role } = req.body;
    const sql = 'INSERT INTO Employee (Name, Employee_category, Role) VALUES (?, ?, ?)';
    db.query(sql, [Name, Employee_category, Role], (err) => {
        if (err) {
            console.error('Error adding employee:', err);
            return res.status(500).send('An error occurred while adding the employee.');
        }
        res.redirect('/');
    });
});

// Login
app.post('/login', (req, res) => {
    const { username, password, role } = req.body;

    if (role === 'admin') {
        if (username === credentials.admin.username && password === credentials.admin.password) {
            res.redirect('/admin-dashboard');
        } else {
            res.render('home', { error: 'Invalid admin credentials' });
        }
    } else if (role === 'employee') {
        if (username === credentials.employee.username && password === credentials.employee.password) {
            const markAttendanceSQL = `
                INSERT INTO Attendance (Employee_ID, Status, Date) 
                VALUES ((SELECT Employee_ID FROM Employee WHERE username = ?), 'Present', CURDATE())
                ON DUPLICATE KEY UPDATE Status = 'Present'`;
            db.query(markAttendanceSQL, [username], (err) => {
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

// Admin Dashboard
app.get('/admin-dashboard', (req, res) => {
    db.query('SELECT * FROM Item', (err, items) => {
        if (err) {
            return res.status(500).send('An error occurred while fetching items.');
        }
        db.query('SELECT * FROM Employee', (err, employees) => {
            if (err) {
                return res.status(500).send('An error occurred while fetching employees.');
            }
            res.render('admin-dashboard', { items, employees });
        });
    });
});

// Employee Dashboard
app.get('/employee-dashboard', (req, res) => {
    db.query('SELECT * FROM Item', (err, items) => {
        if (err) {
            return res.status(500).send('An error occurred while fetching items.');
        }
        res.render('employee-dashboard', { items });
    });
});

// Mark Attendance
app.post('/mark-attendance', (req, res) => {
    const { Employee_ID, Status } = req.body;
    const sql = `
        INSERT INTO Attendance (Employee_ID, Status, Date) 
        VALUES (?, ?, CURDATE())
        ON DUPLICATE KEY UPDATE Status = ?`;

    db.query(sql, [Employee_ID, Status, Status], (err) => {
        if (err) {
            return res.status(500).send('An error occurred while marking attendance.');
        }
        res.redirect('/employee-dashboard');
    });
});

// Employee Management
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
            return res.status(500).send('Error fetching employee data');
        }
        res.render('employee-list', { employees });
    });
});

// Edit Employee
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
            return res.status(500).send('Error fetching employee data');
        }
        res.render('edit-employee', { employee: results[0] });
    });
});

// Update Employee
app.post('/update-employee/:id', (req, res) => {
    const employeeId = req.params.id;
    const { Name, Employee_category, Role, Status } = req.body;

    const updateEmployeeSQL = `
        UPDATE Employee 
        SET Name = ?, Employee_category = ?, Role = ?
        WHERE Employee_ID = ?`;

    db.query(updateEmployeeSQL, [Name, Employee_category, Role, employeeId], (err) => {
        if (err) {
            return res.status(500).send('Error updating employee');
        }

        if (Status) {
            const updateAttendanceSQL = `
                INSERT INTO Attendance (Employee_ID, Status, Date)
                VALUES (?, ?, CURDATE())
                ON DUPLICATE KEY UPDATE Status = ?`;

            db.query(updateAttendanceSQL, [employeeId, Status, Status]);
        }

        res.redirect('/employees');
    });
});

// Add Customer Page
app.get('/add-customer', (req, res) => {
    res.render('add-customer');
});

// Add Customer POST
app.post('/customers/add', (req, res) => {
    const { name, phone, item_name, item_category, item_brand, quantity } = req.body;
    const sql = 'INSERT INTO Customer (Name, Phone_no, Item_name, Item_category, Item_brand, Quantity_Purchased) VALUES (?, ?, ?, ?, ?, ?)';

    db.query(sql, [name, phone, item_name, item_category, item_brand, quantity], (err) => {
        if (err) {
            return res.status(500).send('Error adding customer');
        } else {
            res.redirect('/employee-dashboard');
        }
    });
});

// Customer List
app.get('/customers', (req, res) => {
    const sql = 'SELECT * FROM Customer ORDER BY Customer_ID DESC';
    db.query(sql, (err, customers) => {
        if (err) {
            return res.status(500).send('Error fetching customer data');
        }
        res.render('customer-list', { customers });
    });
});

// ✅ Update Quantity
app.post('/update-quantity/:id', (req, res) => {
    const itemId = req.params.id;
    const { quantity } = req.body;

    const sql = 'UPDATE Item SET Item_quantity = ? WHERE Item_ID = ?';
    db.query(sql, [quantity, itemId], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update quantity' });
        }
        res.status(200).json({ message: 'Quantity updated successfully' });
    });
});

// Place Order
app.post('/place-order', (req, res) => {
    const { items } = req.body;

    for (const item of items) {
        const updateSql = 'UPDATE Item SET Item_quantity = Item_quantity - ? WHERE Item_ID = ?';
        db.query(updateSql, [item.quantity, item.itemId]);

        const checkSql = 'SELECT Item_quantity FROM Item WHERE Item_ID = ?';
        db.query(checkSql, [item.itemId], (err, results) => {
            if (err) return;
            if (results[0].Item_quantity < 50) {
                console.log(`Low stock alert: Item ${item.itemId} has quantity below 50`);
            }
        });
    }

    res.status(200).json({ message: 'Order placed successfully' });
});

// Process Order
app.post('/process-order', (req, res) => {
    const { itemId, quantity } = req.body;

    const parsedItemId = parseInt(itemId, 10);
    const parsedQuantity = parseInt(quantity, 10);

    if (isNaN(parsedItemId) || parsedItemId <= 0) {
        return res.status(400).json({ error: 'Invalid item ID format' });
    }

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return res.status(400).json({ error: 'Invalid quantity' });
    }

    const checkStockSql = 'SELECT Item_quantity, Item_name FROM Item WHERE Item_ID = ?';
    db.query(checkStockSql, [parsedItemId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const currentStock = parseInt(results[0].Item_quantity, 10);
        if (currentStock < parsedQuantity) {
            return res.status(400).json({ error: `Insufficient stock. Available: ${currentStock}` });
        }

        const newQuantity = currentStock - parsedQuantity;
        const updateSql = 'UPDATE Item SET Item_quantity = ? WHERE Item_ID = ?';

        db.query(updateSql, [newQuantity, parsedItemId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error updating quantity' });
            }

            if (newQuantity < 50) {
                console.log(`Low stock alert: ${results[0].Item_name} (ID: ${parsedItemId}) is low`);
            }

            res.status(200).json({
                message: 'Order processed successfully',
                newQuantity,
                itemId: parsedItemId
            });
        });
    });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
