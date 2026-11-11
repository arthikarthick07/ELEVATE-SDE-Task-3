const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing or malformed Authorization header. Use 'Bearer <token>'.",
    });
  }

  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = { id: payload.id, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token.",
    });
  }
}

function signToken(admin) {
  return jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

module.exports = { authenticate, signToken, JWT_SECRET, JWT_EXPIRES_IN };
