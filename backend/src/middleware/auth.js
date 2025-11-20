const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'change-me';

function authMiddleware(req, res, next){
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid Authorization format' });
  try{
    const payload = jwt.verify(parts[1], secret);
    req.user = payload;
    next();
  } catch (err){
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authMiddleware, jwtSecret: secret };
