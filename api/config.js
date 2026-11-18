// Vercel function: public Supabase config for the browser (URL and publishable key only).
const { publicConfig } = require('../server/config.js');
const { send } = require('../server/market.js');
module.exports = (req, res) => send(res, 200, publicConfig());
