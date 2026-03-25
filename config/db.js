const mysql = require('mysql2');
require('dotenv').config(); // Kjo rresht duhet patjetër lart

const pool = mysql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,          
    password: process.env.DB_PASS,    
    database: process.env.DB_NAME,        
    port: process.env.DB_PORT || 4000,                   
    ssl: {
        rejectUnauthorized: true  
    }
});

module.exports = pool.promise();