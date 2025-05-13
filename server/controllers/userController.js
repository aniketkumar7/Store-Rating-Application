const bcrypt = require('bcrypt');
const { pool } = require('../db/db');
const { validateName, validateEmail, validatePassword, validateAddress } = require('../utils/validation');


exports.getAllUsers = async (req, res) => {
  try {
    const { name, email, address, role } = req.query;

    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
      (SELECT AVG(r.rating) FROM ratings r
      INNER JOIN stores s ON r.store_id = s.id
      WHERE s.owner_id = u.id) as average_rating
      FROM users u
      WHERE 1=1
    `;

    const params = [];

    if (name) {
      query += ' AND u.name LIKE ?';
      params.push(`%${name}%`);
    }

    if (email) {
      query += ' AND u.email LIKE ?';
      params.push(`%${email}%`);
    }

    if (address) {
      query += ' AND u.address LIKE ?';
      params.push(`%${address}%`);
    }

    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }

    query += ' ORDER BY u.name ASC';

    const [users] = await pool.query(query, params);

    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};


exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const [users] = await pool.query(`
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
      (SELECT AVG(r.rating) FROM ratings r
      INNER JOIN stores s ON r.store_id = s.id
      WHERE s.owner_id = u.id) as average_rating
      FROM users u
      WHERE u.id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(users[0]);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
};




exports.createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return res.status(400).json({ message: nameValidation.message });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const addressValidation = validateAddress(address);
    if (!addressValidation.valid) {
      return res.status(400).json({ message: addressValidation.message });
    }

    const validRoles = ['admin', 'user', 'store_owner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );

    const [newUser] = await pool.query(
      'SELECT id, name, email, address, role FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: newUser[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error while creating user' });
  }
};


exports.getDashboardStats = async (req, res) => {
  try {
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [storeCount] = await pool.query('SELECT COUNT(*) as count FROM stores');
    const [ratingCount] = await pool.query('SELECT COUNT(*) as count FROM ratings');

    res.status(200).json({
      totalUsers: userCount[0].count,
      totalStores: storeCount[0].count,
      totalRatings: ratingCount[0].count
    });
  } catch (error) {
    console.error('Error getting dashboard statistics:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard statistics' });
  }
};


