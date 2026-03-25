const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',     
    user: '4hdF44ve6Gs6wEe.root',          
    password: 'mpkGypkTOf3xPVzM',    
    database: 'test',        
    port: 4000,                   
    ssl: {
        rejectUnauthorized: true  
    }
});

module.exports = pool.promise();