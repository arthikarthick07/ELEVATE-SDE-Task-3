const Admin = require("../models/Admin");
const { signToken } = require("../middleware/auth");
const { sanitizeAdmin } = require("../utils/helpers");

exports.login = (req, res, next) => {
  try {
    const { username, password } = req.body;
    const admin = Admin.findByUsername(username);
    if (!admin || !Admin.verifyPassword(password, admin.password_hash)) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid username or password.",
      });
    }
    const token = signToken(admin);
    res.json({
      message: "Login successful.",
      token,
      admin: sanitizeAdmin(admin),
    });
  } catch (err) {
    next(err);
  }
};
