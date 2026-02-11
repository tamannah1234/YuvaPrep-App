// db.js
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config(); // load .env file

// Create a connection pool (better than single connection)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // number of connections to keep open
  queueLimit: 0,       // unlimited queueing
});

// Test connection once on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL database");
    connection.release(); // release back to pool
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  }
})();

module.exports = pool;
