const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Thirrja e databazës (VETËM NJË HERË)
const db = require('./config/db'); 

const app = express();
app.use(cors());
app.use(express.json());

// Servimi i fotove
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Linjat e API-së
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// --- TESTI I LIDHJES ME TIDB ---
db.query('SELECT 1')
    .then(() => console.log("✅ LIDHJA ME TIDB ONLINE U KRYE ME SUKSES! "))
    .catch(err => console.log("❌ GABIM NE LIDHJEN ME TIDB:", err));
// ------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveri po punon në portin ${PORT}`);
    console.log(`Testo këtu: http://localhost:${PORT}/api/all`);
});