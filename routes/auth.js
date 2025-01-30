const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Registro de usuario
router.post("/register", async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (user) return res.status(400).json({ message: "Ese nombre de usuario ya esta en uso." });

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: "Usuario registrado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inicio de sesión
router.post("/login", async (req, res) => {
    try {
        //Dejar saber al usuario tanto que el nombre y/o contraseña son incorrectas es de manera individual
        //Es una mala práctica de seguridad
        //Por lo que solo se le dejara saber solo una vez que los datos son incorrectos.
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(400).json({ message: "Contraseña o Usuario incorrectos." });

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Contraseña o Usuario incorrectos." });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({token});

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
