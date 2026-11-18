// Vercel function for every /api/market/* route; same handler and guard as the local server.
const { handleMarket, send } = require('../../server/market.js');
const { guard } = require('../../server/guard.js');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  const url = new URL(req.url, 'https://app.invalid');
  if (await guard(req, res, url)) await handleMarket(req, res, url);
};
