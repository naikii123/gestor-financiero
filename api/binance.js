const crypto = require("crypto");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const apiKey    = process.env.BINANCE_API_KEY;
  const secretKey = process.env.BINANCE_SECRET_KEY;

  if (!apiKey || !secretKey) {
    return res.status(500).json({ error: "API keys no configuradas" });
  }

  try {
    const ts        = Date.now();
    const query     = `timestamp=${ts}`;
    const signature = crypto.createHmac("sha256", secretKey).update(query).digest("hex");
    const url       = `https://api.binance.com/api/v3/account?${query}&signature=${signature}`;

    const r    = await fetch(url, { headers: { "X-MBX-APIKEY": apiKey } });
    const data = await r.json();

    if (data.code) return res.status(400).json({ error: data.msg });

    // Solo devolvemos saldos con valor > 0, sin exponer info sensible
    const balances = (data.balances || [])
      .filter(b => parseFloat(b.free) + parseFloat(b.locked) > 0)
      .map(b => ({
        asset:  b.asset,
        free:   parseFloat(b.free),
        locked: parseFloat(b.locked),
        total:  parseFloat(b.free) + parseFloat(b.locked),
      }));

    return res.status(200).json({ balances, ts: Date.now() });
  } catch (e) {
    return res.status(500).json({ error: "Error al consultar Binance" });
  }
};
