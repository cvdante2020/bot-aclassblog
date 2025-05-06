
//const axios = require('axios');

const WHATSAPP_NUMBER_ID = process.env.WHATSAPP_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const CONSULTOR_WHATSAPP = '593998260550';

// Enviar mensaje simple de texto
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
      text: { body: mensaje }
    };

    await axios.post(url, body, { headers });
  } catch (error) {
    console.error('❌ Error enviando mensaje a WhatsApp:', error.response?.data || error.message);
  }
};

// Menú principal interactivo
async function enviarMenuPrincipal(telefono) {
  const axios = require('axios');
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_NUMBER_ID}/messages`;
  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };

  const body = {
    messaging_product: 'whatsapp',
    to: telefono,
    type: 'interactive',
    interactive: {
      type: 'list',
      header: { type: 'text', text: 'Aclassblog - Servicios' },
      body: { text: 'Selecciona una opción para continuar:' },
      action: {
        button: 'Ver opciones',
        sections: [
          {
            title: 'Servicios Aclassblog',
            rows: [
              {
                id: 'op_1',
                title: '🎯 Asesoría universidades',
                description: 'Guía completa para aplicar a universidades en EE.UU.'
              },
              {
                id: 'op_2',
                title: '🚀 Cursos Ingles',
                description: 'Desde en nivel A1 hasta el nivel C2'
              },
              {
                id: 'op_3',
                title: '📙 Cursos Matemáticas',
                description: 'Preparamos desde un nivel Básico hasta Calculo I y II'
              },
              {
                id: 'op_4',
                title: '➗ Olimpiadas Matemáticas',
                description: 'Quieres ser un crack aqui tienes la oportunidad'
              }

            ]
          }
        ]
      }
    }
  };

  try {
    await axios.post(url, body, { headers });
    console.log('✅ Menú principal enviado');
  } catch (err) {
    console.error('❌ Error al enviar menú interactivo:', err.response?.data || err.message);
  }
}

// Menú específico para asesoría
async function enviarMenuAsesoriaUniversitaria(telefono) {
  const axios = require('axios');
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_NUMBER_ID}/messages`;
  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };

  const body = {
    messaging_product: 'whatsapp',
    to: telefono,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: 'Selecciona un plan de asesoría:' },
      action: {
        button: 'Ver planes',
        sections: [
          {
            title: 'Planes disponibles',
            rows: [
              { id: '1A', title: '📘 Plan A: 10mo de EGB', description: 'Acompañamiento completo con TOEFL, SAT.' },
              { id: '1B', title: '📗 Plan B: 1ro de BGU', description: 'Asesoría con simulaciones y ensayos' },
              { id: '1C', title: '📙 Plan C: 2do de BGU', description: 'Preparación acelerada y personalizada' },
              { id: '1D', title: '📕 Plan D: 3ro de BGU', description: 'Aplicación final y preparación express' }
            ]
          }
        ]
      }
    }
  };

  try {
    await axios.post(url, body, { headers });
    console.log('✅ Menú de asesoría enviado');
  } catch (err) {
    console.error('❌ Error al enviar menú asesoría:', err.response?.data || err.message);
  }
}


// Menú específico para Ingles
async function enviarMenuAsesoriaIngles(telefono) {
  const axios = require('axios');
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_NUMBER_ID}/messages`;
  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };

  const body = {
    messaging_product: 'whatsapp',
    to: telefono,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: 'Selecciona un nivel:' },
      action: {
        button: 'Ver planes',
        sections: [
          {
            title: 'Niveles disponibles',
            rows: [
              { id: 'A1', title: '📘 Nivel A1', description: 'Saludos, datos personales, vocabulario y gramática inicial' },
              { id: 'A2', title: '📗 Nivel A2', description: 'Rutinas, pasado simple y descripciones cotidianas' },
                { id: 'B1', title: '📙 Nivel B1', description: 'Comunicación sobre experiencias, planes y opiniones' },
                { id: 'B2', title: '📕 Nivel B2', description: 'Expresión fluida con opiniones, textos formales y estructuras complejas' },
                { id: 'C1', title: '📕 Nivel C1', description: 'Precisión, fluidez, textos complejos y lenguaje académico.' },
                { id: 'C2', title: '📕 Nivel C2', description: 'Dominio total del inglés y expresión en cualquier contexto.' }
            ]
          }
        ]
      }
    }
  };

  try {
    await axios.post(url, body, { headers });
    console.log('✅ Menú de asesoría enviado');
  } catch (err) {
    console.error('❌ Error al enviar menú asesoría:', err.response?.data || err.message);
  }
}
// Opciones al final de cada respuesta
const axios = require('axios');

const enviarOpcionesFinales = async (telefono) => {
  const url = `https://graph.facebook.com/v18.0/${WHATSAPP_NUMBER_ID}/messages`;
  const headers = {
    Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };

  const body = {
    messaging_product: "whatsapp",
    to: telefono,
    type: "interactive",
    interactive: {
      type: "list",
      header: {
        type: "text",
        text: "¿Deseas continuar?"
      },
      body: {
        text: "Selecciona una opción:"
      },
      footer: {
        text: "Aclassblog"
      },
      action: {
        button: "Ver opciones",
        sections: [
          {
            title: "Opciones",
            rows: [
              {
                id: "ir_asesor",
                title: "👨‍🏫 Hablar con asesor",
                description: "Conéctate con un asesor humano"
              },
              {
                id: "ir_menu",
                title: "🔙 Volver al menú",
                description: "Regresa al menú inicial"
              }
            ]
          }
        ]
      }
    }
  };

  try {
    await axios.post(url, body, { headers });
    console.log("✅ Opciones finales enviadas");
  } catch (error) {
    console.error("❌ Error al enviar opciones finales:", error.response?.data || error.message);
  }
};

async function enviarMenuAsesoriaMatematica(telefono) {
  const axios = require('axios');
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_NUMBER_ID}/messages`;
  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };

  const body = {
    messaging_product: 'whatsapp',
    to: telefono,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: 'Selecciona un nivel:' },
      action: {
        button: 'Ver planes',
        sections: [
          {
            title: 'Niveles disponibles',
            rows: [
              { id: 'EGB', title: '🎯 EGB', description: 'Educación General Básica' },
              { id: 'BGU', title: '🎯 BGU', description: 'Bachilleratos' },
              { id: 'Cálculo', title: '🎯 Cálculo', description: 'Niveles Superiores' }
            ]
          }
        ]
      }
    }
  };

  try {
    await axios.post(url, body, { headers });
    console.log('✅ Menú de asesoría enviado');
  } catch (err) {
    console.error('❌ Error al enviar menú asesoría:', err.response?.data || err.message);
  }
}


async function enviarMenuAsesoriaOMatematica(telefono) {
  const axios = require('axios');
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_NUMBER_ID}/messages`;
  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };

  const body = {
    messaging_product: 'whatsapp',
    to: telefono,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: 'Selecciona un nivel:' },
      action: {
        button: 'Ver planes',
        sections: [
          {
            title: 'Niveles disponibles',
            rows: [
              { id: 'Básico', title: '➗ Básico', description: 'Educacion Basica' },
              { id: 'Intermedio', title: '➗ Intermedio', description: 'Estudiante de Bachillerato 1ro y 2do' },
              { id: 'Avanzado', title: '➗ Avanzado', description: 'Estudiantes de 3ro y Preuniversitario' }
            ]
          }
        ]
      }
    }
  };

  try {
    await axios.post(url, body, { headers });
    console.log('✅ Menú de asesoría enviado');
  } catch (err) {
    console.error('❌ Error al enviar menú asesoría:', err.response?.data || err.message);
  }
}

module.exports = {
  enviarMensajeWhatsApp,
  enviarMenuPrincipal,
  enviarMenuAsesoriaUniversitaria,
  enviarOpcionesFinales, // ✅ asegúrate de que esto exista aquí
  enviarMenuAsesoriaIngles,
  enviarMenuAsesoriaMatematica,
  enviarMenuAsesoriaOMatematica,
};
