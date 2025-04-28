// src/routes/webhook.js

const express = require('express');
const router = express.Router();
const { validateWebhook, handleWebhook } = require('../controllers/chatbotController');

// Ruta GET para validación con Meta
router.get('/', validateWebhook);

// Ruta POST para mensajes
router.post('/', handleWebhook);

module.exports = router;
