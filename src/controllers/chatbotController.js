// src/controllers/chatbotController.js
const axios = require('axios');
const {
  guardarInteraccion,
  registrarUsuarioSiNoExiste,
  actualizarUltimaIntencion,
  obtenerUltimaIntencion,
  guardarMensajeCentral, // ✅ asegúrate de incluirlo aquí también
  verificarEstadoConversacion
} = require('../utils/database');const { enviarMensajeWhatsApp,enviarMenuAsesoriaUniversitaria, enviarMenuPrincipal, enviarOpcionesFinales, enviarMenuAsesoriaIngles, enviarMenuAsesoriaMatematica, enviarMenuAsesoriaOMatematica } = require('../utils/whatsappApi');
const { consultarChatGPT } = require('../utils/openai');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const CONSULTOR_WHATSAPP = '593998260550';

const validateWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook validado correctamente.');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
};


const procesarMensajeEntrante = async ({ telefono, mensajeUsuario, numeroAsociado, origenBot }) => {
  try {
    // 1. Verificar si el bot está activo
    const estado = await verificarEstadoConversacion(telefono, numeroAsociado);
    if (estado === 'manual') {
      console.log(`🛑 Bot ${origenBot} desactivado para ${telefono}`);
      return; // No responde el bot
    }

    // 2. Generar respuesta (GPT o lógica interna)
    const respuestaBot = await obtenerRespuestaDelBot(mensajeUsuario, origenBot); // tu lógica IA

    // 3. Enviar la respuesta al usuario (tu función actual de envío)
    await enviarRespuestaWhatsApp(telefono, respuestaBot);

    // 4. Guardar en Supabase centralizada
    await guardarMensajeCentral(telefono, numeroAsociado, mensajeUsuario, respuestaBot, origenBot);

  } catch (error) {
    console.error('❌ Error procesando mensaje:', error);
  }
};

// 🧠 Cache temporal de mensajes ya procesados
const mensajesProcesados = new Set();

const handleWebhook = async (req, res) => {
  try {
    console.log("➡️ Mensaje recibido del Webhook:", JSON.stringify(req.body, null, 2));

    const body = req.body;
    if (!body.object) return res.sendStatus(400);

    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const telefonoUsuario = message?.from || 'desconocido';
    const userMessage = message?.text?.body?.trim() || "";
    let respuestaBot = "";

    // Registrar usuario si no existe
    await registrarUsuarioSiNoExiste(telefonoUsuario);

    // Procesar interacciones tipo lista
    if (message?.type === 'interactive' && message?.interactive?.type === 'list_reply') {
      const seleccionId = message.interactive.list_reply.id;
      const seleccionTitulo = message.interactive.list_reply.title;

      if (seleccionId === 'op_1') {
        respuestaBot = `🎯 Asesoría para ingreso a universidades en EE.UU. Te guiamos en todo el proceso de admisión y becas.`;
     await guardarMensajeCentral(
    telefonoUsuario,
    'Aclassblog', // número asociado al bot
    seleccionTitulo || seleccionId, // lo que el usuario tocó
    respuestaBot,
    'Aclassblog'
  );
await actualizarUltimaIntencion(telefonoUsuario, 'saludo', 'Aclassblog'); // también importante

       await enviarMensajeWhatsApp(telefonoUsuario, respuestaBot);
        setTimeout(() => enviarMenuAsesoriaUniversitaria(telefonoUsuario), 500);
        return res.sendStatus(200);
      }

      if (['1A', '1B', '1C', '1D'].includes(seleccionId)) {
        await manejarSubopcionAsesoria(telefonoUsuario, seleccionId);
        return res.sendStatus(200);
      }

      if (seleccionId === 'op_2') {
        respuestaBot = `🎓 Te preparamos para que puedas obtener tu certificación desde A1 hasta C2`;
     await guardarMensajeCentral(
    telefonoUsuario,
    'Aclassblog', // número asociado al bot
    seleccionTitulo || seleccionId, // lo que el usuario tocó
    respuestaBot,
    'Aclassblog'
  );
await actualizarUltimaIntencion(telefonoUsuario, 'saludo', 'Aclassblog'); // también importante

       await enviarMensajeWhatsApp(telefonoUsuario, respuestaBot);
        setTimeout(() => enviarMenuAsesoriaIngles(telefonoUsuario), 500);
        return res.sendStatus(200);
      }

      if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(seleccionId)) {
        await manejarSubopcionIngles(telefonoUsuario, seleccionId);
        return res.sendStatus(200);
      }

      if (seleccionId === 'op_3') {
        respuestaBot = `📐 Cursos de matemáticas EGB - BGU - Cálculo`;
    await guardarMensajeCentral(
    telefonoUsuario,
    'Aclassblog', // número asociado al bot
    seleccionTitulo || seleccionId, // lo que el usuario tocó
    respuestaBot,
    'Aclassblog'
  );
await actualizarUltimaIntencion(telefonoUsuario, 'saludo', 'Aclassblog'); // también importante
     await enviarMensajeWhatsApp(telefonoUsuario, respuestaBot);
        setTimeout(() => enviarMenuAsesoriaMatematica(telefonoUsuario), 500);
        return res.sendStatus(200);
      }

      if (['EGB','BGU','Cálculo'].includes(seleccionId)) {
        await manejarSubopcionMatematica(telefonoUsuario, seleccionId);
        return res.sendStatus(200);
      }

      if (seleccionId === 'op_4') {
        respuestaBot = `🎖 Te preparamos para Olimpiadas Matemáticas.`;
    await guardarMensajeCentral(
    telefonoUsuario,
    'Aclassblog', // número asociado al bot
    seleccionTitulo || seleccionId, // lo que el usuario tocó
    respuestaBot,
    'Aclassblog'
  );
await actualizarUltimaIntencion(telefonoUsuario, 'saludo', 'Aclassblog'); // también importante
     await enviarMensajeWhatsApp(telefonoUsuario, respuestaBot);
        setTimeout(() => enviarMenuAsesoriaOMatematica(telefonoUsuario), 500);
        return res.sendStatus(200);
      }

      if (['Básico','Intermedio','Avanzado'].includes(seleccionId)) {
        await manejarSubopcionOMatematica(telefonoUsuario, seleccionId);
        return res.sendStatus(200);
      }

      if (seleccionId === 'ir_asesor') {
        const link = `https://wa.me/${CONSULTOR_WHATSAPP}`;
        await enviarMensajeWhatsApp(telefonoUsuario, `Aquí tienes el contacto de un asesor humano: ${link}`);
        return res.sendStatus(200);
      }

      if (seleccionId === 'ir_menu') {
        await enviarMenuPrincipal(telefonoUsuario);
        return res.sendStatus(200);
      }
    }

    // Mensajes de texto comunes
    if (userMessage) {
      const saludos = ['HOLA', 'BUENOS DÍAS', 'BUENAS TARDES', 'BUENAS NOCHES'];
      if (saludos.some(s => userMessage.toUpperCase().includes(s))) {
        respuestaBot = `¡Hola! 👋 Soy **Chris**, tu asistente virtual en *Aclassblog*.\n\nEn menos de 1 minuto obtendrás toda la información que necesitas. 🚀✨\n\nAquí tienes nuestro menú:`;
     await guardarMensajeCentral(
      telefonoUsuario,
      'Aclassblog',
      userMessage,
      respuestaBot,
      'Aclassblog'
    );    await enviarMensajeWhatsApp(telefonoUsuario, respuestaBot);
        await enviarMenuPrincipal(telefonoUsuario);
        return res.sendStatus(200);
      }

      // Consultar a GPT
      const respuestaGPT = await consultarChatGPT(userMessage);
      respuestaBot = respuestaGPT;
      await guardarMensajeCentral(
      telefonoUsuario,
      'Aclassblog',
      userMessage,
      respuestaBot,
      'Aclassblog'
    );     await enviarMensajeWhatsApp(telefonoUsuario, respuestaBot);
      setTimeout(() => enviarOpcionesFinales(telefonoUsuario), 500);
      return res.sendStatus(200);
    }

    return res.sendStatus(200); // Si no hubo ningún mensaje válido
  } catch (error) {
    console.error('❌ Error general en handleWebhook:', error.message, error.stack);
    return res.sendStatus(500);
  }
};

module.exports = { validateWebhook, handleWebhook };

async function manejarSubopcionAsesoria(telefono, opcionId) {
  const subopciones = {
    '1A': `📘 *Plan A: Desde 10mo de EGB*
Estás a tiempo de recibir una consultoría completa. Esta incluye preparación y desarrollo de tu
hoja de vida, acompañamiento en proyectos, preparación para exámenes (SAT/ TOEFL o
IELTS), guía en la aplicación a becas y universidades, entre otros, Incluye:
✅ Evaluación de perfil
✅ Ensayos y cartas personalizadas
✅ TOEFL, SAT, entrevistas
✅ Simulaciones de admisión
💵 Valor: 3.999 USD (único pago)`,

    '1B': `📗 *Plan B: Desde 1ro de BGU*
Recibe una consultoría completamente personalizada y cumple tu sueño de estudiar en
Estados Unidos. Esta incluye preparación y desarrollo de tu hoja de vida, acompañamiento en
proyectos, preparación para exámenes (SAT/ TOEFL o IELTS), guía en la aplicación a becas y
universidades, entre otros, Inlcuye:
✅ Asesoría personalizada
✅ Simulaciones de admisión
✅ Ensayos, TOEFL, SAT
💵 Valor: 2.999 USD`,

    '1C': `📙 *Plan C: Desde 2do de BGU*
Prepara tu camino para estudiar en Estados Unidos con A Class Blog. Esta consultoría incluye
preparación y desarrollo de tu hoja de vida, acompañamiento en proyectos, preparación para
exámenes (SAT/ TOEFL o IELTS), guía en la aplicación a becas y universidades, entre otros, Incluye:
✅ Acompañamiento acelerado
✅ TOEFL, SAT y entrevistas
💵 Valor: 2.499 USD`,

    '1D': `📕 *Plan D: Solo 3ro de BGU*
Corre! Tu proceso de consultoría únicamente es aplicable si tienes tu CV desarrollado y ya has
tomado tu exámen SAT. A menos que quieras aventurarte a universidades test-optional, Incluye:
✅ Preparación express
✅ Ensayos, TOEFL, y aplicación final
💵 Valor: 1.499 USD`
  };

  const respuesta = subopciones[opcionId];
  if (respuesta) {
    await guardarMensajeCentral(
      telefono,
      'Aclassblog',
      opcionId,       // aquí va el ID (no seleccionTitulo)
      respuesta,      // aquí va la respuesta generada
      'Aclassblog'
    ); await enviarMensajeWhatsApp(telefono, respuesta);
    setTimeout(async () => {
      await enviarOpcionesFinales(telefono);
    }, 500);
  }
}


async function manejarSubopcionIngles(telefono, opcionId) {
  const subopciones = {
    'A1': `📘 En este nivel de inglés nivel A1, revisaremos los temas básicos del idioma.
    Practicarás saludos, información personal, números, días, meses, gramática sencilla y vocabulario común.
    Evaluaremos si puedes hablar, escribir, leer y comprender inglés básico.
    El examen incluye actividades de escucha, lectura y expresión oral.
    ¡Comencemos!, Vamos a Ver:
    ✅ 1. Saludos y presentaciones
    ✅ 2. Datos personales
    ✅ 3. Verbo to be (ser/estar)
    ✅ 4. Artículos y sustantivos
    ✅ 5. Números, fechas y horas
    ✅ 6. Vocabulario básico
    ✅ 7. Gramática básica
    ✅ 8. Preguntas y respuestas
    💵 Valor: 49,99 USD X Mes (3 meses)`,
    
        'A2': `📗 En este nivel de inglés nivel A2, repasaremos temas del nivel básico alto.
    Evaluaremos tu capacidad para comunicarte en situaciones cotidianas con mayor fluidez que en el nivel A1.
    Trabajarás con expresiones del día a día, hablarás sobre el pasado, el futuro cercano, y describirás personas, lugares y rutinas.
    También comprenderás textos simples, darás opiniones y seguirás instrucciones.
    El examen incluye actividades de lectura, escritura, comprensión auditiva y expresión oral.
    ¡Mucho éxito!, Que Inlcuye:
    ✅ 1. Saludar y conversar
    ✅ 2. Rutinas y frecuencia
    ✅ 3. Pasado simple (acciones pasadas)
    ✅ 4. Futuro con “going to”
    ✅ 5. Descripciones
    ✅ 6. Comprensión de textos sencillos
    ✅ 7. Vocabulario útil
    ✅ 8. Pedir y dar direcciones
    ✅ 9. Comparativos y superlativos
    💵 Valor: 49,99 USD X Mes (3 meses)`,
    
        'B1': `📙 Bienvenido/a al nivel de inglés B1.
    Este nivel corresponde al nivel intermedio, en el que demostrarás que puedes comunicarte con mayor seguridad en situaciones del día a día, tanto en contextos personales como laborales.
    Durante el examen, usarás distintos tiempos verbales, darás tu opinión, relatarás experiencias, y entenderás textos y audios más extensos.
    También escribirás correos sencillos, harás descripciones detalladas y participarás en conversaciones simuladas.
    El examen incluye secciones de comprensión auditiva, lectura, escritura y expresión oral.
    ¡Te deseamos mucho éxito!, Aqui el Contenido:
    ✅ 1. Comunicación funcional
    ✅ 2. Tiempos verbales
    ✅ 3. Descripciones detalladas
    ✅ 4. Condicionales básicos
    ✅ 5. Voz pasiva (básica)
    ✅ 6. Reported speech (básico)
    ✅ 7. Pedir y dar consejos / instrucciones
    ✅ 8. Vocabulario intermedio
    ✅ 9. Lectura y comprensión de textos
    ✅ 10. Expresión escrita y oral
    💵 Valor: 69,99 USD X Mes (3 meses)`,
    
        'B2': `📕 En este nivel de ingles B2 se evaluará tu capacidad para comunicarte con fluidez y seguridad en una amplia variedad de contextos.
    Podrás expresar y defender opiniones, analizar textos complejos, redactar ensayos argumentativos y comprender audios más exigentes.
    Este nivel te permite desenvolverte cómodamente tanto en ambientes académicos como profesionales.
    El examen incluye comprensión auditiva, lectura, redacción y expresión oral.
    Prepárate para demostrar un dominio sólido del inglés. ¡Mucho éxito!, aqui el contenido:
    ✅ 1. Fluidez comunicativa
    ✅ 2. Tiempos verbales avanzados
    ✅ 3. Condicionales avanzadas
    ✅ 4. Discurso indirecto avanzado
    ✅ 5. Voz pasiva en varios tiempos
    ✅ 6. Uso de modales complejos
    ✅ 7. Conectores y estructuras complejas
    ✅ 8. Vocabulario amplio
    ✅ 9. Lectura crítica y análisis
    ✅ 10. Expresión escrita
    💵 Valor: 69,99 USD X Mes (3 meses)`,
    
    'C1': `📕 *En este nivel de inglés C1 se evaluará tu capacidad para comunicarte de forma fluida, precisa y natural en contextos académicos, profesionales y sociales complejos.
    Demostrarás que puedes comprender y producir textos extensos, argumentar con claridad, adaptar tu registro al contexto y manejar estructuras avanzadas del idioma.
    El examen incluye comprensión auditiva, lectura crítica, redacción formal y expresión oral de alto nivel.
    Este nivel refleja un dominio avanzado del inglés. ¡Éxitos!
    ✅ 1. Comunicación avanzada y natural
    ✅ 2. Tiempos y estructuras complejas
    ✅ 3. Expresiones idiomáticas y lenguaje figurado
    ✅ 4. Matices del lenguaje
    ✅ 5. Conectores y cohesión avanzada
    ✅ 6. Lectura crítica y comprensión profunda
    ✅ 7. Escritura de alto nivel
    ✅ 8. Interacción oral de nivel académico
    💵 Valor: 89,99 USD X Mes (3 meses)`,
    
    'C2': `📕 En este nivel de inglés C2 demostrarás un dominio completo del idioma, comparable al de un hablante nativo culto.
    Serás capaz de comprender sin esfuerzo textos orales y escritos muy complejos, expresarte con fluidez, precisión y naturalidad, y adaptar tu lenguaje a cualquier situación con sensibilidad lingüística y cultural.
    Este examen evalúa comprensión auditiva, lectura crítica, escritura académica y expresión oral de nivel profesional y especializado.
    Es el nivel más alto del inglés. ¡Mucho éxito!, Estamos Terminando.... Avancemos:
    ✅ 1. Dominio total del idioma
    ✅ 2. Comprensión auditiva total
    ✅ 3. Textos complejos y especializados
    ✅ 4. Producción oral sofisticada
    ✅ 5. Escritura avanzada y especializada
    ✅ 6. Flexibilidad y precisión
    
    💵 Valor: 89,99 USD X Mes (3 meses)`
    
  };

  const respuesta = subopciones[opcionId];
  if (respuesta) {
   await guardarMensajeCentral(
      telefono,
      'Aclassblog',
      opcionId,       // aquí va el ID (no seleccionTitulo)
      respuesta,      // aquí va la respuesta generada
      'Aclassblog'
    );  await enviarMensajeWhatsApp(telefono, respuesta);
    setTimeout(async () => {
      await enviarOpcionesFinales(telefono);
    }, 500);
  }
}

async function manejarSubopcionMatematica(telefono, opcionId) {
  const subopciones = {
    'EGB': `:
    ✅ 1. Operaciones con números enteros y racionales
    ✅ 2. DMúltiplos, divisores, fracciones, decimales
    ✅ 3. Proporcionalidad y porcentajes
    ✅ 4. Álgebra básica: expresiones, ecuaciones lineales
    ✅ 5. Perímetros, áreas, volúmenes
    ✅ 6. Gráficos estadísticos simples
    ✅ 7. Coordenadas cartesianas y recta numérica
    💵 Valor: 49,99 USD X Mes (3 meses)`,
    
    'BGU': `:
    ✅ 1. Álgebra intermedia: factorización, polinomios
    ✅ 2. Funciones: lineales, cuadráticas, exponenciales
    ✅ 3. Geometría: trigonometría, teorema de Pitágoras
    ✅ 4. Estadística y probabilidad
    ✅ 5. Sistemas de ecuaciones y desigualdades
    ✅ 6. Cálculo básico (en 3ro BGU): límites, derivadas simples
    ✅ 7. Razonamiento lógico y problemas contextualizados
    💵 Valor: 49,99 USD X Mes (3 meses)`,

    'Cálculo': `:
    ✅ 1. Funciones
    ✅ 2. Límites y continuidad
    ✅ 3. Derivadas
    ✅ 4. Aplicaciones de la derivada
    ✅ 5. Integrales indefinidas
    ✅ 6. Integrales definidas
    ✅ 7. Técnicas de integración
    ✅ 8. Aplicaciones de la integral
    ✅ 9. Sucesiones y series (opcional según malla)
    💵 Valor: 49,99 USD X Mes (3 meses)`
  };

  const respuesta = subopciones[opcionId];
  if (respuesta) {
    await guardarMensajeCentral(
      telefono,
      'Aclassblog',
      opcionId,       // aquí va el ID (no seleccionTitulo)
      respuesta,      // aquí va la respuesta generada
      'Aclassblog'
    ); await enviarMensajeWhatsApp(telefono, respuesta);
    setTimeout(async () => {
      await enviarOpcionesFinales(telefono);
    }, 500);
  }
}

async function manejarSubopcionOMatematica(telefono, opcionId) {
  const subopciones = {
    'Básico': `Curso de preparación intensiva en razonamiento matemático diseñado para estudiantes 
    que deseen competir en Olimpiadas Nacionales e Internacionales, fortaleciendo habilidades lógicas, 
    algebraicas, numéricas y geométricas por medio de problemas desafiantes, estrategias no tradicionales y 
    pensamiento abstracto:
    ✅ 1. Aritmética avanzada: múltiplos, divisores, factorización, criterios de divisibilidad
    ✅ 2. Fracciones, decimales, porcentajes
    ✅ 3. Problemas de lógica y razonamiento verbal-matemático
    ✅ 4. Álgebra elemental: ecuaciones básicas, patrones
    ✅ 5. Geometría plana: ángulos, triángulos, áreas y perímetros
    ✅ 6. Conteo y combinatoria básica (principio multiplicativo, permutaciones simples)
    ✅ 7. Juegos matemáticos, resolución de acertijos y problemas tipo "ingenio"
    💵 Valor: 49,99 USD X Mes (2 meses)`,
    
    'Intermedio': `:
    ✅ 1. Teoría de números: divisibilidad, congruencias básicas, mcd/mcm
    ✅ 2. Álgebra: identidades notables, factorización, ecuaciones cuadráticas
    ✅ 3. Geometría: semejanza, teorema de Pitágoras, polígonos, circunferencia
    ✅ 4. Probabilidad y conteo: combinatoria, principios de inclusión y exclusión
    ✅ 5. Lógica y demostración: uso de contraejemplos, deducción lógica
    ✅ 6. Secuencias y progresiones (aritméticas, geométricas)
    💵 Valor: 49,99 USD X Mes (2 meses)`,

    'Avanzado': `:
    ✅ 1. Teoría de números avanzada: restos, modularidad, divisibilidad con demostración
    ✅ 2. Álgebra olímpica: desigualdades, expresiones algebraicas complejas
    ✅ 3. Geometría analítica y euclidiana (triángulos, circunferencias, loci, construcciones)
    ✅ 4. Combinatoria avanzada: principio de Dirichlet, recursividad, binomio de Newton
    ✅ 5. Resolución de problemas por inducción matemática
    ✅ 6. Estrategias de solución no rutinaria: invariantes, simetrías, razonamiento lateral
    💵 Valor: 49,99 USD X Mes (3 meses)`
  };

  const respuesta = subopciones[opcionId];
  if (respuesta) {
    await guardarMensajeCentral(
      telefono,
      'Aclassblog',
      opcionId,       // aquí va el ID (no seleccionTitulo)
      respuesta,      // aquí va la respuesta generada
      'Aclassblog'
    );  await enviarMensajeWhatsApp(telefono, respuesta);
    setTimeout(async () => {
      await enviarOpcionesFinales(telefono);
    }, 500);
  }
}


