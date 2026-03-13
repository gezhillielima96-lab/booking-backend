const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


pool.getConnection((err, connection) => {
    if (err) {
        console.error('Gabim gjatë lidhjes me DB:', err.message);
    } else {
        console.log('U lidh me databazën MySQL me sukses!');
        connection.release(); 
    }
});

module.exports = pool.promise();