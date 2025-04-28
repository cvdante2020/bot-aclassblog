// src/controllers/chatbotController.js

const { obtenerRespuestaAleatoria, guardarInteraccion } = require('../utils/database');
const { enviarMensajeWhatsApp } = require('../utils/whatsappApi');
const { consultarChatGPT } = require('../utils/openai'); // <-- Importamos ChatGPT

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const CONSULTOR_WHATSAPP = '593xxxxxxxxx'; // <-- Tu número personal de asesor

// Validación del webhook para Meta
const validateWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook validado correctamente.');
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send('❌ Token de verificación inválido.');
    }
  }
  return res.status(400).send('❌ Bad Request.');
};

// Manejador de mensajes
const handleWebhook = async (req, res) => {
  try {
    const body = req.body;

    if (body.object) {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message) {
        const telefonoUsuario = message.from || 'desconocido';
        const userMessage = message.text?.body?.toUpperCase() || "";

        let respuestaBot = '';

        console.log(`📩 Mensaje recibido de ${telefonoUsuario}: ${userMessage}`);

        // Palabras amables (gracias, adiós, etc.)
        const despedidas = ['GRACIAS', 'OK', 'PERFECTO', 'ADIOS', 'CHAU'];
        if (despedidas.some(d => userMessage.includes(d))) {
          respuestaBot = `¡Gracias a ti! 😊 Si tienes más preguntas, estoy aquí para ayudarte. 🎓`;
          await guardarInteraccion(telefonoUsuario, userMessage, respuestaBot, 'despedida');
          await enviarMensajeWhatsApp(telefonoUsuario, respuestaBot);
          return res.sendStatus(200);
        }

        // Saludos iniciales
        const saludos = ['HOLA', 'BUENOS DÍAS', 'BUENAS TARDES', 'BUENAS NOCHES'];
        if (saludos.some(saludo => userMessage.includes(saludo))) {
          respuestaBot = `¡Hola! 👋 Soy **Chris**, tu asistente virtual en **Aclassblog**.  
En menos de 1 minuto obtendrás toda la información que necesitas. 🚀✨  
\n¿Deseas continuar conmigo o prefieres hablar directamente con un asesor humano?\n\n*Responde:*\n- "Continuar"\n- "Consultor"`;
          await guardarInteraccion(telefonoUsuario, userMessage, respuestaBot, 'saludo');
          await enviarMensajeWhatsApp(telefonoUsuario, respuestaBot);
          return res.sendStatus(200);
        }

        // Menú principal
        if (userMessage.includes('CONTINUAR')) {
          respuestaBot = `¡Excelente decisión! 🚀 Estos son nuestros servicios:\n\n
*1.* 🎯 Asesoría personalizada para ingreso a universidades en EE.UU.\n
*2.* 🇺🇸 Cursos de Inglés (niveles A1 a C2)\n
*3.* ➗ Cursos de Matemáticas (junior a avanzado)\n
*4.* 🧑‍💻 Hablar con un asesor humano\n\n
Responde con el número de la opción que deseas.`;
          await guardarInteraccion(telefonoUsuario, userMessage, respuestaBot, 'menu_principal');
          await enviarMensajeWhatsApp(telefonoUsuario, respuestaBot);
          return res.sendStatus(200);
        }

        // Ir directo al asesor
        if (userMessage.includes('CONSULTOR') || userMessage.includes('ASESOR') || userMessage.includes('HUMANO')) {
          respuestaBot = `¡Claro! 📞 Puedes hablar con un asesor humano aquí: [WhatsApp](https://wa.me/${CONSULTOR_WHATSAPP})`;
          await guardarInteraccion(telefonoUsuario, userMessage, respuestaBot, 'consultor');
          await enviarMensajeWhatsApp(telefonoUsuario, respuestaBot);
          return res.sendStatus(200);
        }

        // Opciones principales
        if (userMessage === '1') {
          const respuesta = await obtenerRespuestaAleatoria('asesoria', 'contexto');
          respuestaBot = respuesta ? respuesta + `\n\n¿Qué plan prefieres?\n\n*1A.* Desde 10mo a 3ro 🎓\n*1B.* Desde 1ro a 3ro 📚\n*1C.* Desde 2do a 3ro 🎯\n*1D.* Solo 3ro 🚀` : `Actualmente no tengo información disponible. 😅`;
          await guardarInteraccion(telefonoUsuario, userMessage, respuestaBot, 'asesoria');
          await enviarMensajeWhatsApp(telefonoUsuario, respuestaBot);
          return res.sendStatus(200);
        }

        if (userMessage === '2') {
          const respuesta = await obtenerRespuestaAleatoria('ingles', 'contexto');
          respuestaBot = respuesta ? respuesta + `\n\n¿Qué nivel deseas consultar?\n\n*A1*, *A2*, *B1*, *B2*, *C1*, *C2* 🇺🇸` : `Actualmente no tengo información disponible. 😅`;
          await guardarInteraccion(telefonoUsuario, userMessage, respuestaBot, 'ingles');
          await enviarMensajeWhatsApp(telefonoUsuario, respuestaBot);
          return res.sendStatus(200);
        }

        if (userMessage === '3') {
          const respuesta = await obtenerRespuestaAleatoria('matematicas', 'contexto');
          respuestaBot = respuesta ? respuesta + `\n\n¿Qué nivel deseas consultar?\n\n*JUNIOR*, *BASICO*, *INTERMEDIO*, *AVANZADO*, *AVANZADO2*, *AVANZADO3* ➗` : `Actualmente no tengo información disponible. 😅`;
          await guardarInteraccion(telefonoUsuario, userMessage, respuestaBot, 'matematicas');
          await enviarMensajeWhatsApp(telefonoUsuario, respuestaBot);
          return res.sendStatus(200);
        }

        // Subopciones de servicios
        const subopciones = {
          '1A': `🎓 Asesoría desde 10mo a 3ro: 3.999 USD. Acompañamiento completo hasta aplicación.`,
          '1B': `📚 Asesoría desde 1ro a 3ro: 2.999 USD. Plan intermedio.`,
          '1C': `🎯 Asesoría desde 2do a 3ro: 2.499 USD. Plan acelerado.`,
          '1D': `🚀 Solo 3ro de Bachillerato: 1.499 USD. Aplicación express.`,
          'A1': `🇺🇸 Curso de Inglés A1: Principiante básico, 3 meses, 45 USD.`,
          'A2': `🇺🇸 Curso de Inglés A2: Principiante alto, 3 meses, 45 USD.`,
          'B1': `🇺🇸 Curso de Inglés B1: Intermedio bajo, 3 meses, 45 USD.`,
          'B2': `🇺🇸 Curso de Inglés B2: Intermedio alto, 3 meses, 45 USD.`,
          'C1': `🇺🇸 Curso de Inglés C1: Avanzado, 3 meses, 45 USD.`,
          'C2': `🇺🇸 Curso de Inglés C2: Dominio total, 3 meses, 45 USD.`,
          'JUNIOR': `➗ Matemáticas Junior: Para 3ro a 7mo básica, 3 meses, 40 USD.`,
          'BASICO': `➗ Matemáticas Básico: Para 8vo a 10mo básica, 3 meses, 40 USD.`,
          'INTERMEDIO': `➗ Matemáticas Intermedio: 1ro y 2do Bachillerato, 3 meses, 40 USD.`,
          'AVANZADO': `➗ Matemáticas Avanzado: 3ro Bachillerato, 3 meses, 40 USD.`,
          'AVANZADO2': `➗ Matemáticas Avanzado 2: Pre-cálculo, 3 meses, 40 USD.`,
          'AVANZADO3': `➗ Matemáticas Avanzado 3: Cálculo universitario, 3 meses, 40 USD.`
        };

        if (subopciones[userMessage]) {
          respuestaBot = subopciones[userMessage];
          await guardarInteraccion(telefonoUsuario, userMessage, respuestaBot, 'submenu');
          await enviarMensajeWhatsApp(telefonoUsuario, respuestaBot);
          return res.sendStatus(200);
        }

        // 🚀 Si no entendimos ➔ usamos ChatGPT
        const respuestaGPT = await consultarChatGPT(userMessage);

        respuestaBot = respuestaGPT;

        await guardarInteraccion(telefonoUsuario, userMessage, respuestaBot, 'respuesta_chatgpt');
        await enviarMensajeWhatsApp(telefonoUsuario, respuestaBot);
        return res.sendStatus(200);
      }
    }

    return res.sendStatus(200); // Siempre devolver 200 OK
  } catch (error) {
    console.error('❌ Error en handleWebhook:', error);
    return res.sendStatus(500);
  }
};

module.exports = { validateWebhook, handleWebhook };
