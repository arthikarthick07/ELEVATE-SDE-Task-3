const db = require("../config/database");
const { generateCertificateId } = require("../utils/helpers");

const Certificate = {
  create({ application_id, holder_name, phone, city, state }) {
    const certificateId = generateCertificateId();
    db.run(
      `INSERT INTO certificates (certificate_id, application_id, holder_name, phone, city, state)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [certificateId, application_id, holder_name, phone, city, state]
    );
    return this.findByCertificateId(certificateId);
  },

  findByCertificateId(certificateId) {
    return db.get(`SELECT * FROM certificates WHERE certificate_id = ?`, [
      certificateId,
    ]);
  },

  findByApplicationId(applicationId) {
    return db.get(
      `SELECT * FROM certificates WHERE application_id = ? AND status = 'Valid'`,
      [applicationId]
    );
  },

  findAll() {
    return db.all(
      `SELECT * FROM certificates ORDER BY issued_at DESC, id DESC`
    );
  },

  revoke(certificateId, reason) {
    db.run(
      `UPDATE certificates
       SET status = 'Revoked', revoked_at = datetime('now'), revocation_reason = ?
       WHERE certificate_id = ?`,
      [reason, certificateId]
    );
    return this.findByCertificateId(certificateId);
  },
};

module.exports = Certificate;
