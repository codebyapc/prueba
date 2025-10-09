const express = require('express');
const { validateRoom, validateRoomUpdate } = require('../models/room');

const router = express.Router();

// Datos de ejemplo para desarrollo (simulando una base de datos)
let rooms = [
  {
    id: '1',
    name: 'Sala de reuniones A',
    center: 'Centro Principal',
    capacity: 10,
    status: 'available',
    description: 'Sala equipada con proyector y pizarra',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Auditorio',
    center: 'Centro Principal',
    capacity: 50,
    status: 'available',
    description: 'Auditorio con capacidad para 50 personas',
    createdAt: new Date().toISOString()
  }
];

let nextId = 3;

// GET /api/rooms - Listar todas las salas
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: rooms,
      count: rooms.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/rooms/:id - Obtener una sala específica
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const room = rooms.find(r => r.id === id);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Sala no encontrada',
        message: `No se encontró la sala con ID: ${id}`
      });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/rooms - Crear una nueva sala
router.post('/', (req, res) => {
  try {
    const { error, value } = validateRoom(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Datos de validación inválidos',
        message: error.details.map(detail => detail.message)
      });
    }

    const newRoom = {
      id: String(nextId++),
      ...value,
      createdAt: new Date().toISOString()
    };

    rooms.push(newRoom);

    res.status(201).json({
      success: true,
      data: newRoom,
      message: 'Sala creada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PUT /api/rooms/:id - Actualizar una sala existente
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const roomIndex = rooms.findIndex(r => r.id === id);

    if (roomIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Sala no encontrada',
        message: `No se encontró la sala con ID: ${id}`
      });
    }

    const { error, value } = validateRoomUpdate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Datos de validación inválidos',
        message: error.details.map(detail => detail.message)
      });
    }

    // Actualizar la sala
    rooms[roomIndex] = {
      ...rooms[roomIndex],
      ...value,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: rooms[roomIndex],
      message: 'Sala actualizada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/rooms/:id - Eliminar una sala
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const roomIndex = rooms.findIndex(r => r.id === id);

    if (roomIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Sala no encontrada',
        message: `No se encontró la sala con ID: ${id}`
      });
    }

    const deletedRoom = rooms.splice(roomIndex, 1)[0];

    res.json({
      success: true,
      data: deletedRoom,
      message: 'Sala eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

module.exports = router;