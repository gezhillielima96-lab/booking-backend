const db = require('../config/db'); // Sigurohu që rruga te db është e saktë

// 1. Shto Review
exports.addReview = async (req, res) => {
    try {
        const { user_id, property_id, room_id, nota, komenti } = req.body;
        
        // Ky rresht do te te tregoje te terminali i zi nese room_id po vjen apo jo
        console.log("Te dhenat qe erdhen ne Backend:", req.body);

        // Sigurohu qe jane 5 kolona dhe 5 pikepyetje
        const sql = `INSERT INTO reviews (user_id, property_id, room_id, nota, komenti) VALUES (?, ?, ?, ?, ?)`;
        
        const [result] = await db.execute(sql, [
            user_id, 
            property_id, 
            room_id || null, // Nese nuk vjen room_id, vendoset NULL qe te mos jape error
            nota, 
            komenti
        ]);

        res.status(201).json({ message: "Vlerësimi u shtua me sukses!" });
    } catch (err) {
        console.error("GABIM NE DATABASE:", err);
        res.status(400).json({ error: err.message });
    }
};
// 2. Merr statistikat dhe komentet për një hotel
exports.getPropertyStats = async (req, res) => {
    try {
        const { propertyId } = req.params;
        
        // Merr mesataren
        const [stats] = await db.execute(
            `SELECT AVG(nota) as mesatarja, COUNT(*) as totali FROM reviews WHERE property_id = ?`, 
            [propertyId]
        );

        // Merr listën e komenteve bashkë me emrin e përdoruesit
        const [reviews] = await db.execute(
            `SELECT r.*, u.emri, u.mbiemri FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.property_id = ? ORDER BY r.created_at DESC`, 
            [propertyId]
        );

        res.json({ stats: stats[0], reviews: reviews });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getReviewsByProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const [rows] = await db.execute('SELECT * FROM reviews WHERE property_id = ?', [propertyId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};