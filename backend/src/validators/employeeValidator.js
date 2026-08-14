const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }
  next();
};

exports.validateCreateEmployee = [
  body("name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Employee name is required."),
  body("phone")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Employee phone number is required."),
  body("position")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Employee position title is required."),
  body("specialization").optional().isString().trim(),
  body("experienceYears")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Experience years must be a positive integer."),
  body("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("isAvailable must be a boolean value."),
  handleValidationErrors,
];

exports.validateUpdateEmployee = [
  body("name")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty."),
  body("phone")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Phone cannot be empty."),
  body("position")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Position cannot be empty."),
  body("specialization").optional().isString().trim(),
  body("experienceYears")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Experience years must be a positive integer."),
  body("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("isAvailable must be a boolean value."),
  handleValidationErrors,
];

exports.validateAssignServices = [
  body("serviceIds")
    .exists()
    .withMessage("An array of service IDs is required.")
    .isArray({ min: 1 })
    .withMessage(
      "serviceIds must be an array containing at least one service ID.",
    )
    .custom((value) => {
      if (value.some((id) => !Number.isInteger(id))) {
        throw new Error("All service IDs must be valid integers.");
      }
      return true;
    }),
  handleValidationErrors,
];
