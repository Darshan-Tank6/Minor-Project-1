const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) return next();
    res.status(403).send("Access Denied");
  };
};

module.exports = { ensureAuthenticated, checkRole };
