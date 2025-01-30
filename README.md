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

## Uso
Para ejecutar el proyecto, utiliza el siguiente comando:
```bash
node server.js
```