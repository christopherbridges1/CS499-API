// *** Middleware to require admin role based on JWT token ***
const jwt = require("jsonwebtoken");

// Middleware function to require admin role
function requireAdmin(req, res, next) {
    const auth = req.headers.authorization || "";
    // Extract the token from the Authorization header
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, error: "missing token" });

    // Verify the token and check for admin role
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload.role !== "admin") return res.status(403).json({ ok: false, error: "forbidden" });
        req.user = payload;
        next();
    } catch (e) {
        return res.status(401).json({ ok: false, error: "invalid token" });
    }
}

// Export the middleware
module.exports = { requireAdmin };