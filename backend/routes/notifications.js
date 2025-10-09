const express = require('express');
const { validateNotification, validateNotificationUpdate } = require('../models/notification');
const { sendNotification } = require('../services/notificationService');

const router = express.Router();

// Datos de ejemplo para desarrollo (simulando una base de datos)
let notifications = [];
let nextId = 1;

// GET /api/notifications - Listar todas las notificaciones
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/notifications/:id - Obtener una notificación específica
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const notification = notifications.find(n => n.id === id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notificación no encontrada',
        message: `No se encontró la notificación con ID: ${id}`
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/notifications - Crear una nueva notificación
router.post('/', async (req, res) => {
  try {
    const { error, value } = validateNotification(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Datos de validación inválidos',
        message: error.details.map(detail => detail.message)
      });
    }

    const newNotification = {
      id: String(nextId++),
      ...value,
      createdAt: new Date().toISOString()
    };

    notifications.push(newNotification);

    // Intentar enviar la notificación inmediatamente
    try {
      const result = await sendNotification(newNotification);

      if (result.success) {
        newNotification.status = 'sent';
        newNotification.sentAt = result.sentAt;
        console.log(`📧 Notificación ${newNotification.id} enviada exitosamente`);
      } else {
        newNotification.status = 'failed';
        console.error(`❌ Error enviando notificación ${newNotification.id}:`, result.error);
      }
    } catch (sendError) {
      newNotification.status = 'failed';
      console.error(`❌ Error enviando notificación ${newNotification.id}:`, sendError.message);
    }

    res.status(201).json({
      success: true,
      data: newNotification,
      message: 'Notificación creada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PUT /api/notifications/:id - Actualizar una notificación existente
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const notificationIndex = notifications.findIndex(n => n.id === id);

    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Notificación no encontrada',
        message: `No se encontró la notificación con ID: ${id}`
      });
    }

    const { error, value } = validateNotificationUpdate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Datos de validación inválidos',
        message: error.details.map(detail => detail.message)
      });
    }

    // Actualizar la notificación
    notifications[notificationIndex] = {
      ...notifications[notificationIndex],
      ...value,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: notifications[notificationIndex],
      message: 'Notificación actualizada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/notifications/:id/resend - Reenviar una notificación
router.post('/:id/resend', async (req, res) => {
  try {
    const { id } = req.params;
    const notificationIndex = notifications.findIndex(n => n.id === id);

    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Notificación no encontrada',
        message: `No se encontró la notificación con ID: ${id}`
      });
    }

    const notification = notifications[notificationIndex];

    try {
      const result = await sendNotification(notification);

      if (result.success) {
        notification.status = 'sent';
        notification.sentAt = result.sentAt;
        console.log(`📧 Notificación ${id} reenviada exitosamente`);
      } else {
        notification.status = 'failed';
        console.error(`❌ Error reenviando notificación ${id}:`, result.error);
      }
    } catch (sendError) {
      notification.status = 'failed';
      console.error(`❌ Error reenviando notificación ${id}:`, sendError.message);
    }

    res.json({
      success: true,
      data: notification,
      message: 'Notificación reenviada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/notifications/:id - Eliminar una notificación
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const notificationIndex = notifications.findIndex(n => n.id === id);

    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Notificación no encontrada',
        message: `No se encontró la notificación con ID: ${id}`
      });
    }

    const deletedNotification = notifications.splice(notificationIndex, 1)[0];

    res.json({
      success: true,
      data: deletedNotification,
      message: 'Notificación eliminada exitosamente'
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