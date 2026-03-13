const db = require('../config/db');
const BookingModel = require('../models/bookingModel');

exports.processBooking = async (req, res) => {
    const { user_id, room_id, data_hyrjes, data_daljes, totali_pageses, metoda_pageses } = req.body;
    
    const conn = await db.getConnection();
    try {
        const checkSql = `
            SELECT id FROM bookings 
            WHERE room_id = ? 
            AND (
                (data_hyrjes < ? AND data_daljes > ?)
            )
        `;
        
        
        const [existing] = await conn.execute(checkSql, [room_id, data_daljes, data_hyrjes]);

        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Kjo dhomë është rezervuar tashmë për këto data! Ju lutem zgjidhni data të tjera." 
            });
        }

        
        await conn.beginTransaction();

        const bStatus = metoda_pageses === 'card' ? 'i konfirmuar' : 'në pritje';
        
        const [bRes] = await conn.execute(
            `INSERT INTO bookings (user_id, room_id, data_hyrjes, data_daljes, totali_pageses, statusi) VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, room_id, data_hyrjes, data_daljes, totali_pageses, bStatus]
        );
        const bookingId = bRes.insertId;

      
        const pStatus = metoda_pageses === 'card' ? 'success' : 'pending';
        
        await conn.execute(
            `INSERT INTO payments (booking_id, shuma, metoda_pageses, statusi, payment_date) VALUES (?, ?, ?, ?, NOW())`,
            [bookingId, totali_pageses, metoda_pageses, pStatus]
        );

        await conn.commit();
        res.status(201).json({ success: true, message: "Rezervimi u krye!" });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, error: err.message });
    } finally {
        conn.release();
    }
};

exports.getAdminData = async (req, res) => {
    try {
        const data = await BookingModel.getAdminDashboard();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const data = await BookingModel.getUserHistory(req.params.userId);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params; 

        const sql = 'DELETE FROM bookings WHERE id = ?'; 
        
        await db.execute(sql, [id]);
        
        res.json({ success: true, message: "Rezervimi u fshi me sukses!" });
    } catch (error) {
        console.error("Error te deleteBooking:", error);
        res.status(500).json({ message: "Gabim gjatë fshirjes" });
    }
};
exports.getRoomBookings = async (req, res) => {
    try {
        const { roomId } = req.params;
        const [rows] = await db.execute(
            'SELECT data_hyrjes, data_daljes FROM bookings WHERE room_id = ?', 
            [roomId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};