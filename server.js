const express = require('express');
const cors = require('cors');
const path = require('path');


// Thirrja e databazës
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
    .then(() => console.log("✅ LIDHJA ME TIDB ONLINE U KRYE ME SUKSES!"))
    .catch(err => console.log("❌ GABIM NE LIDHJEN ME TIDB:", err));

// --- KONFIGURIMI PER RENDER (SHUME I RENDESISHEM) ---
const PORT = process.env.PORT || 10000; 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveri është LIVE në portin ${PORT}`);
});

// Test final per Git 2026