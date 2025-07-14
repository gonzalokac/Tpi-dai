const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware'); // JWT middleware
const controller = require('../controllers/eventLocation.controller');

// Proteger todas las rutas con auth
router.use(auth);

// Listar todos los event-locations del usuario
router.get('/', controller.getAllEventLocations);

// Obtener uno por ID
router.get('/:id', controller.getEventLocationById);

// Crear uno nuevo
router.post('/', controller.createEventLocation);

// Editar uno
router.put('/:id', controller.updateEventLocation);

// Eliminar uno
router.delete('/:id', controller.deleteEventLocation);

module.exports = router;