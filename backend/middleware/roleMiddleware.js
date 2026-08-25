// Pure role gate - use for routes where the role alone decides access.
// For "owner OR admin" logic (like file delete/download above), that stays
// as an inline check in the controller since it depends on the resource, not just the role.
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

module.exports = { authorize };