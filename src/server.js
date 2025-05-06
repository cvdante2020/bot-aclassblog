require('dotenv').config();
const fs = require('fs');
const https = require('https');
const express = require('express');
const webhookRoute = require('./routes/webhook');

const app = express();
app.use(express.json());
app.use('/webhook', webhookRoute);

const PORT = process.env.PORT || 443;

const options = {
  key: fs.readFileSync('certs/privkey.pem'),
  cert: fs.readFileSync('certs/fullchain.pem'),
};

const httpsServer = https.createServer(options, app);

httpsServer.listen(PORT, () => {
  console.log(`✨ Servidor HTTPS corriendo en el puerto ${PORT}`);
});