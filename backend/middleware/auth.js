/**
 * Middleware de autenticación.
 * Verifica que el usuario esté logueado antes de acceder a rutas protegidas.
 */

// Middleware para proteger rutas
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Sesión expirada o no iniciada. Inicie sesión nuevamente." });
  }
  next();
};

module.exports = requireLogin;
