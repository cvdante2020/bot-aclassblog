// src/utils/database.js

const { createClient } = require('@supabase/supabase-js');

// Conexión a Supabase usando variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Buscar una respuesta aleatoria por categoría y subcategoría
 * @param {string} categoria 
 * @param {string} subcategoria 
 * @returns {string|null}
 */
const obtenerRespuestaAleatoria = async (categoria, subcategoria) => {
  const { data, error } = await supabase
    .from('respuestas_chatbot')
    .select('mensaje')
    .eq('categoria', categoria)
    .eq('subcategoria', subcategoria);

  if (error) {
    console.error('Error buscando respuestas en Supabase:', error);
    return null;
  }

  if (data && data.length > 0) {
    const respuestaRandom = data[Math.floor(Math.random() * data.length)];
    return respuestaRandom.mensaje;
  }

  return null;
};

/**
 * Guardar interacción de usuario y bot
 * @param {string} telefono 
 * @param {string} mensajeUsuario 
 * @param {string} respuestaBot 
 * @param {string} categoriaConsultada
 */
const guardarInteraccion = async (telefono, mensajeUsuario, respuestaBot, categoriaConsultada) => {
  const { error } = await supabase
    .from('interacciones_chatbot')
    .insert([
      {
        telefono,
        mensaje_usuario: mensajeUsuario,
        respuesta_bot: respuestaBot,
        categoria_consultada: categoriaConsultada
      }
    ]);

  if (error) {
    console.error('Error guardando interacción en Supabase:', error);
  }
};

module.exports = { obtenerRespuestaAleatoria, guardarInteraccion };
