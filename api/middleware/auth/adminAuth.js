/**
 * Admin authentication middleware
 * Ensures only admin users can access protected routes
 */
export const adminAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }

  if (req.session.user.role !== 'admin') {
    return res.redirect('/');
  }

  next();
};
