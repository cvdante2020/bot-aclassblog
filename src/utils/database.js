const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Buscar una respuesta aleatoria por categoría y subcategoría
 */
const obtenerRespuestaAleatoria = async (categoria, subcategoria) => {
  const { data, error } = await supabase
    .from('respuestas_chatbot')
    .select('mensaje')
    .eq('categoria', categoria)
    .eq('subcategoria', subcategoria);

  if (error) {
    console.error('❌ Error buscando respuestas en Supabase:', error);
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
 */
const guardarInteraccion = async (telefono, mensajeUsuario, respuestaBot, categoriaConsultada) => {
  const { error } = await supabase
    .from('interacciones_chatbot')
    .insert([{
      telefono,
      mensaje_usuario: mensajeUsuario,
      respuesta_bot: respuestaBot,
      categoria_consultada: categoriaConsultada
    }]);

  if (error) {
    console.error('❌ Error guardando interacción en Supabase:', error);
  }
};

/**
 * Guardar o actualizar la última intención del usuario
 */
const actualizarUltimaIntencion = async (telefono, intencion) => {
  try {
    await supabase
      .from('usuarios')
      .upsert({ telefono, ultima_intencion: intencion }, { onConflict: ['telefono'] });
  } catch (error) {
    console.error('❌ Error actualizando intención:', error.message);
  }
};

/**
 * Obtener la última intención recordada del usuario
 */
const obtenerUltimaIntencion = async (telefono) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('ultima_intencion')
      .eq('telefono', telefono)
      .single();

    if (error) return null;
    return data?.ultima_intencion || null;
  } catch (error) {
    console.error('❌ Error obteniendo intención:', error.message);
    return null;
  }
};
const registrarUsuarioSiNoExiste = async (telefono) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('telefono')
      .eq('telefono', telefono)
      .maybeSingle();

    if (!data) {
      await supabase
        .from('usuarios')
        .insert([{ telefono }]);
      console.log('✅ Usuario registrado:', telefono);
    }
  } catch (error) {
    console.error('❌ Error registrando usuario:', error.message);
  }
};

module.exports = {
  obtenerRespuestaAleatoria,
  guardarInteraccion,
  actualizarUltimaIntencion,
  obtenerUltimaIntencion,
  registrarUsuarioSiNoExiste
};
