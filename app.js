/*
 * Name: Jayson Xu
 * Date: December 9th, 2024
 * Section: CSE 154 AB
 * Description: This server is built using Express.js and SQLite for a children shelter program.
 * It provides endpoints for user registration, login, elder information retrieval,
 * order management, and file uploads/downloads. The server integrates robust error handling,
 * session management, and CORS support to ensure secure and smooth interactions.
 * Database interactions are managed with SQLite, and the scheduling logic ensures no conflicts
 * when booking elders for shelters. Static files are served from a public directory,
 * and multer is used for handling file uploads.
 */

"use strict";

const express = require('express');
const app = express();
const session = require('express-session');

const fs = require('fs').promises;
const cors = require('cors');
const UNIQUE_CONSTRAINT_ERROR = 19;
const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const INTERNAL_ERROR = 500;
const DEFAULT_PORT = 3000;
const PORT = process.env.PORT || DEFAULT_PORT;
const path = require('path');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Middleware setup for parsing JSON, handling CORS, and managing sessions.
app.use(express.json());
app.use(cors());
const sqlite3 = require('sqlite3').verbose();
app.use(session({
  secret: 'child',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false}
}));

const multer = require('multer');
const {log} = require('console');

/**
 * Configures storage for file uploads using multer.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({storage});

/**
 * Endpoint to handle single file uploads.
 * @param {Express.Request} req - The request object.
 * @param {Express.Response} res - The response object.
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(HTTP_BAD_REQUEST).send('No file uploaded.');
  }
  res.json({
    message: 'File uploaded successfully!',
    fileName: req.file.filename,
  });
});

/**
 * Endpoint to download a file based on filename.
 * @param {Express.Request} req - The request object.
 * @param {Express.Response} res - The response object.
 */
app.get('/api/download/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(UPLOADS_DIR, fileName);

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error('File download error:', err);
      res.status(HTTP_NOT_FOUND).send('File not found!');
    }
  });
});

// Middleware to serve static files from 'public' directory
app.use(express.static('public'));

/**
 * Opens a new connection to the SQLite database.
 * @returns {sqlite3.Database} A new database connection.
 */
function opendb() {
  let db = new sqlite3.Database('children.db', err => {
    if (err) {
      return -1;
    }
  });
  db.run("PRAGMA foreign_keys = ON");
  return db;
}

/**
 * Closes the provided SQLite database connection.
 * @param {sqlite3.Database} db - The database connection to close.
 */
function closedb(db) {
  db.close(err => {
    if (err) {
      return -1;
    }
  });
}

/**
 * Serves the index.html file from the server.
 * This endpoint reads the index.html file from the 'public' directory and sends it to the client.
 * If the file read operation fails, it sends an HTTP 500 Internal Server Error response.
 * @param {Express.Request} req - The request object.
 * @param {Express.Response} res - The response object used to send back the HTML file or an
 * error message.
 */
app.get('/index.html', async (req, res) => {
  try {
    const data = await fs.readFile('./public/index.html', 'utf8');
    res.status(HTTP_OK).send(data);
  } catch (err) {
    res.status(INTERNAL_ERROR).json({error: 'Error reading data from file.'});
  }
});

/**
 * Root endpoint that sends a welcome message when accessed.
 */
app.get('/', (req, res) => {
  res.send('Welcome to Jayson server!');
});

/**
 * login
 */
app.post('/api/login', (req, res) => {
  const {name, password, role} = req.body;

  if (!(password && password.trim() !== '')) {
    return res.status(HTTP_BAD_REQUEST).send('Missing password.');
  }
  if (!(name && name.trim() !== '')) {
    return res.status(HTTP_BAD_REQUEST).send('Missing username.');
  }
  if (!(role && role.trim() !== '')) {
    return res.status(HTTP_BAD_REQUEST).send('Missing role.');
  }
  const sql1 = `SELECT * FROM users where LOWER(name) = trim(LOWER(?))
  and LOWER(password) = trim(LOWER(?))`;
  const sql2 = `SELECT * FROM elder where LOWER(name) = trim(LOWER(?))
  and LOWER(password) = trim(LOWER(?))`;
  const errorMsg = 'An error occurred on the server. Try again later.';
  const db = opendb();
  let sql = sql1;
  if (role !== 'Parent') {
    sql = sql2;
  }

  db.all(sql, [name, password], (err, rows) => {
    if (err) {
      closedb(db);
      return res.status(INTERNAL_ERROR).send(errorMsg);
    }
    if (rows.length === 0) {
      closedb(db);
      return res.status(HTTP_BAD_REQUEST).send('User does not exist or password is wrong.');
    }
    let user = rows[0];
    user.role = role;
    req.session.username = name;
    res.status(HTTP_OK).json(user);
    closedb(db);
  });
});

/**
 * Constructs an SQL query to fetch elder information based on multiple filter parameters.
 * @param {Array} params - The parameters to include in the SQL query.
 * @param {number} [id] - Optional elder ID to filter by.
 * @param {number} [age] - Optional maximum age to filter by.
 * @param {string} [education] - Optional education level to filter by.
 * @param {number} [yearsOfWork] - Optional minimum years of work to filter by.
 * @param {string} [name] - Optional name pattern to search for.
 * @param {number} [price] - Optional maximum price to filter by.
 * @param {string} [degree] - Optional flag to filter by Bachelor or Master degree.
 * @returns {string} The constructed SQL query string.
 */
function generateUrl(params, id, age, education, yearsOfWork, name, price, degree) {
  let sql = `SELECT a.*, b.avgMark as avgMark
              FROM elder a
              left join (
                select elderId, sum(mark)/ count(*) as avgMark
                from
                shelterOrder
                group by elderId
              ) b on a.id = b.elderId
            where 1=1 `;
  if (id) {
    sql += `and a.id = ? `;
    params.push(parseInt(id, 10));
  }
  if (age) {
    sql += `and a.age <= ? `;
    params.push(parseInt(age, 10));
  }
  if (yearsOfWork) {
    sql += `and a.yearsOfWork >= ? `;
    params.push(parseInt(yearsOfWork, 10));
  }
  if (education) {
    sql += `and a.education = ? `;
    params.push(education);
  }
  if (name) {
    sql += `and a.name like ? `;
    params.push(`%${name}%`);
  }
  if (price) {
    sql += `and a.price <= ? `;
    params.push(price);
  }
  if (degree) {
    sql += `and a.education in ('Bachelor','Master') `;
  }
  return sql;
}

/**
 * get the elders information
 */
app.get('/api/elders', (req, res) => {

  try {
    const id = req.query.id;
    const age = req.query.age;
    const education = req.query.education;
    const yearsOfWork = req.query.yearsOfWork;
    const name = req.query.name;
    const price = req.query.price;
    const degree = req.query.degree;

    let params = [];
    const sql = generateUrl(params, id, age, education, yearsOfWork, name, price, degree);
    const db = opendb();
    db.all(sql, params, (err, rs) => {
      if (err) {
        closedb(db);
        return res.status(INTERNAL_ERROR).send('Database query error');
      }
      closedb(db);
      return res.status(HTTP_OK).json({'elders': rs});
    });
  } catch (err) {
    return res.status(INTERNAL_ERROR).json({error: 'Error reading data.'});
  }
});

app.get('/api/review', (req, res) => {
  const db = opendb();
  try {
    if (!req.session.username) {
      return res.status(HTTP_BAD_REQUEST).send('user does not log in.');
    }
    const mark = req.query.mark;
    const comment = req.query.comment;
    const id = req.query.id;
    if (!mark) {
      return res.status(HTTP_BAD_REQUEST).send('mark is required.');
    }
    if (!comment) {
      return res.status(HTTP_BAD_REQUEST).send('comment is requested.');
    }
    if (!id) {
      return res.status(HTTP_BAD_REQUEST).send('id is required.');
    }

    db.run(`update shelterOrder set mark = ?, comment = ? where id = ?`, [mark, comment, id], (err) => {
      if (err) {
        return res.status(INTERNAL_ERROR).json({error: 'Error reading data.'});
      }
    });
    res.status(HTTP_OK).json({'result':'success'});
  } catch (err) {
    return res.status(INTERNAL_ERROR).json({error: 'Error reading data.'});
  } finally {
    closedb(db);
  }
});

/**
 * Constructs SQL queries based on the specified type.
 * @param {number} type - Specifies the query type, 1 for parentId and 2 for elderId.
 * @returns {string} The corresponding SQL query.
 */
function getOrdersSql(type) {
  let sql = `SELECT a.*, b.child_name, b.address, b.age, b.email,
              c.name as elderName, c.age, c.phone, c.price, c.education, c.yearsOfWork
              FROM shelterOrder a
              inner join users b on a.parentId = b.id
              inner join elder c on a.elderId = c.id
              where parentId = ?`;
  const sql2 = `SELECT a.*, b.child_name, b.address, b.age, b.email,
  c.name as elderName, c.age, c.phone, c.price, c.education, c.yearsOfWork
  FROM shelterOrder a
  inner join users b on a.parentId = b.id
  inner join elder c on a.elderId = c.id
  where elderId = ?`;
  if (type === 1) {
    return sql;
  } else {
    return sql2;
  }
}

/**
 * Retrieves a list of orders based on either parent or elder ID.
 * @param {Express.Request} req - The request object containing 'pid' (parentID) or 'eid' (elderID).
 * @param {Express.Response} res - The response object used to send back HTTP responses.
 */
app.get('/api/orders', (req, res) => {
  try {
    if (!req.session.username) {
      return res.status(HTTP_BAD_REQUEST).send('user does not log in.');
    }

    const pid = req.query.pid;
    const eid = req.query.eid;
    if (!eid && !pid) {
      return res.status(INTERNAL_ERROR).send('id is required.');
    }
    if (eid && pid) {
      return res.status(INTERNAL_ERROR).send('double id is requested.');
    }

    let id = pid;
    let sql = getOrdersSql(1);
    if (eid) {
      id = eid;
      sql = getOrdersSql(2);
    }

    const db = opendb();
    if (id) {
      db.all(sql, [id], (err, rs) => {
        if (err) {
          closedb(db);
          return res.status(INTERNAL_ERROR).send('Database query error');
        }
        closedb(db);
        return res.status(HTTP_OK).json({'orders': rs});
      });
    }
  } catch (err) {
    return res.status(INTERNAL_ERROR).json({error: 'Error reading data.'});
  }
});

/**
 * Generates a random confirmation number consisting of letters and numbers.
 * @returns {string} A random confirmation number of fixed length 6.
 */
function generateConfirmationNumber() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let confirmationNumber = '';
  const length = 6;
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    confirmationNumber += characters[randomIndex];
  }

  return confirmationNumber;
}

/**
 * Places an order for a shelter by scheduling time with an elder, ensuring no scheduling conflicts.
 * @param {Express.Request} req - The request object containing order details.
 * @param {Express.Response} res - The response object used to send back HTTP responses.
 */
app.post('/api/shelterOrder', async (req, res) => {

  if (!req.session.username) {
    return res.status(HTTP_BAD_REQUEST).send('user does not log in.');
  }

  const {parentId, elderId, startTime, endTime, address, filename} = req.body;

  if (!(parentId && parentId.trim() !== '')) {
    return res.status(HTTP_BAD_REQUEST).send('Missing parentId.');
  }
  if (!(address && address.trim() !== '')) {
    return res.status(HTTP_BAD_REQUEST).send('Missing address.');
  }
  if (!(elderId && elderId.trim() !== '')) {
    return res.status(HTTP_BAD_REQUEST).send('Missing elderId.');
  }
  if (!(startTime && startTime.trim() !== '')) {
    return res.status(HTTP_BAD_REQUEST).send('Missing startTime.');
  }
  if (!(endTime && endTime.trim() !== '')) {
    return res.status(HTTP_BAD_REQUEST).send('Missing endTime.');
  }
  if (startTime > endTime) {
    return res.status(HTTP_BAD_REQUEST).send('Start time should later than end time.');
  }

  const db = opendb();
  const sql = `insert into shelterOrder(parentId, elderId, startTime, endTime, address, filename) values(?, ?, ?, ?, ?, ?)`;
  const secletSql = `SELECT * FROM shelterOrder a WHERE a.elderId = ?
                  and ((a.startTime <= ? and ? <= a.endTime)
                  or (a.startTime <= ? and ? <= a.endTime)
                  or (? <= a.startTime and ? >= a.endTime))`;
  const errorMsg = 'An error occurred on the server. Try again later.';
  const errorMsg2 = "SQLITE_CONSTRAINT: parent id or elder id does not exist.";
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all(secletSql, [elderId, startTime, startTime, endTime, endTime, startTime, endTime], (err, rs) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rs);
      });
    });
    if (rows.length !== 0) {
      return res.status(HTTP_BAD_REQUEST).send('the elder is not free at that time.');
    }
    const num = await new Promise((resolve, reject) => {
      db.run(sql, [parentId, elderId, startTime, endTime, address, filename], function(err) {
        if (err) {
          if (err.errno === UNIQUE_CONSTRAINT_ERROR) {
            reject(errorMsg2);
          } else {
            reject(err);
          }
        }
        const lastID = this.lastID;
        const num = generateConfirmationNumber();
        db.run(`update shelterOrder set confirmNum = ? where id = ?`, [num, lastID], (err) => {
          if (err) {
            reject(err);
          }

        });
        resolve(num);
      });
    });
    res.status(HTTP_OK).json({'result': num});

  } catch (err) {
    res.status(INTERNAL_ERROR).json({error: err});
  } finally {
    closedb(db);
  }
});

/**
 * Registers a new user in the system.
 * @param {Express.Request} req - The request object containing new user details.
 * @param {Express.Response} res - The response object used to send back HTTP responses.
 */
app.post('/api/register', (req, res) => {
  const {name, password, childName, age, email, address} = req.body;

  const db = opendb();
  const sql = `INSERT INTO users (name, password, child_name, age, email, address) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [name, password, childName, age, email, address], function(err) {
    if (err) {
      closedb(db);
      return res.status(INTERNAL_ERROR).send('Failed to register user');
    }
    closedb(db);
    res.status(HTTP_OK).send('User registered successfully');
  });
});

// Start the server
app.listen(PORT);
