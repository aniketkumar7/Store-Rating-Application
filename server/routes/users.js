const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/auth');


router.get('/', authenticateToken, isAdmin, userController.getAllUsers);
router.get('/:id', authenticateToken, isAdmin, userController.getUserById);
router.post('/', authenticateToken, isAdmin, userController.createUser);
router.get('/stats/dashboard', authenticateToken, isAdmin, userController.getDashboardStats);


module.exports = router;
