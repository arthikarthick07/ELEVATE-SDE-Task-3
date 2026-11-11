const db = require("../config/database");
const { generateApplicationId } = require("../utils/helpers");

const Application = {
  create({ name, phone, gender, city, state }) {
    const applicationId = generateApplicationId();
    db.run(
      `INSERT INTO applications (application_id, name, phone, gender, city, state)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [applicationId, name, phone, gender, city, state]
    );
    return this.findByApplicationId(applicationId);
  },

  findByApplicationId(applicationId) {
    return db.get(`SELECT * FROM applications WHERE application_id = ?`, [
      applicationId,
    ]);
  },

  findAll() {
    return db.all(
      `SELECT * FROM applications ORDER BY submitted_at DESC, id DESC`
    );
  },

  updateStatus(applicationId, status, rejectionReason = null) {
    if (status === "Rejected") {
      db.run(
        `UPDATE applications SET status = ?, rejection_reason = ? WHERE application_id = ?`,
        [status, rejectionReason, applicationId]
      );
    } else {
      db.run(
        `UPDATE applications SET status = ?, rejection_reason = NULL WHERE application_id = ?`,
        [status, applicationId]
      );
    }
    return this.findByApplicationId(applicationId);
  },
};

module.exports = Application;
