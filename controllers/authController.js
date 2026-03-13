const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.register = async (req, res) => {
    try {
        const { emri, mbiemri, email, password, adminCode } = req.body;
        
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Ky email është i regjistruar!" });
        }

        const roleValue = (adminCode === 'ADMIN123') ? 'admin' : 'user';
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            emri,
            mbiemri,
            email,
            password: hashedPassword,
            role: roleValue
        });

        res.status(201).json({ message: "U regjistruat me sukses!" });
    } catch (error) {
        console.error("GABIM REGJISTRIMI:", error);
        res.status(500).json({ message: "Gabim gjatë regjistrimit" });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(400).json({ message: "Email ose fjalëkalim i gabuar!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email ose fjalëkalim i gabuar!" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.roli }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { 
                id: user.id, 
                emri: user.emri, 
                email: user.email, 
                role: user.roli 
            }
        });
    } catch (error) {
        console.error("GABIM LOGIN:", error);
        res.status(500).json({ message: "Gabim i serverit" });
    }
};

exports.getProfile = async (req, res) => {
    try {
       
        const userId = req.query.id || req.body.id; 
        
        console.log("Duke kërkuar profilin për ID:", userId);

        if (!userId) {
            return res.status(400).json({ message: "ID mungon! React duhet të dërgojë ?id=NUMRI" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Përdoruesi nuk u gjet në databazë" });
        }

      
        const { password, ...userData } = user;
        res.json(userData);
    } catch (error) {
        console.error("GABIM GET PROFILE:", error);
        res.status(500).json({ message: "Gabim gjatë ngarkimit të profilit" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { id, emri, mbiemri, data_lindjes, nr_tel } = req.body;

        if (!id) {
            return res.status(400).json({ message: "ID mungon! Nuk mund të bëjmë update." });
        }

        await User.updateById(id, { emri, mbiemri, data_lindjes, nr_tel });

        res.json({ message: "Profili u përditësua me sukses!" });
    } catch (error) {
        console.error("GABIM UPDATE PROFILE:", error);
        res.status(500).json({ message: "Gabim gjatë përditësimit" });
    }
};