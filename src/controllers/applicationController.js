const Application = require("../models/Application");

exports.submitApplication = (req, res, next) => {
  try {
    const { name, phone, gender, city, state } = req.body;
    const application = Application.create({ name, phone, gender, city, state });
    res.status(201).json({
      message: "Application submitted successfully.",
      application,
    });
  } catch (err) {
    next(err);
  }
};

exports.trackApplication = (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const application = Application.findByApplicationId(applicationId);
    if (!application) {
      return res.status(404).json({
        error: "Not Found",
        message: `No application found with ID '${applicationId}'.`,
      });
    }
    res.json({ application });
  } catch (err) {
    next(err);
  }
};
