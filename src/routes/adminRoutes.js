const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const managementController = require("../controllers/managementController");

const { authenticate } = require("../middleware/auth");

const {
  adminLoginRules,
  rejectApplicationRules,
  revokeCertificateRules,
} = require("../middleware/validators");

const { handleValidation } = require("../middleware/errors");

// Admin Login (No authentication required)
router.post(
  "/admin/login",
  adminLoginRules,
  handleValidation,
  adminController.login
);

// All routes below require valid JWT authentication
router.use(authenticate);

// List all applications
router.get(
  "/admin/applications",
  managementController.listApplications
);

// Approve application and generate certificate
router.patch(
  "/admin/applications/:applicationId/approve",
  managementController.approveApplication
);

// Reject application
router.patch(
  "/admin/applications/:applicationId/reject",
  rejectApplicationRules,
  handleValidation,
  managementController.rejectApplication
);

// List all certificates
router.get(
  "/admin/certificates",
  managementController.listCertificates
);

// Revoke certificate (PATCH - recommended method)
router.patch(
  "/admin/certificates/:certificateId/revoke",
  revokeCertificateRules,
  handleValidation,
  managementController.revokeCertificate
);

// Revoke certificate (GET - official SRS compatibility)
router.get(
  "/admin/certificates/:certificateId/revoke",
  managementController.revokeCertificate
);

module.exports = router;
