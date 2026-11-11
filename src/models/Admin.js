const db = require("../config/database");
const bcrypt = require("bcryptjs");

const Admin = {
  create({ username, password }) {
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    db.run(
      `INSERT INTO admins (username, password_hash) VALUES (?, ?)`,
      [username, password_hash]
    );
    return this.findByUsername(username);
  },

  findByUsername(username) {
    return db.get(`SELECT * FROM admins WHERE username = ?`, [username]);
  },

  verifyPassword(plain, hash) {
    return bcrypt.compareSync(plain, hash);
  },

  count() {
    const row = db.get(`SELECT COUNT(*) AS count FROM admins`);
    return row ? row.count : 0;
  },
};

module.exports = Admin;
