const Application = require("../models/Application");
const Certificate = require("../models/Certificate");

exports.listApplications = (req, res, next) => {
  try {
    const applications = Application.findAll();
    res.json({ count: applications.length, applications });
  } catch (err) {
    next(err);
  }
};

exports.approveApplication = (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const application = Application.findByApplicationId(applicationId);

    if (!application) {
      return res.status(404).json({
        error: "Not Found",
        message: `No application found with ID '${applicationId}'.`,
      });
    }

    if (application.status === "Approved") {
      const existing = Certificate.findByApplicationId(applicationId);
      if (existing) {
        return res.status(409).json({
          error: "Conflict",
          message: "Application already approved. A certificate has been issued.",
          certificate: existing,
        });
      }
    }

    if (application.status === "Rejected") {
      return res.status(409).json({
        error: "Conflict",
        message: "Cannot approve an application that has already been rejected.",
      });
    }

    const updated = Application.updateStatus(applicationId, "Approved");
    const certificate = Certificate.create({
      application_id: application.application_id,
      holder_name: application.name,
      phone: application.phone,
      city: application.city,
      state: application.state,
    });

    res.json({
      message: "Application approved and certificate issued.",
      application: updated,
      certificate,
    });
  } catch (err) {
    next(err);
  }
};

exports.rejectApplication = (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body || {};

    const application = Application.findByApplicationId(applicationId);
    if (!application) {
      return res.status(404).json({
        error: "Not Found",
        message: `No application found with ID '${applicationId}'.`,
      });
    }

    if (application.status === "Approved") {
      return res.status(409).json({
        error: "Conflict",
        message: "Cannot reject an application that has already been approved.",
      });
    }

    if (application.status === "Rejected") {
      return res.status(409).json({
        error: "Conflict",
        message: "Application has already been rejected.",
      });
    }

    const updated = Application.updateStatus(applicationId, "Rejected", reason);
    res.json({
      message: "Application rejected.",
      application: updated,
    });
  } catch (err) {
    next(err);
  }
};

exports.listCertificates = (req, res, next) => {
  try {
    const certificates = Certificate.findAll();
    res.json({ count: certificates.length, certificates });
  } catch (err) {
    next(err);
  }
};

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

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        error: "Validation Error",
        message: "A revocation reason is required.",
      });
    }

    const revoked = Certificate.revoke(certificateId, reason.trim());
    res.json({
      message: "Certificate revoked successfully.",
      certificate: revoked,
    });
  } catch (err) {
    next(err);
  }
};
