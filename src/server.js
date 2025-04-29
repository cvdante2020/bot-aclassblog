require('dotenv').config();
const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();

// Middleware para leer JSON
app.use(express.json());

// Importar rutas
const webhookRoutes = require('./routes/webhook');
app.use('/webhook', webhookRoutes);

// ⚡⚡ CERTIFICADOS DE LET'S ENCRYPT ⚡⚡
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/gptrobotic.com/privkey.pem', 'utf8'),
  cert: fs.readFileSync('/etc/letsencrypt/live/gptrobotic.com/fullchain.pem', 'utf8')
};


// Puerto HTTPS
const PORT = process.env.PORT || 443;

// Crear servidor HTTPS
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`🚀 Servidor de Aclassblog corriendo en HTTPS por el puerto ${PORT}`);
});
