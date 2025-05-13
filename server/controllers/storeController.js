const { pool } = require('../db/db');
const { validateName, validateEmail, validateAddress } = require('../utils/validation');


exports.getAllStores = async (req, res) => {
  try {
    const { name, address } = req.query;
    const userId = req.user ? req.user.id : null;

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id,
      (SELECT AVG(r.rating) FROM ratings r WHERE r.store_id = s.id) as average_rating
    `;

    if (userId) {
      query += `, (SELECT r.rating FROM ratings r WHERE r.store_id = s.id AND r.user_id = ?) as user_rating`;
    }

    query += ` FROM stores s WHERE 1=1`;

    const params = userId ? [userId] : [];


    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }

    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    query += ' ORDER BY s.name ASC';

    const [stores] = await pool.query(query, params);

    res.status(200).json(stores);
  } catch (error) {
    console.error('Error getting stores:', error);
    res.status(500).json({ message: 'Server error while fetching stores' });
  }
};


exports.getStoreById = async (req, res) => {
  try {
    const storeId = req.params.id;
    const userId = req.user ? req.user.id : null;

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id,
      (SELECT AVG(r.rating) FROM ratings r WHERE r.store_id = s.id) as average_rating
    `;


    if (userId) {
      query += `, (SELECT r.rating FROM ratings r WHERE r.store_id = s.id AND r.user_id = ?) as user_rating`;
    }

    query += ` FROM stores s WHERE s.id = ?`;

    const params = userId ? [userId, storeId] : [storeId];

    const [stores] = await pool.query(query, params);

    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.status(200).json(stores[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching store' });
  }
};

// Create a new store (admin only)
exports.createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    if (!name || !email || !address) {
      return res.status(400).json({ message: 'Name, email, and address are required' });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    const addressValidation = validateAddress(address);
    if (!addressValidation.valid) {
      return res.status(400).json({ message: addressValidation.message });
    }

    const [existingStores] = await pool.query('SELECT * FROM stores WHERE email = ?', [email]);

    if (existingStores.length > 0) {
      return res.status(400).json({ message: 'Store with this email already exists' });
    }

    if (owner_id) {
      const [owners] = await pool.query('SELECT * FROM users WHERE id = ? AND role = ?', [owner_id, 'store_owner']);

      if (owners.length === 0) {
        return res.status(400).json({ message: 'Invalid owner ID or user is not a store owner' });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id || null]
    );

    const [newStore] = await pool.query(
      'SELECT id, name, email, address, owner_id FROM stores WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Store created successfully',
      store: newStore[0]
    });
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ message: 'Server error while creating store' });
  }
};


exports.getStoreDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Get store information
    const [stores] = await pool.query('SELECT * FROM stores WHERE owner_id = ?', [ownerId]);

    if (stores.length === 0) {
      return res.status(404).json({ message: 'No store found for this owner' });
    }

    const store = stores[0];


    const [ratingResult] = await pool.query(
      'SELECT AVG(rating) as average_rating FROM ratings WHERE store_id = ?',
      [store.id]
    );

    const averageRating = ratingResult[0].average_rating || 0;

    const [raters] = await pool.query(`
      SELECT u.id, u.name, u.email, r.rating, r.created_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [store.id]);

    res.status(200).json({
      store,
      averageRating,
      raters
    });
  } catch (error) {
    console.error('Error getting store dashboard:', error);
    res.status(500).json({ message: 'Server error while fetching store dashboard' });
  }
};
