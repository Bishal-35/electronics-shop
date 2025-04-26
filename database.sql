CREATE DATABASE IF NOT EXISTS ElectronicShop;
USE ElectronicShop;

CREATE TABLE IF NOT EXISTS Item (
    Item_ID INT AUTO_INCREMENT PRIMARY KEY,
    Item_brand VARCHAR(100) NOT NULL,
    Item_name VARCHAR(100) NOT NULL,
    Item_category VARCHAR(100) NOT NULL,
    Item_type VARCHAR(100) NOT NULL,
    Item_quantity INT DEFAULT 200
);


CREATE TABLE IF NOT EXISTS Employee (
    Employee_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Employee_category VARCHAR(100) NOT NULL,
    Role ENUM('Admin', 'Employee') NOT NULL
);

CREATE TABLE IF NOT EXISTS Customer (
    Customer_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Phone_no VARCHAR(15) NOT NULL,
    Item_name VARCHAR(100) NOT NULL,
    Item_category VARCHAR(100) NOT NULL,
    Item_brand VARCHAR(100) NOT NULL,
    Quantity_Purchased INT NOT NULL
);


INSERT INTO Item (Item_brand, Item_name, Item_category, Item_type, Item_quantity) VALUES
('Samsung', 'Galaxy S24', 'Smartphone', 'Electronics', 200),
('Apple', 'iPhone 15', 'Smartphone', 'Electronics', 200),
('OnePlus', 'OnePlus 12', 'Smartphone', 'Electronics', 200),
('Dell', 'XPS 15', 'Laptop', 'Computers', 200),
('HP', 'Pavilion 14', 'Laptop', 'Computers', 200),
('Lenovo', 'ThinkPad X1', 'Laptop', 'Computers', 200),
('Asus', 'ROG Strix G16', 'Laptop', 'Computers', 200),
('Sony', 'Bravia XR', 'Television', 'Electronics', 200),
('LG', 'OLED C3', 'Television', 'Electronics', 200),
('Samsung', 'Crystal UHD', 'Television', 'Electronics', 200),
('Bose', 'QuietComfort 45', 'Headphones', 'Accessories', 200),
('Sony', 'WH-1000XM5', 'Headphones', 'Accessories', 200),
('JBL', 'Charge 5', 'Speakers', 'Accessories', 200),
('Apple', 'AirPods Pro', 'Earbuds', 'Accessories', 200),
('Google', 'Pixel Buds Pro', 'Earbuds', 'Accessories', 200),
('Logitech', 'MX Master 3', 'Mouse', 'Peripherals', 200),
('Corsair', 'K95 RGB', 'Keyboard', 'Peripherals', 200),
('Samsung', '870 EVO', 'SSD', 'Storage', 200),
('Seagate', 'Barracuda 2TB', 'HDD', 'Storage', 200),
('SanDisk', 'Extreme Pro 256GB', 'Memory Card', 'Storage', 200);
select * from item;

INSERT INTO Employee (Name, Employee_category, Role) VALUES
('John Doe', 'Sales', 'Employee'),
('Jane Smith', 'Support', 'Employee'),
('Alice Johnson', 'Management', 'Admin'),
('Bob Brown', 'Sales', 'Employee'),
('Charlie Wilson', 'Support', 'Employee'),
('David Lee', 'Management', 'Admin'),
('Emma Davis', 'Technical', 'Employee'),
('Frank Thomas', 'Technical', 'Employee'),
('Grace White', 'HR', 'Admin'),
('Henry Miller', 'HR', 'Employee'),
('Ivy Harris', 'Sales', 'Employee'),
('Jack Martin', 'Technical', 'Employee'),
('Kara Robinson', 'Support', 'Employee'),
('Liam Clark', 'Management', 'Admin'),
('Mia Lewis', 'HR', 'Employee'),
('Nathan Allen', 'Technical', 'Employee'),
('Olivia Scott', 'Support', 'Employee'),
('Paul Walker', 'Sales', 'Employee'),
('Quincy Adams', 'Management', 'Admin'),
('Rachel Carter', 'HR', 'Employee');
select * from employee;

INSERT INTO Customer (Name, Phone_no, Item_name, Item_category, Item_brand, Quantity_Purchased) VALUES
('Rahul Sharma', '9876543210', 'Galaxy S24', 'Smartphone', 'Samsung', 1),
('Priya Patel', '9123456789', 'iPhone 15', 'Smartphone', 'Apple', 2),
('Amit Verma', '9988776655', 'OnePlus 12', 'Smartphone', 'OnePlus', 1),
('Sneha Kapoor', '8899001122', 'XPS 15', 'Laptop', 'Dell', 1),
('Rajesh Kumar', '7766554433', 'Pavilion 14', 'Laptop', 'HP', 1),
('Neha Singh', '6655443322', 'ThinkPad X1', 'Laptop', 'Lenovo', 1),
('Arjun Das', '5544332211', 'ROG Strix G16', 'Laptop', 'Asus', 1),
('Meera Iyer', '9988221100', 'Bravia XR', 'Television', 'Sony', 1),
('Karan Malhotra', '9900112233', 'OLED C3', 'Television', 'LG', 1),
('Deepika Choudhury', '8800776655', 'Crystal UHD', 'Television', 'Samsung', 1),
('Vikram Joshi', '9700112299', 'QuietComfort 45', 'Headphones', 'Bose', 1),
('Ananya Roy', '9600554411', 'WH-1000XM5', 'Headphones', 'Sony', 1),
('Rohit Mehta', '9500443322', 'Charge 5', 'Speakers', 'JBL', 1),
('Pooja Nair', '9400332211', 'AirPods Pro', 'Earbuds', 'Apple', 1),
('Saurav Bhatia', '9300221100', 'Pixel Buds Pro', 'Earbuds', 'Google', 1),
('Divya Sharma', '9200110099', 'MX Master 3', 'Mouse', 'Logitech', 1),
('Harsh Kapoor', '9100998877', 'K95 RGB', 'Keyboard', 'Corsair', 1),
('Aditi Jain', '9000887766', '870 EVO', 'SSD', 'Samsung', 1),
('Manoj Gupta', '8900776655', 'Barracuda 2TB', 'HDD', 'Seagate', 1),
('Tanya Dutta', '8800665544', 'Extreme Pro 256GB', 'Memory Card', 'SanDisk', 1);
select * from customer;

CREATE TABLE Attendance (
    Attendance_ID INT PRIMARY KEY AUTO_INCREMENT,
    Employee_ID INT,
    Status ENUM('Present', 'Absent', 'Leave') NOT NULL,
    Date DATE NOT NULL,
    FOREIGN KEY (Employee_ID) REFERENCES Employee(Employee_ID),
    UNIQUE KEY unique_daily_attendance (Employee_ID, Date)
);
desc Attendance;


ALTER TABLE Employee ADD COLUMN username VARCHAR(50) UNIQUE;