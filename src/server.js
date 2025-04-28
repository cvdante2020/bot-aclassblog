require('dotenv').config();
const express = require('express');
const app = express();

// Middleware para leer JSON
app.use(express.json());

// Importar rutas
const webhookRoutes = require('./routes/webhook');

// Usar las rutas
app.use('/webhook', webhookRoutes);

// Puerto
const PORT = process.env.PORT || 3000;

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Aclassblog corriendo en el puerto ${PORT}`);
});
