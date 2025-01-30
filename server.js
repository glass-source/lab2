const express = require("express");
const https = require("https");
const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const path = require('path');
const authRoutes = require("./routes/auth");
const privateRoutes = require("./routes/private");
const port = 3000;

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware de seguridad
app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", `https://localhost:${port}`],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Solo para desarrollo
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"]
      }
    })
  );


  app.use(cors({
    origin: `https://localhost:${port}`,
    credentials: true
  }));

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/private", privateRoutes);

// Configurar HTTPS
const httpsOptions = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.crt"),
    passphrase: process.env.SSL_PASSPHRASE // Opcional, si usas frase de contraseña
};

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ Conectado a MongoDB"))
.catch((err) => console.error("❌ Error de conexión:", err));

app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Crear servidor HTTPS
const server = https.createServer(httpsOptions, app);

// Iniciar servidor
server.listen(port, () => {
    console.log(`Servidor HTTPS corriendo en https://localhost:${port}`);
});