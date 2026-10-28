const jwt = require('jsonwebtoken');

// 1) Token check karta hai: user login hai ya nahi
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  // Header aisa hona chahiye:  Authorization: Bearer <token>
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Login required. Token nahi mila.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid ya expire ho gaya hai.' });
  }
};

// 2) Role check karta hai (RBAC)
// Example: router.get('/all', verifyToken, authorizeRoles('admin'), handler)
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Aap ko is kaam ki ijazat nahi hai.' });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };
