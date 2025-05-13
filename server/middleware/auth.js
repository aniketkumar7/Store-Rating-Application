const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  }
  catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};


const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};


const isStoreOwner = (req, res, next) => {
  if (req.user.role !== 'store_owner') {
    return res.status(403).json({ message: 'Access denied. Store owner privileges required.' });
  }
  next();
};


const isUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Access denied. User privileges required.' });
  }
  next();
};


const isAdminOrStoreOwner = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'store_owner') {
    return res.status(403).json({ message: 'Access denied. Admin or store owner privileges required.' });
  }
  next();
};

module.exports = {
  authenticateToken,
  isAdmin,
  isStoreOwner,
  isUser,
  isAdminOrStoreOwner
};
