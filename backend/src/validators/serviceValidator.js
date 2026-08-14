const { body, param, validationResult } = require("express-validator");

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

exports.validateCreateService = [
  body("categoryId").isInt().withMessage("Category is required."),

  body("name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Service name is required."),

  body("description").optional().isString(),

  body("price").isFloat({ min: 0 }).withMessage("Price must be valid."),

  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration must be in minutes."),

  handleValidationErrors,
];

exports.validateUpdateService = [
  // 1. Validate URL param :id so invalid/missing IDs fail here gracefully instead of crashing Sequelize
  param("id")
    .isInt({ min: 1 })
    .withMessage("Service ID in URL must be a valid integer."),

  body("categoryId").optional().isInt(),

  body("name").optional().isString().trim(),

  body("description").optional().isString(),

  body("price").optional().isFloat({ min: 0 }),

  body("duration").optional().isInt({ min: 1 }),

  handleValidationErrors,
];
