const db = require('../config/db'); 

// 1. MARRJA E TË GJITHA PRONAVE (ME FOTO)
exports.getProperties = async (req, res) => {
    try {
        const sql = `
            SELECT p.*, m.file_path as foto 
            FROM properties p 
            LEFT JOIN media m ON p.id = m.model_id AND m.model_type = 'property'
            GROUP BY p.id
        `;
        const [rows] = await db.execute(sql);
        res.json(rows);
    } catch (error) {
        console.error("Error te getProperties:", error);
        res.status(500).json({ message: "Gabim gjatë marrjes së pronave" });
    }
};

// 2. SHTIMI I PRONËS (ME FOTO)
exports.addProperty = async (req, res) => {
    try {
        const { emri_prones, pershkrimi, lokacioni, kategoria, cmimi } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        if (!emri_prones || !lokacioni) {
            return res.status(400).json({ message: "Emri dhe Lokacioni janë të detyrueshme!" });
        }

        const [result] = await db.execute(
            'INSERT INTO properties (emri_prones, pershkrimi, lokacioni, kategoria, cmimi) VALUES (?, ?, ?, ?, ?)',
            [emri_prones, pershkrimi || '', lokacioni, kategoria || 1, cmimi || 0]
        );

        const propertyId = result.insertId;

        if (imagePath) {
            await db.execute(
                'INSERT INTO media (model_type, model_id, file_path) VALUES (?, ?, ?)',
                ['property', propertyId, imagePath]
            );
        }

        res.status(201).json({ message: "Prona u shtua me sukses!" });
    } catch (error) {
        console.error("Error te addProperty:", error);
        res.status(500).json({ message: "Gabim i brendshëm i serverit" });
    }
};

// 3. DETAJET E PRONËS DHE DHOMAT
exports.getPropertyDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Merr detajet e hotelit
        const [property] = await db.execute('SELECT * FROM properties WHERE id = ?', [id]);

        // 2. Merr dhomat (Me GROUP_CONCAT dhe GROUP BY)
        const [rooms] = await db.execute(`
            SELECT r.*, GROUP_CONCAT(m.file_path) as fotot 
            FROM rooms r 
            LEFT JOIN media m ON r.id = m.model_id AND m.model_type = 'room'
            WHERE r.property_id = ?
            GROUP BY r.id  -- KJO NDALON DUPLIKATET
        `, [id]);

        res.json({ property: property[0], rooms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Gabim i brendshëm" });
    }
};
// 4. NDRYSHIMI I PRONËS (FIXED UPDATE)
exports.updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const { emri_prones, lokacioni, pershkrimi, kategoria, cmimi } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        // Update të dhënat bazë
        const sqlUpdate = `UPDATE properties SET emri_prones = ?, lokacioni = ?, pershkrimi = ?, kategoria = ?, cmimi = ? WHERE id = ?`;
        await db.execute(sqlUpdate, [
            emri_prones || '', 
            lokacioni || '', 
            pershkrimi || '', 
            kategoria || 1, 
            cmimi || 0, 
            id
        ]);

        // Menaxhimi i fotos së re
        if (imagePath) {
            const [existing] = await db.execute(
                'SELECT id FROM media WHERE model_type = "property" AND model_id = ?', 
                [id]
            );

            if (existing.length > 0) {
                await db.execute(
                    'UPDATE media SET file_path = ? WHERE model_type = "property" AND model_id = ?', 
                    [imagePath, id]
                );
            } else {
                await db.execute(
                    'INSERT INTO media (model_type, model_id, file_path) VALUES (?, ?, ?)', 
                    ['property', id, imagePath]
                );
            }
        }
        
        res.json({ message: "Prona u përditësua me sukses!" });
    } catch (error) {
        console.error("GABIMI TE UPDATE:", error);
        res.status(500).json({ message: "Gabim gjatë modifikimit" });
    }
};

// 5. FSHIRJA E PRONËS
exports.deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fshijmë median e pronës
        await db.execute('DELETE FROM media WHERE model_type = "property" AND model_id = ?', [id]);
        
        // 2. Fshijmë dhomat e kësaj prone (dhe median e tyre)
        const [rooms] = await db.execute('SELECT id FROM rooms WHERE property_id = ?', [id]);
        for (let room of rooms) {
            await db.execute('DELETE FROM media WHERE model_type = "room" AND model_id = ?', [room.id]);
        }
        await db.execute('DELETE FROM rooms WHERE property_id = ?', [id]);

        // 3. Fshijmë pronën
        await db.execute('DELETE FROM properties WHERE id = ?', [id]);

        res.json({ message: "Prona dhe të gjitha të dhënat e saj u fshinë!" });
    } catch (error) {
        console.error("Error te deleteProperty:", error);
        res.status(500).json({ message: "Gabim gjatë fshirjes" });
    }
};