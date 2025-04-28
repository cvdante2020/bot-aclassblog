// src/utils/whatsappApi.js

const axios = require('axios');

// Leer variables de entorno
const WHATSAPP_NUMBER_ID = process.env.WHATSAPP_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * Función para enviar mensajes de WhatsApp usando Meta API
 * @param {string} telefono - Número del usuario (ej: 593999123456)
 * @param {string} mensaje - Mensaje que quieres enviar
 */
const enviarMensajeWhatsApp = async (telefono, mensaje) => {
  try {
    const url = `https://graph.facebook.com/v18.0/${WHATSAPP_NUMBER_ID}/messages`;

    const headers = {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    };

    const body = {
      messaging_product: 'whatsapp',
      to: telefono,
      type: 'text',
      text: {
        body: mensaje
      }
    };

    const response = await axios.post(url, body, { headers });
    console.log('✅ Mensaje enviado a WhatsApp:', response.data);
  } catch (error) {
    console.error('❌ Error enviando mensaje a WhatsApp:', error.response?.data || error.message);
  }
};

module.exports = { enviarMensajeWhatsApp };
