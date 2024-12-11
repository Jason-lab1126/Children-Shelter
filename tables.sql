


DROP TABLE IF EXISTS shelterOrder;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS elder;

create table users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    password TEXT NOT NULL,
    child_name TEXT NOT NULL,
    age INTEGER,
    address TEXT,
    email TEXT NOT NULL
);

create table elder(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    age INTEGER,
    phone TEXT NOT NULL,
    price REAL NOT NULL,
    education TEXT NOT NULL,
    yearsOfWork INTEGER
);

CREATE TABLE shelterOrder (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parentId INTEGER,
    elderId INTEGER,
    startTime TEXT,
    endTime TEXT,
    address TEXT,
    confirmNum Text,
    comment TEXT,
    fileName TEXT,
    mark REAL,
    FOREIGN KEY (parentId) REFERENCES users(id),
    FOREIGN KEY (elderId) REFERENCES elder(id)
);

INSERT INTO users (name, password, child_name, age, address, email) VALUES
('Alice', 'password123', 'Tom', 35, '123 Main St', '1234567890'),
('Bob', 'securepass', 'Jerry', 40, '456 Elm St', '9876543210'),
('Cathy', 'mypassword', 'Anna', 30, '789 Pine St', '1122334455'),
('David', 'davidpass', 'Lucy', 38, '321 Oak St', '5566778899'),
('Eva', 'evapass', 'Liam', 28, '654 Maple St', '9988776655'),
('Frank', 'frankpass', 'Sophia', 45, '987 Birch St', '6677889900'),
('Grace', 'gracepass', 'Mia', 50, '123 Cedar St', '7788990011'),
('Henry', 'henrypass', 'Noah', 33, '456 Walnut St', '8899001122'),
('Ivy', 'ivypass', 'Emma', 29, '789 Spruce St', '9900112233'),
('Jack', 'jackpass', 'Oliver', 36, '321 Cherry St', '1100223344'),
('Karen', 'karenpass', 'Ella', 42, '654 Palm St', '2233445566'),
('Leo', 'leopass', 'Ava', 37, '789 Willow St', '3344556677'),
('Mia', 'miapass', 'Ethan', 31, '321 Fir St', '4455667788'),
('Nathan', 'nathanpass', 'Aria', 39, '654 Ash St', '5566778899'),
('Olivia', 'oliviapass', 'James', 34, '789 Redwood St', '6677889900'),
('Paul', 'paulpass', 'Isla', 41, '321 Sequoia St', '7788990011'),
('Quinn', 'quinnpass', 'Leo', 32, '654 Cypress St', '8899001122'),
('Rachel', 'rachelpass', 'Zoe', 43, '789 Poplar St', '9900112233'),
('Sam', 'sampass', 'Lily', 27, '321 Magnolia St', '1100223344'),
('Tina', 'tinapass', 'Kai', 29, '654 Sycamore St', '2233445566'),
('Uma', 'umapass', 'Milo', 35, '789 Banyan St', '3344556677'),
('Victor', 'victorpass', 'Eli', 40, '321 Dogwood St', '4455667788'),
('Wendy', 'wendypass', 'Nina', 38, '654 Alder St', '5566778899'),
('Xander', 'xanderpass', 'Finn', 33, '789 Beech St', '6677889900'),
('Yara', 'yarapass', 'Owen', 31, '321 Juniper St', '7788990011');

INSERT INTO elder (name, password, age, phone, price, education, yearsOfWork) VALUES
('John', 'elderpass1', 65, '1234567890', 3000.50, 'High School', 40),
('Mary', 'elderpass2', 70, '9876543210', 2500.00, 'Bachelor', 35),
('Paul', 'elderpass3', 60, '1122334455', 2800.75, 'Bachelor', 30),
('Linda', 'elderpass4', 68, '5566778899', 3200.00, 'Master', 45),
('James', 'elderpass5', 72, '9988776655', 2700.25, 'High School', 50),
('Susan', 'elderpass6', 65, '6677889900', 2900.00, 'Bachelor', 38),
('Robert', 'elderpass7', 63, '7788990011', 3100.50, 'Bachelor', 42),
('Patricia', 'elderpass8', 75, '8899001122', 2600.00, 'Master', 55),
('Michael', 'elderpass9', 69, '9900112233', 3300.00, 'High School', 48),
('Barbara', 'elderpass10', 62, '1100223344', 3000.00, 'Bachelor', 37),
('Charles', 'elderpass11', 66, '2233445566', 3100.00, 'High School', 41),
('Diana', 'elderpass12', 71, '3344556677', 2700.50, 'Bachelor', 39),
('Edward', 'elderpass13', 64, '4455667788', 2800.00, 'Master', 44),
('Fiona', 'elderpass14', 73, '5566778899', 3200.75, 'High School', 50),
('George', 'elderpass15', 67, '6677889900', 2900.00, 'Bachelor', 36),
('Helen', 'elderpass16', 74, '7788990011', 3000.25, 'Bachelor', 53),
('Ian', 'elderpass17', 61, '8899001122', 2600.00, 'Master', 40),
('Julia', 'elderpass18', 76, '9900112233', 3300.50, 'High School', 49),
('Kevin', 'elderpass19', 59, '1100223344', 3100.00, 'Bachelor', 34),
('Laura', 'elderpass20', 62, '2233445566', 2700.00, 'Bachelor', 38),
('Martin', 'elderpass21', 65, '3344556677', 2800.50, 'Master', 45),
('Nina', 'elderpass22', 70, '4455667788', 3200.00, 'High School', 52),
('Oscar', 'elderpass23', 63, '5566778899', 2900.75, 'Bachelor', 37),
('Paula', 'elderpass24', 68, '6677889900', 3000.00, 'Bachelor', 43),
('Quincy', 'elderpass25', 71, '7788990011', 2600.50, 'Master', 50);

INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (1, 1, '2024-12-01 08:00:00', '2024-12-01 17:00:00', '123 Main St', 'CONF123456', 'First test order', 4.5);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (2, 2, '2024-12-01 09:00:00', '2024-12-01 18:00:00', '456 Oak St', 'CONF123457', 'Second test order', 4.0);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (3, 3, '2024-12-01 10:00:00', '2024-12-01 19:00:00', '789 Pine St', 'CONF123458', 'Third test order', 3.5);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (4, 4, '2024-12-02 08:30:00', '2024-12-02 17:30:00', '321 Elm St', 'CONF123459', 'Fourth test order', 5.0);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (5, 5, '2024-12-02 09:30:00', '2024-12-02 18:30:00', '654 Maple St', 'CONF123460', 'Fifth test order', 4.2);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (6, 6, '2024-12-02 10:30:00', '2024-12-02 19:30:00', '987 Birch St', 'CONF123461', 'Sixth test order', 3.8);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (7, 7, '2024-12-03 08:15:00', '2024-12-03 17:15:00', '159 Cedar St', 'CONF123462', 'Seventh test order', 4.7);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (8, 8, '2024-12-03 09:15:00', '2024-12-03 18:15:00', '753 Spruce St', 'CONF123463', 'Eighth test order', 4.1);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (9, 9, '2024-12-03 10:15:00', '2024-12-03 19:15:00', '852 Fir St', 'CONF123464', 'Ninth test order', 3.9);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (10, 10, '2024-12-04 08:45:00', '2024-12-04 17:45:00', '369 Willow St', 'CONF123465', 'Tenth test order', 4.6);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (11, 11, '2024-12-04 09:45:00', '2024-12-04 18:45:00', '258 Chestnut St', 'CONF123466', 'Eleventh test order', 4.3);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (12, 12, '2024-12-04 10:45:00', '2024-12-04 19:45:00', '147 Hickory St', 'CONF123467', 'Twelfth test order', 3.7);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (13, 13, '2024-12-05 08:05:00', '2024-12-05 17:05:00', '963 Poplar St', 'CONF123468', 'Thirteenth test order', 4.4);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (14, 14, '2024-12-05 09:05:00', '2024-12-05 18:05:00', '852 Walnut St', 'CONF123469', 'Fourteenth test order', 4.8);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (15, 15, '2024-12-05 10:05:00', '2024-12-05 19:05:00', '741 Ash St', 'CONF123470', 'Fifteenth test order', 3.6);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (16, 16, '2024-12-06 08:20:00', '2024-12-06 17:20:00', '159 Maple St', 'CONF123471', 'Sixteenth test order', 4.9);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (17, 17, '2024-12-06 09:20:00', '2024-12-06 18:20:00', '753 Oak St', 'CONF123472', 'Seventeenth test order', 4.1);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (18, 18, '2024-12-06 10:20:00', '2024-12-06 19:20:00', '852 Pine St', 'CONF123473', 'Eighteenth test order', 3.3);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (19, 19, '2024-12-07 08:35:00', '2024-12-07 17:35:00', '321 Cedar St', 'CONF123474', 'Nineteenth test order', 4.0);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (20, 20, '2024-12-07 09:35:00', '2024-12-07 18:35:00', '654 Fir St', 'CONF123475', 'Twentieth test order', 4.6);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (21, 21, '2024-12-07 10:35:00', '2024-12-07 19:35:00', '987 Birch St', 'CONF123476', 'Twenty-first test order', 3.8);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (22, 22, '2024-12-08 08:50:00', '2024-12-08 17:50:00', '159 Maple St', 'CONF123477', 'Twenty-second test order', 4.2);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (23, 23, '2024-12-08 09:50:00', '2024-12-08 18:50:00', '753 Oak St', 'CONF123478', 'Twenty-third test order', 4.4);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (24, 24, '2024-12-08 10:50:00', '2024-12-08 19:50:00', '852 Pine St', 'CONF123479', 'Twenty-fourth test order', 3.9);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (25, 25, '2024-12-09 08:10:00', '2024-12-09 17:10:00', '321 Cedar St', 'CONF123480', 'Twenty-fifth test order', 4.7);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (26, 26, '2024-12-09 09:10:00', '2024-12-09 18:10:00', '654 Fir St', 'CONF123481', 'Twenty-sixth test order', 4.1);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (27, 27, '2024-12-09 10:10:00', '2024-12-09 19:10:00', '987 Birch St', 'CONF123482', 'Twenty-seventh test order', 3.5);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (28, 28, '2024-12-10 08:25:00', '2024-12-10 17:25:00', '159 Maple St', 'CONF123483', 'Twenty-eighth test order', 4.3);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (29, 29, '2024-12-10 09:25:00', '2024-12-10 18:25:00', '753 Oak St', 'CONF123484', 'Twenty-ninth test order', 4.0);
INSERT INTO shelterOrder (parentId, elderId, startTime, endTime, address, confirmNum, comment, mark) VALUES (30, 30, '2024-12-10 10:25:00', '2024-12-10 19:25:00', '852 Pine St', 'CONF123485', 'Thirtieth test order', 3.8);
