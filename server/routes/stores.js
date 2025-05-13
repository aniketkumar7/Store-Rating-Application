const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticateToken, isAdmin, isStoreOwner } = require('../middleware/auth');


router.get('/', storeController.getAllStores);
router.get('/:id', storeController.getStoreById);
router.post('/', authenticateToken, isAdmin, storeController.createStore);
router.get('/dashboard/owner', authenticateToken, isStoreOwner, storeController.getStoreDashboard);


module.exports = router;
