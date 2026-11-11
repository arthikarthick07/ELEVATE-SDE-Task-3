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

// Login (no auth required)
router.post("/admin/login", adminLoginRules, handleValidation, adminController.login);

// All routes below require a valid JWT
router.use(authenticate);

router.get("/admin/applications", managementController.listApplications);

router.patch(
  "/admin/applications/:applicationId/approve",
  managementController.approveApplication
);

router.patch(
  "/admin/applications/:applicationId/reject",
  rejectApplicationRules,
  handleValidation,
  managementController.rejectApplication
);

router.get("/admin/certificates", managementController.listCertificates);

router.patch(
  "/admin/certificates/:certificateId/revoke",
  revokeCertificateRules,
  handleValidation,
  managementController.revokeCertificate
);

module.exports = router;
