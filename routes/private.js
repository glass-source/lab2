const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", authMiddleware, (req, res) => {
    res.json({ message: "Bienvenido al dashboard privado", user: req.user });
});

module.exports = router;
