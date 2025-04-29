require('dotenv').config();
const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();

// Middleware para leer JSON
app.use(express.json());

// Importar rutas
const webhookRoutes = require('./routes/webhook');

// Usar las rutas
app.use('/webhook', webhookRoutes);

// Cargar los certificados SSL
const privateKey = fs.readFileSync('/etc/letsencrypt/live/gptrobotic.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/gptrobotic.com/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Crear el servidor HTTPS
const httpsServer = https.createServer(credentials, app);

// Escuchar en el puerto 443 (HTTPS)
httpsServer.listen(443, () => {
  console.log('🚀 Servidor de Aclassblog corriendo en HTTPS por el puerto 443');
});
