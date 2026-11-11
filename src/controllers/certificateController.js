const Certificate = require("../models/Certificate");

exports.verifyCertificate = (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const certificate = Certificate.findByCertificateId(certificateId);
    if (!certificate) {
      return res.status(404).json({
        error: "Not Found",
        message: `No certificate found with ID '${certificateId}'.`,
      });
    }
    res.json({
      valid: certificate.status === "Valid",
      certificate,
    });
  } catch (err) {
    next(err);
  }
};
