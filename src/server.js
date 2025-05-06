require('dotenv').config();
const fs = require('fs');
const https = require('https');
const express = require('express');
const webhookRoute = require('./routes/webhook');

const PORT = process.env.PORT || 443;
const app = express();

app.use(express.json());
app.use('/webhook', webhookRoute);

const credentials = {
  key: fs.readFileSync('./certs/privkey.pem', 'utf8'),
  cert: fs.readFileSync('./certs/fullchain.pem', 'utf8'),
};

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
  console.log(`✅ Servidor HTTPS corriendo en el puerto ${PORT}`);
});
