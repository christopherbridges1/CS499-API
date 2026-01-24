const jwt = require("jsonwebtoken");

function authCustomer(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ ok: false, error: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.customer = { id: payload.sub, username: payload.username };
    return next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: "Invalid token" });
  }
}

module.exports = { authCustomer };