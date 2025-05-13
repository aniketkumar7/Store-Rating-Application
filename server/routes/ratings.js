const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticateToken } = require('../middleware/auth');


router.post('/', authenticateToken, ratingController.submitRating);
router.get('/store/:store_id', ratingController.getStoreRatings);

module.exports = router;
