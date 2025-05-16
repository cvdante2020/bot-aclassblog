const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ SUPABASE_URL y SUPABASE_KEY son requeridos.');
}

const supabase = createClient(supabaseUrl, supabaseKey);


// ✅ Inserta mensaje en tabla unificada
const guardarMensajeCentral = async (telefono, numeroAsociado, mensajeUsuario, respuestaBot, origenBot) => {
  const { error } = await supabase
    .from('mensajes_recibidos')
    .insert([{
      telefono,
      numero_asociado: numeroAsociado ?? 'sin-bot',
      mensaje_usuario: mensajeUsuario,
      respuesta_bot: respuestaBot,
      origen_bot: origenBot
    }]);
  if (error) console.error('❌ Error guardando en mensajes_recibidos:', error);
};

// ✅ Consulta si la conversación está activa o en modo manual
const verificarEstadoConversacion = async (telefono, numeroAsociado) => {
  const { data, error } = await supabase
    .from('conversaciones_activas')
    .select('estado')
    .eq('telefono', telefono)
    .eq('numero_asociado', numeroAsociado ?? 'sin-bot')
    .single();
  if (error) return 'activo_bot'; // Si no existe, por defecto el bot responde
  return data.estado;
};

// ✅ Cambia estado: 'manual' o 'activo_bot'
const cambiarEstadoConversacion = async (telefono, numeroAsociado, nuevoEstado = 'activo_bot') => {
  const { error } = await supabase
    .from('conversaciones_activas')
    .upsert({
      telefono,
      numero_asociado: numeroAsociado ?? 'sin-bot',
      estado: nuevoEstado,
      ultima_interaccion: new Date()
    }, { onConflict: ['telefono', 'numero_asociado'] });

  if (error) console.error('❌ Error actualizando estado conversación:', error);
};

const guardarInteraccion = async (telefono, mensajeUsuario, respuestaBot, categoriaConsultada, origenBot) => {
  const { error } = await supabase
    .from('interacciones_chatbot')
    .insert([{
      telefono,
      mensaje_usuario: mensajeUsuario,
      respuesta_bot: respuestaBot,
      categoria_consultada: categoriaConsultada,
      origen_bot: origenBot
    }]);
  if (error) console.error('❌ Error guardando interacción:', error);
};

const actualizarUltimaIntencion = async (telefono, intencion, origenBot, estado = 'activa') => {
  const { error } = await supabase
    .from('usuarios')
    .upsert({
      telefono,
      ultima_intencion: intencion,
      origen_bot: origenBot,
      estado_conversacion: estado,
      ultima_interaccion: new Date() // ✅ actualiza dinámicamente la fecha
    }, { onConflict: ['telefono'] });

  if (error) console.error('❌ Error actualizando intención:', error);
};

const obtenerUltimaIntencion = async (telefono) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('ultima_intencion, estado_conversacion')
    .eq('telefono', telefono)
    .single();
  return error ? null : data;
};

const registrarUsuarioSiNoExiste = async (telefono, origenBot) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('telefono')
    .eq('telefono', telefono)
    .maybeSingle();

  if (!data && !error) {
    await supabase.from('usuarios').insert([{ telefono, origen_bot: origenBot, estado_conversacion: 'activa' }]);
  }
};

module.exports = {
  guardarInteraccion,
  actualizarUltimaIntencion,
  obtenerUltimaIntencion,
  registrarUsuarioSiNoExiste,
   guardarMensajeCentral,
  verificarEstadoConversacion,
  cambiarEstadoConversacion
};
