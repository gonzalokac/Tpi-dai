const EventLocation = require('../models/EventLocation');

// Obtener todos los lugares del usuario autenticado
const getAllEventLocations = async (req, res) => {
  try {
    const locations = await EventLocation.findAll({
      where: { id_user: req.user.id }
    });
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener uno por ID (sólo si es del usuario)
const getEventLocationById = async (req, res) => {
  try {
    const location = await EventLocation.findOne({
      where: { id: req.params.id, id_user: req.user.id }
    });

    if (!location) return res.status(404).json({ message: 'No encontrado o no autorizado' });

    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear uno nuevo
const createEventLocation = async (req, res) => {
  try {
    const { name, address, city, province, max_capacity } = req.body;

    if (!name || !address || !city || !province || max_capacity == null) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const newLocation = await EventLocation.create({
      name,
      address,
      city,
      province,
      max_capacity,
      id_user: req.user.id
    });

    res.status(201).json(newLocation);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear ubicación' });
  }
};

// Actualizar uno (si es del usuario)
const updateEventLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await EventLocation.findOne({
      where: { id, id_user: req.user.id }
    });

    if (!location) return res.status(404).json({ message: 'No encontrado o no autorizado' });

    await location.update(req.body);
    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar' });
  }
};

// Eliminar uno (si es del usuario)
const deleteEventLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await EventLocation.findOne({
      where: { id, id_user: req.user.id }
    });

    if (!location) return res.status(404).json({ message: 'No encontrado o no autorizado' });

    await location.destroy();
    res.status(200).json({ message: 'Eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar' });
  }
};

module.exports = {
  getAllEventLocations,
  getEventLocationById,
  createEventLocation,
  updateEventLocation,
  deleteEventLocation
};
