// *** Middleware to authenticate customers using JWT

const jwt = require("jsonwebtoken");

// Middleware function to authenticate customers
function authCustomer(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    // Check if token is present
    if (!token) return res.status(401).json({ ok: false, error: "Missing token" });

    // Verify the token
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.customer = { id: payload.sub, username: payload.username };
        return next();
    } catch (e) {
        // Handle invalid token
        return res.status(401).json({ ok: false, error: "Invalid token" });
    }
}

// Export the middleware
module.exports = { authCustomer };