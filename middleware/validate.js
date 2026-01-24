function isString(x) {
  return typeof x === "string";
}

function validateUsernamePassword(req, res, next) {
  const { username, password } = req.body || {};

  if (!isString(username) || !isString(password)) {
    return res.status(400).json({ ok: false, error: "username and password must be strings" });
  }

  const u = username.trim();

  // Username rules
  if (u.length < 3 || u.length > 24) {
    return res.status(400).json({ ok: false, error: "username must be 3-24 characters" });
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(u)) {
    return res.status(400).json({ ok: false, error: "username may only use letters, numbers, . _ -" });
  }

  // Password rules
  if (password.length < 8 || password.length > 72) {
    return res.status(400).json({ ok: false, error: "password must be 8-72 characters" });
  }

  // normalize
  req.body.username = u;

  next();
}

module.exports = { validateUsernamePassword };