
exports.revokeCertificate = (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const { reason } = req.body || {};

    const certificate = Certificate.findByCertificateId(certificateId);

    if (!certificate) {
      return res.status(404).json({
        error: "Not Found",
        message: `No certificate found with ID '${certificateId}'.`,
      });
    }

    if (certificate.status === "Revoked") {
      return res.status(409).json({
        error: "Conflict",
        message: "Certificate has already been revoked.",
        certificate,
      });
    }

    const revocationReason =
      typeof reason === "string" && reason.trim()
        ? reason.trim()
        : "Revoked by admin.";

    const revoked = Certificate.revoke(certificateId, revocationReason);

    res.json({
      message: "Certificate revoked successfully.",
      certificate: revoked,
    });
  } catch (err) {
    next(err);
  }
};
