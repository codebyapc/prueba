const express = require('express');
const { validateCenter, validateCenterUpdate } = require('../models/center');

const router = express.Router();

// Datos de ejemplo para desarrollo (simulando una base de datos)
let centers = [
  {
    id: '1',
    name: 'Centro Principal',
    address: 'Calle Principal 123, Ciudad Ejemplo',
    phone: '+34 912 345 678',
    email: 'info@centroprincipal.com',
    description: 'Centro principal de la organización',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Centro Norte',
    address: 'Avenida Norte 456, Ciudad Ejemplo',
    phone: '+34 912 345 679',
    email: 'info@centronorte.com',
    description: 'Centro ubicado en la zona norte',
    createdAt: new Date().toISOString()
  }
];

let nextId = 3;

// GET /api/centers - Listar todos los centros
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: centers,
      count: centers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/centers/:id - Obtener un centro específico
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const center = centers.find(c => c.id === id);

    if (!center) {
      return res.status(404).json({
        success: false,
        error: 'Centro no encontrado',
        message: `No se encontró el centro con ID: ${id}`
      });
    }

    res.json({
      success: true,
      data: center
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/centers - Crear un nuevo centro
router.post('/', (req, res) => {
  try {
    const { error, value } = validateCenter(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Datos de validación inválidos',
        message: error.details.map(detail => detail.message)
      });
    }

    const newCenter = {
      id: String(nextId++),
      ...value,
      createdAt: new Date().toISOString()
    };

    centers.push(newCenter);

    res.status(201).json({
      success: true,
      data: newCenter,
      message: 'Centro creado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PUT /api/centers/:id - Actualizar un centro existente
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const centerIndex = centers.findIndex(c => c.id === id);

    if (centerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Centro no encontrado',
        message: `No se encontró el centro con ID: ${id}`
      });
    }

    const { error, value } = validateCenterUpdate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Datos de validación inválidos',
        message: error.details.map(detail => detail.message)
      });
    }

    // Actualizar el centro
    centers[centerIndex] = {
      ...centers[centerIndex],
      ...value,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: centers[centerIndex],
      message: 'Centro actualizado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/centers/:id - Eliminar un centro
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const centerIndex = centers.findIndex(c => c.id === id);

    if (centerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Centro no encontrado',
        message: `No se encontró el centro con ID: ${id}`
      });
    }

    const deletedCenter = centers.splice(centerIndex, 1)[0];

    res.json({
      success: true,
      data: deletedCenter,
      message: 'Centro eliminado exitosamente'
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