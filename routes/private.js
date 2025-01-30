const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", authMiddleware, (req, res) => {
    res.status(200).json({ message: "Bienvenido al dashboard privado", user: req.user });
});

module.exports = router;
