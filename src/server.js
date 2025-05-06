require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const app = express();

// Middleware para leer JSON
app.use(express.json());

// Importar rutas
const webhookRoutes = require('./routes/webhook');
app.use('/webhook', webhookRoutes);

// ✅ Rutas locales para certificados (carpeta certs)
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '../certs/privkey.pem'), 'utf8'),
  cert: fs.readFileSync(path.join(__dirname, '../certs/fullchain.pem'), 'utf8')
};

// Puerto HTTPS
const PORT = process.env.PORT || 443;

// Crear servidor HTTPS
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`🚀 Servidor de Aclassblog corriendo en HTTPS por el puerto ${PORT}`);
});
