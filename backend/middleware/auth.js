// Middleware para proteger rutas
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "No autorizado" });
  }
  next();
};

module.exports = requireLogin;
