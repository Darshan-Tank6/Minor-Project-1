function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash("error_msg", "Please log in to view that resource");
  res.redirect("/auth/login");
}

const checkRole = (roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      return next();
    }
    req.flash("error_msg", "You do not have permission to view this resource");
    res.status(403).send("Access Denied");
  };
};

function noCache(req, res, next) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
}

module.exports = { ensureAuthenticated, checkRole, noCache };
