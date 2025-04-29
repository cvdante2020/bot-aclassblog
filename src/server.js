require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();

// Middleware para leer JSON
app.use(express.json());

// Importar rutas
const webhookRoutes = require('./routes/webhook');

// Usar las rutas
app.use('/webhook', webhookRoutes);

// Opciones SSL
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/gptrobotic.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/gptrobotic.com/fullchain.pem'),
};

// Crear servidor HTTPS
https.createServer(options, app).listen(443, () => {
  console.log('🚀 Servidor de Aclassblog corriendo en HTTPS por el puerto 443');
});
