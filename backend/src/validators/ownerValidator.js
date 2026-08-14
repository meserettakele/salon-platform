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

// Validates military time format (HH:MM) required by Sequelize TIME column data types
const time24HourRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const validDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

exports.validateUpdateSalon = [
  body("name")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Salon name cannot be empty."),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address."),
  body("phone")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Contact phone number cannot be empty."),
  body("address")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Address details cannot be empty."),
  body("subCity")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Sub-city detail cannot be empty."),
  body("city")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City detail cannot be empty."),
  body("description").optional().isString().trim(),
  handleValidationErrors,
];

exports.validateBusinessHours = [
  body("businessHours")
    .exists()
    .withMessage("Business hours operational array payload is required.")
    .isArray({ min: 1 })
    .withMessage("Business hours must be an array of daily schedules.")
    .custom((value) => {
      const daysSeen = new Set();
      for (const entry of value) {
        if (!entry.day) continue;
        const normalizedDay = entry.day.trim();
        if (daysSeen.has(normalizedDay)) {
          throw new Error(`Duplicate entry found for day: ${entry.day}.`);
        }
        daysSeen.add(normalizedDay);
      }
      return true;
    }),
  body("businessHours.*.day")
    .exists()
    .withMessage("Each schedule entry requires a day value.")
    .isIn(validDays)
    .withMessage("Day must match a valid ENUM value (e.g., Monday, Tuesday)."),
  body("businessHours.*.isClosed")
    .exists()
    .withMessage("The isClosed status configuration flag is required.")
    .isBoolean()
    .withMessage("isClosed must be an explicit boolean value (true or false)."),
  body("businessHours.*.openingTime")
    .if((value, { req, path }) => {
      // Extract indices to find the exact sibling row being validated
      const index = path.split("[")[1].split("]")[0];
      const entry = req.body.businessHours[index];
      // Run validation only if the salon is explicitly OPEN (isClosed is false)
      return entry && entry.isClosed === false;
    })
    .exists()
    .withMessage(
      "Opening time is required when the salon is open for operations.",
    )
    .matches(time24HourRegex)
    .withMessage(
      "Opening time must use a strict 24-hour format (e.g., 08:00 or 14:30).",
    ),
  body("businessHours.*.closingTime")
    .if((value, { req, path }) => {
      const index = path.split("[")[1].split("]")[0];
      const entry = req.body.businessHours[index];
      return entry && entry.isClosed === false;
    })
    .exists()
    .withMessage(
      "Closing time is required when the salon is open for operations.",
    )
    .matches(time24HourRegex)
    .withMessage(
      "Closing time must use a strict 24-hour format (e.g., 17:00 or 22:00).",
    ),
  handleValidationErrors,
];
