/**
 * Generate a unique application ID: APP-YYYYMMDD-XXXX
 */
function generateApplicationId() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `APP-${yyyy}${mm}${dd}-${rand}`;
}

/**
 * Generate a unique certificate ID: CRT-YYYYMMDD-XXXXXX
 */
function generateCertificateId() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `CRT-${yyyy}${mm}${dd}-${rand}`;
}

/**
 * Strip password_hash / password fields from any object before responding.
 */
function sanitizeAdmin(admin) {
  if (!admin) return admin;
  const { password_hash, password, ...rest } = admin;
  return rest;
}

module.exports = {
  generateApplicationId,
  generateCertificateId,
  sanitizeAdmin,
};
