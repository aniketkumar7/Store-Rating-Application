const { pool } = require('../db/db');
const { validateRating } = require('../utils/validation');


exports.submitRating = async (req, res) => {
  try {
    const { store_id, rating } = req.body;
    const user_id = req.user.id;


    if (!store_id) {
      return res.status(400).json({ message: 'Store ID is required' });
    }

    const ratingValidation = validateRating(rating);
    if (!ratingValidation.valid) {
      return res.status(400).json({ message: ratingValidation.message });
    }


    const [stores] = await pool.query('SELECT * FROM stores WHERE id = ?', [store_id]);

    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }


    const [existingRatings] = await pool.query(
      'SELECT * FROM ratings WHERE user_id = ? AND store_id = ?',
      [user_id, store_id]
    );

    if (existingRatings.length > 0) {

      await pool.query(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
        [rating, user_id, store_id]
      );

      res.status(200).json({ message: 'Rating updated successfully' });
    } else {

      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [user_id, store_id, rating]
      );

      res.status(201).json({ message: 'Rating submitted successfully' });
    }
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ message: 'Server error while submitting rating' });
  }
};


exports.getStoreRatings = async (req, res) => {
  try {
    const { store_id } = req.params;


    const [stores] = await pool.query('SELECT * FROM stores WHERE id = ?', [store_id]);

    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }


    const [ratings] = await pool.query(`
      SELECT r.id, r.rating, r.created_at, r.updated_at,
      u.id as user_id, u.name as user_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [store_id]);


    const [avgRating] = await pool.query(
      'SELECT AVG(rating) as average_rating FROM ratings WHERE store_id = ?',
      [store_id]
    );

    res.status(200).json({
      ratings,
      averageRating: avgRating[0].average_rating || 0,
      totalRatings: ratings.length
    });
  } catch (error) {
    console.error('Error getting store ratings:', error);
    res.status(500).json({ message: 'Server error while fetching store ratings' });
  }
};
