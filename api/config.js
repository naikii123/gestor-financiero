// Endpoint que devuelve la configuración pública al frontend.
// La anon key de Supabase está diseñada para ser pública;
// los datos están protegidos por las políticas de Row Level Security (RLS).

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=300"); // cachea 5 min

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    return res.status(500).json({ error: "Supabase no configurado" });
  }

  return res.status(200).json({ supabaseUrl: url, supabaseKey: key });
};
