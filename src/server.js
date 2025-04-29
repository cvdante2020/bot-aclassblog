const https = require('https');
const fs = require('fs');
const app = require('./app'); // O tu instancia de Express

const httpsOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/gptrobotic.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/gptrobotic.com/fullchain.pem')
};

const PORT = process.env.PORT || 443;

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Servidor de Aclassblog corriendo en HTTPS por el puerto ${PORT}`);
});
