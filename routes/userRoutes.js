const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const JWT_SECRET = 'tu_clave_secreta'; // ⚠️ Usá env en producción

// REGISTRO
router.post('/api/user/register', async (req, res) => {
  const { first_name, last_name, username, password } = req.body;

  // Validaciones
  if (!first_name || first_name.length < 3 || !last_name || last_name.length < 3) {
    return res.status(400).json({ message: 'El nombre y apellido deben tener al menos 3 letras.' });
  }

  if (!validator.isEmail(username)) {
    return res.status(400).json({ message: 'El email es invalido.' });
  }

  if (!password || password.length < 3) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 3 caracteres.' });
  }

  try {
    // Verificar si ya existe
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2, $3, $4)',
      [first_name, last_name, username, hashedPassword]
    );

    res.status(201).json({ message: 'Usuario registrado exitosamente.' });

  } catch (err) {
    console.error('Error en el registro:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// LOGIN
router.post('/api/user/login', async (req, res) => {
  const { username, password } = req.body;

  if (!validator.isEmail(username)) {
    return res.status(400).json({
      success: false,
      message: 'El email es invalido.',
      token: ''
    });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o clave inválida.',
        token: ''
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o clave inválida.',
        token: ''
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        first_name: user.first_name,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      message: '',
      token
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      token: ''
    });
  }
});

module.exports = router;