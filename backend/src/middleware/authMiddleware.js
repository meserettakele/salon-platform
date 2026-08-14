const { verifyToken } = require("../utils/jwtHelper");
const { User } = require("../models");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = verifyToken(token);

      // Decoded identity matches native INTEGER values
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });

      if (!req.user || !req.user.isActive) {
        return res
          .status(401)
          .json({
            message: "Authorization failed: Account is inactive or missing.",
          });
      }

      return next();
    } catch (error) {
      return res
        .status(401)
        .json({
          message: "Authorization failed: Token validation signature error.",
        });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authorization failed: No token headers found." });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Access restricted for user role: [${req.user ? req.user.role : "GUEST"}]`,
      });
    }
    return next();
  };
};

module.exports = { protect, authorize };
