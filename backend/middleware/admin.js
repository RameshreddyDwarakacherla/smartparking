const Admin = require('../models/Admin');

const adminMiddleware = async (req, res, next) => {
  try {
    // Check if user has admin role from JWT
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Verify admin exists and is active
    const admin = await Admin.findById(req.user.id);
    if (!admin || admin.status !== 'active') {
      return res.status(403).json({ message: 'Access denied. Invalid or inactive admin account.' });
    }

    // Add admin type and permissions to request
    req.adminType = admin.adminType;
    req.permissions = admin.permissions;

    // Check specific permissions if required
    if (req.requiredPermission && !admin.hasPermission(req.requiredPermission)) {
      return res.status(403).json({ 
        message: `Access denied. Required permission: ${req.requiredPermission}` 
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error in admin verification' });
  }
};

// Helper middleware to check specific permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    req.requiredPermission = permission;
    next();
  };
};

module.exports = {
  admin: adminMiddleware,
  requirePermission
};
