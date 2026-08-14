exports.validateCategoryInput = (req, res, next) => {
  const { name } = req.body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Category name is required and must be a valid text string.",
    });
  }
  next();
};

exports.validateSalonCreate = (req, res, next) => {
  const required = [
    "name",
    "phone",
    "email",
    "country",
    "city",
    "subCity",
    "address",
    "description",
  ];
  const missing = required.filter((field) => !req.body[field]);

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required salon operational parameters: [${missing.join(", ")}].`,
    });
  }
  next();
};

exports.validateOwnerCreate = (req, res, next) => {
  const { fullName, phone, password } = req.body;
  if (!fullName || !phone || !password) {
    return res.status(400).json({
      success: false,
      message:
        "Validation Error: Owner provisioning requires a fullName, a unique phone number, and a temporary password configuration.",
    });
  }
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message:
        "Validation Error: The structural password must be at least 6 characters long.",
    });
  }
  next();
};

exports.validateAssignOwner = (req, res, next) => {
  const { salonId, ownerId } = req.body;
  if (!salonId || !ownerId) {
    return res.status(400).json({
      success: false,
      message:
        "Assignment actions require explicit salonId and ownerId targets.",
    });
  }
  next();
};
