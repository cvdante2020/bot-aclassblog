const fs = require('fs');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const webhookRoute = require('../routes/webhook');

const app = express();
app.use(bodyParser.json());

// Rutas
app.use('/webhook', webhookRoute);

// Certificados SSL
const privateKey = fs.readFileSync('./certs/privkey.pem', 'utf8');
const certificate = fs.readFileSync('./certs/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Servidor HTTPS
const httpsServer = https.createServer(credentials, app);

// Puerto
const PORT = process.env.PORT || 443;

httpsServer.listen(PORT, () => {
  console.log(`🚀 Servidor HTTPS corriendo en el puerto ${PORT}`);
});
