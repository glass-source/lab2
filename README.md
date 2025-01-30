# Thryve Bootcamp - Lab 2

## Descripción
Este proyecto es parte del Thryve Bootcamp y corresponde al laboratorio 2.

## Instalación
1. Clona el repositorio:
    ```bash
    git clone https://github.com/glass-source/lab2.git
    ```
2. Navega al directorio del proyecto:
    ```bash
    cd ThryveBootcamp/lab2
    ```
3. Instala las dependencias y genera los certificados:
    ```bash
    npm install
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt
    ```
4. Configura las variables de entorno
    ```
    MONGO_URI=mongodb://localhost:27017
    JWT_SECRET=supersecretkey
    ```
5. Ejecuta el proyecto con el comando
    ```bash
    node server.js
    ```

##Erores y mejoras realizadas

### 1. Puerto para el servidor HTTPS

El puerto 443 es el puerto por defecto para HTTPS, pero puertos con valores 1000 < requieren de permisos especiales, por lo que es recomendable usar puertos como 3000 o 8080 en casos como este.

### 2. Advertencias deprecadas en MongoDB

```bash
(node:18784) [MONGODB DRIVER] Warning: useNewUrlParser is a deprecated option: useNewUrlParser has no effect since Node.js Driver version 4.0.0 and will be removed in the next major version
```

En las versiones modernas de Mongoose, `useNewUrlParser` y `useUnifiedTopology` fueron deprecadas y seran eliminadas, por lo que se nos advierte que hay que eliminar su uso.

```js
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ Conectado a MongoDB"))
.catch((err) => console.error("❌ Error de conexión:", err));
```
### 3. Error al crear usuarios duplicados

Al intentar crear un usuario con un nombre en uso se genera un error

```bash
E11000 duplicate key error collection: test.users index: username_1 dup key: { username: \"testuser123\" }
```

Lo solucionamos verificando que el usuario no este registrado
```js
    const user = await User.findOne({ username: req.body.username });
    if (user) return res.status(409).json({ message: "Ese nombre de usuario ya esta en uso." });
```
### 4. Sanitar el inicio de sesion

Al iniciar sesion, se le indicaba al usuario cuando el usuario o contraseña fuesen incorrectos de manera individual

```js
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Contraseña incorrecta" });
```
Esto es una falla de seguridad que puede ser usada para forzar el inicio de sesion, por lo que lo corregimos cambiando el mensaje:

```js
    const user = await User.findOne({ username: req.body.username });
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch || !user) return res.status(400).json({ message: "Contraseña o Usuario incorrectos." });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({token});
```



