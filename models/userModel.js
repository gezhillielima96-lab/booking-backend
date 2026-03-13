const db = require('../config/db');

const User = {
    // Për Login dhe kontrollin e email-it
    findByEmail: async (email) => {
        // Kujdes: Sigurohu që në MySQL kolona quhet 'password' (ose 'fjalkalimi')
        // Nëse Controlleri yt kërkon user.password, po e marrim si 'password'
        const [rows] = await db.execute('SELECT id, emri, mbiemri, email, password, roli FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    // Për Register
    create: async (data) => {
        const { emri, mbiemri, email, password, role } = data;
        const sql = `INSERT INTO users (emri, mbiemri, email, password, roli) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.execute(sql, [emri, mbiemri, email, password, role]);
        return result;
    },

    // Për Profile
    findById: async (id) => {
        const [rows] = await db.execute('SELECT id, emri, mbiemri, email, roli FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    // Për Update Profile
    updateById: async (id, data) => {
        const { emri, mbiemri, data_lindjes, nr_tel } = data;
        const sql = `UPDATE users SET emri = ?, mbiemri = ?, data_lindjes = ?, nr_tel = ? WHERE id = ?`;
        return await db.execute(sql, [emri, mbiemri, data_lindjes, nr_tel, id]);
    }
};

module.exports = User;