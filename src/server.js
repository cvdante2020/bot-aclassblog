// src/server.js

require('dotenv').config();
const fs = require('fs');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const webhookRoute = require('./routes/webhook');

// Leer certificados
const privateKey = fs.readFileSync('certs/privkey.pem', 'utf8');
const certificate = fs.readFileSync('certs/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Crear app Express
const app = express();
const PORT = process.env.PORT || 443;

// Middleware
app.use(bodyParser.json());

// Rutas
app.use('/webhook', webhookRoute);

// Servidor HTTPS
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(PORT, () => {
  console.log(`✅ Servidor HTTPS corriendo en el puerto ${PORT}`);
});
