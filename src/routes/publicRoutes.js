const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const certificateController = require("../controllers/certificateController");
const {
  submitApplicationRules,
} = require("../middleware/validators");
const { handleValidation } = require("../middleware/errors");

router.post(
  "/applications",
  submitApplicationRules,
  handleValidation,
  applicationController.submitApplication
);

router.get(
  "/applications/track/:applicationId",
  applicationController.trackApplication
);

router.get(
  "/certificates/verify/:certificateId",
  certificateController.verifyCertificate
);

module.exports = router;
