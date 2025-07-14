const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// ─────────────────────────────────────────────
// 🔹 GET: Obtener detalle de un evento por ID
// ─────────────────────────────────────────────
router.get('/api/event/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT e.*, 
             u.username AS created_by,
             el.name AS location_name,
             l.name AS locality,
             p.name AS province,
             array_agg(t.name) AS tags
      FROM events e
      JOIN users u ON u.id = e.id_user
      JOIN event_locations el ON el.id = e.id_event_location
      JOIN localities l ON l.id = el.id_locality
      JOIN provinces p ON p.id = l.id_province
      LEFT JOIN event_tags et ON et.id_event = e.id
      LEFT JOIN tags t ON t.id = et.id_tag
      WHERE e.id = $1
      GROUP BY e.id, u.username, el.name, l.name, p.name;
    `;

    const result = await pool.query(query, [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Evento no encontrado.' });

    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error('Error al obtener evento:', err);
    res.status(500).json({ message: 'Error del servidor.' });
  }
});

// ─────────────────────────────────────────────
// 🔹 POST: Crear evento (requiere login)
// ─────────────────────────────────────────────
router.post('/api/event', auth, async (req, res) => {
  const {
    name, description, event_date,
    duration_in_minutes, price,
    is_active, max_capacity,
    max_assistance, id_event_location
  } = req.body;

  // Validaciones básicas
  if (!name || name.length < 3 || !description || description.length < 3)
    return res.status(400).json({ message: 'Nombre y descripción deben tener al menos 3 caracteres.' });

  if (price < 0 || duration_in_minutes < 0)
    return res.status(400).json({ message: 'Precio y duración deben ser mayores o iguales a 0.' });

  if (max_assistance > max_capacity)
    return res.status(400).json({ message: 'max_assistance no puede superar max_capacity.' });

  try {
    const insertQuery = `
      INSERT INTO events 
      (name, description, event_date, duration_in_minutes, price, is_active, 
       max_capacity, max_assistance, id_event_location, id_user)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `;

    const values = [
      name, description, event_date,
      duration_in_minutes, price, is_active,
      max_capacity, max_assistance,
      id_event_location, req.user.id
    ];

    const result = await pool.query(insertQuery, values);
    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Error al crear evento:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// ─────────────────────────────────────────────
// 🔹 PUT: Editar evento (requiere ser el creador)
// ─────────────────────────────────────────────
router.put('/api/event', auth, async (req, res) => {
  const {
    id, name, description, event_date,
    duration_in_minutes, price,
    is_active, max_capacity,
    max_assistance, id_event_location
  } = req.body;

  if (!id) return res.status(400).json({ message: 'Falta el ID del evento a editar.' });

  if (!name || name.length < 3 || !description || description.length < 3)
    return res.status(400).json({ message: 'Nombre y descripción deben tener al menos 3 caracteres.' });

  if (price < 0 || duration_in_minutes < 0)
    return res.status(400).json({ message: 'Precio y duración deben ser mayores o iguales a 0.' });

  if (max_assistance > max_capacity)
    return res.status(400).json({ message: 'max_assistance no puede superar max_capacity.' });

  try {
    const eventCheck = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    const event = eventCheck.rows[0];

    if (!event)
      return res.status(404).json({ message: 'Evento no encontrado.' });

    if (event.id_user !== req.user.id)
      return res.status(404).json({ message: 'No podés editar un evento que no es tuyo.' });

    const updateQuery = `
      UPDATE events SET
        name = $1, description = $2, event_date = $3,
        duration_in_minutes = $4, price = $5, is_active = $6,
        max_capacity = $7, max_assistance = $8, id_event_location = $9
      WHERE id = $10
      RETURNING *;
    `;

    const values = [
      name, description, event_date,
      duration_in_minutes, price, is_active,
      max_capacity, max_assistance, id_event_location,
      id
    ];

    const result = await pool.query(updateQuery, values);
    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error('Error al editar evento:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// ─────────────────────────────────────────────
// 🔹 DELETE: Borrar evento (requiere ser el creador)
// ─────────────────────────────────────────────
router.delete('/api/event/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const eventCheck = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    const event = eventCheck.rows[0];

    if (!event)
      return res.status(404).json({ message: 'Evento no encontrado.' });

    if (event.id_user !== req.user.id)
      return res.status(404).json({ message: 'No podés borrar un evento que no es tuyo.' });

    // Chequear si hay inscriptos
    const registrations = await pool.query(
      'SELECT * FROM event_registrations WHERE id_event = $1',
      [id]
    );
    if (registrations.rows.length > 0)
      return res.status(400).json({ message: 'No se puede eliminar el evento: ya tiene inscriptos.' });

    await pool.query('DELETE FROM events WHERE id = $1', [id]);
    res.status(200).json({ message: 'Evento eliminado correctamente.' });

  } catch (err) {
    console.error('Error al eliminar evento:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

module.exports = router;
