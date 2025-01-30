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

//El puerto 443 es el puerto por defecto para HTTPS, pero puertos con valores 1000 < requieren de permisos especiales, por lo que
//para desarrollo es mas comun usar puertos altos como 3000 o 8080 para evitar problemas.
const port = 3000;

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware de seguridad con Helmet y Cors, se debe configurar la directiva de Content Security Policy para permitir
//la conexion a la API mientras se este en desarrollo.
app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", `https://localhost:${port}`],
        scriptSrc: ["'self'", "'unsafe-inline'"],
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

// Configurar HTTPS
const httpsOptions = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.crt")
};

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ Conectado a MongoDB"))
.catch((err) => console.error("❌ Error de conexión:", err));


//Configurar la carpeta publica para el frontend y servir archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

//Se añaden las rutas a la aplicacion y se sirve el frontend.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.use("/auth", authRoutes);
app.use("/private", privateRoutes);

// Crear servidor HTTPS
const server = https.createServer(httpsOptions, app);

// Iniciar servidor
server.listen(port, () => {
    console.log(`Servidor HTTPS corriendo en https://localhost:${port}`);
});