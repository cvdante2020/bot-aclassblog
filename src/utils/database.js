const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ SUPABASE_URL y SUPABASE_KEY son requeridos.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const guardarInteraccion = async (telefono, mensajeUsuario, respuestaBot, categoriaConsultada) => {
  const { error } = await supabase
    .from('interacciones_chatbot')
    .insert([{ telefono, mensaje_usuario: mensajeUsuario, respuesta_bot: respuestaBot, categoria_consultada: categoriaConsultada }]);
  if (error) console.error('❌ Error guardando interacción:', error);
};

const actualizarUltimaIntencion = async (telefono, intencion) => {
  const { error } = await supabase
    .from('usuarios')
    .upsert({ telefono, ultima_intencion: intencion }, { onConflict: ['telefono'] });
  if (error) console.error('❌ Error actualizando intención:', error);
};

const obtenerUltimaIntencion = async (telefono) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('ultima_intencion')
    .eq('telefono', telefono)
    .single();
  return error ? null : data?.ultima_intencion || null;
};

const registrarUsuarioSiNoExiste = async (telefono) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('telefono')
    .eq('telefono', telefono)
    .maybeSingle();

  if (!data && !error) {
    await supabase.from('usuarios').insert([{ telefono }]);
  }
};

module.exports = {
  guardarInteraccion,
  actualizarUltimaIntencion,
  obtenerUltimaIntencion,
  registrarUsuarioSiNoExiste
};
