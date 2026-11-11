const { body } = require("express-validator");

const submitApplicationRules = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters."),
  body("phone")
    .trim()
    .matches(/^[0-9 +\-()]{7,20}$/)
    .withMessage("Phone must be 7-20 digits (spaces, +, -, () allowed)."),
  body("gender")
    .trim()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be one of: Male, Female, Other."),
  body("city")
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("City must be between 2 and 80 characters."),
  body("state")
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("State must be between 2 and 80 characters."),
];

const adminLoginRules = [
  body("username").trim().notEmpty().withMessage("Username is required."),
  body("password").notEmpty().withMessage("Password is required."),
];

const rejectApplicationRules = [
  body("reason")
    .trim()
    .isLength({ min: 3, max: 300 })
    .withMessage("Rejection reason must be between 3 and 300 characters."),
];

const revokeCertificateRules = [
  body("reason")
    .trim()
    .isLength({ min: 3, max: 300 })
    .withMessage("Revocation reason must be between 3 and 300 characters."),
];

module.exports = {
  submitApplicationRules,
  adminLoginRules,
  rejectApplicationRules,
  revokeCertificateRules,
};
