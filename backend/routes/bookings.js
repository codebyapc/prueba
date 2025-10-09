const express = require('express');
const { validateBooking, validateBookingUpdate, validateBookingApproval, validateBookingReschedule } = require('../models/booking');
const { sendRescheduleNotification, sendApprovalNotification } = require('../services/notificationService');

const router = express.Router();

// Datos de ejemplo para desarrollo (simulando una base de datos)
let bookings = [
  {
    id: '1',
    roomId: '550e8400-e29b-41d4-a716-446655440001',
    userId: '550e8400-e29b-41d4-a716-446655440002',
    startTime: new Date(Date.now() + 86400000).toISOString(), // Mañana
    endTime: new Date(Date.now() + 90000000).toISOString(), // Mañana + 1 hora
    purpose: 'Reunión de equipo',
    status: 'approved',
    attendees: 8,
    createdAt: new Date().toISOString()
  }
];

let nextId = 2;

// Función helper para verificar conflictos de horario
const checkRoomAvailability = (roomId, startTime, endTime, excludeBookingId = null) => {
  return bookings.filter(booking => {
    // Excluir la reserva actual si se está reagendando
    if (excludeBookingId && booking.id === excludeBookingId) {
      return false;
    }

    // Verificar si hay conflicto de horario
    return booking.roomId === roomId &&
           booking.status === 'approved' &&
           startTime < booking.endTime &&
           endTime > booking.startTime;
  });
};

// GET /api/bookings - Listar todas las reservas
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/bookings/:id - Obtener una reserva específica
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const booking = bookings.find(b => b.id === id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada',
        message: `No se encontró la reserva con ID: ${id}`
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/bookings - Crear una nueva reserva
router.post('/', (req, res) => {
  try {
    const { error, value } = validateBooking(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Datos de validación inválidos',
        message: error.details.map(detail => detail.message)
      });
    }

    const newBooking = {
      id: String(nextId++),
      ...value,
      createdAt: new Date().toISOString()
    };

    bookings.push(newBooking);

    res.status(201).json({
      success: true,
      data: newBooking,
      message: 'Reserva creada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PUT /api/bookings/:id - Actualizar una reserva existente
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const bookingIndex = bookings.findIndex(b => b.id === id);

    if (bookingIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada',
        message: `No se encontró la reserva con ID: ${id}`
      });
    }

    const { error, value } = validateBookingUpdate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Datos de validación inválidos',
        message: error.details.map(detail => detail.message)
      });
    }

    // Actualizar la reserva
    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      ...value,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: bookings[bookingIndex],
      message: 'Reserva actualizada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PUT /api/bookings/:id/approve - Aprobar o rechazar una reserva
router.put('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const bookingIndex = bookings.findIndex(b => b.id === id);

    if (bookingIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada',
        message: `No se encontró la reserva con ID: ${id}`
      });
    }

    const { error, value } = validateBookingApproval(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Datos de validación inválidos',
        message: error.details.map(detail => detail.message)
      });
    }

    // Actualizar el estado de la reserva
    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      status: value.status,
      approvalReason: value.reason,
      updatedAt: new Date().toISOString()
    };

    const statusMessages = {
      approved: 'aprobada',
      rejected: 'rechazada',
      cancelled: 'cancelada'
    };

    // Enviar notificación por email al empleado
    // En una implementación real, obtendrías el email del usuario desde la base de datos
    const userEmail = `empleado${bookings[bookingIndex].userId.split('-')[0]}@empresa.com`;

    try {
      await sendApprovalNotification(bookings[bookingIndex], value.status, value.reason, userEmail);
      console.log(`📧 Notificación de ${value.status} enviada a ${userEmail}`);
    } catch (notificationError) {
      console.error(`Error enviando notificación de ${value.status}:`, notificationError);
      // No fallar la operación por error de notificación
    }

    res.json({
      success: true,
      data: bookings[bookingIndex],
      message: `Reserva ${statusMessages[value.status] || value.status} exitosamente y empleado notificado`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PUT /api/bookings/:id/reschedule - Reagendar una reserva existente
router.put('/:id/reschedule', async (req, res) => {
  try {
    const { id } = req.params;
    const bookingIndex = bookings.findIndex(b => b.id === id);

    if (bookingIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada',
        message: `No se encontró la reserva con ID: ${id}`
      });
    }

    const existingBooking = bookings[bookingIndex];

    // Solo permitir reagendar reservas aprobadas o pendientes
    if (existingBooking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Operación no permitida',
        message: 'No se puede reagendar una reserva cancelada'
      });
    }

    const { error, value } = validateBookingReschedule(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Datos de validación inválidos',
        message: error.details.map(detail => detail.message)
      });
    }

    // Si se cambia la sala o el horario, verificar disponibilidad
    if (value.roomId || value.startTime || value.endTime) {
      const newRoomId = value.roomId || existingBooking.roomId;
      const newStartTime = value.startTime ? new Date(value.startTime) : new Date(existingBooking.startTime);
      const newEndTime = value.endTime ? new Date(value.endTime) : new Date(existingBooking.endTime);

      // Verificar conflictos de horario
      const conflicts = checkRoomAvailability(newRoomId, newStartTime, newEndTime, id);

      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Conflicto de horario',
          message: `La sala ${newRoomId} no está disponible en el horario seleccionado. Hay ${conflicts.length} reserva(s) conflictiva(s).`
        });
      }

      // Actualizar horario si se proporcionó
      if (value.startTime) existingBooking.startTime = newStartTime.toISOString();
      if (value.endTime) existingBooking.endTime = newEndTime.toISOString();
    }

    // Actualizar otros campos si se proporcionaron
    if (value.roomId) existingBooking.roomId = value.roomId;
    if (value.purpose) existingBooking.purpose = value.purpose;
    if (value.attendees) existingBooking.attendees = value.attendees;
    if (value.reason) existingBooking.rescheduleReason = value.reason;

    // Marcar como reagendada
    existingBooking.status = 'approved'; // Mantener como aprobada o cambiar a pendiente según necesidad
    existingBooking.rescheduledAt = new Date().toISOString();
    existingBooking.updatedAt = new Date().toISOString();

    // Preparar datos para notificación
    const changes = {};
    if (value.roomId && value.roomId !== existingBooking.roomId) {
      changes.roomId = value.roomId;
    }
    if (value.startTime && new Date(value.startTime).getTime() !== new Date(existingBooking.startTime).getTime()) {
      changes.startTime = existingBooking.startTime;
    }
    if (value.endTime && new Date(value.endTime).getTime() !== new Date(existingBooking.endTime).getTime()) {
      changes.endTime = existingBooking.endTime;
    }
    if (value.purpose && value.purpose !== existingBooking.purpose) {
      changes.purpose = value.purpose;
    }
    if (value.attendees && value.attendees !== existingBooking.attendees) {
      changes.attendees = value.attendees;
    }

    // Enviar notificación por email al empleado (simulado)
    // En una implementación real, obtendrías el email del usuario desde la base de datos
    const userEmail = `empleado${existingBooking.userId.split('-')[0]}@empresa.com`;

    try {
      await sendRescheduleNotification(existingBooking, existingBooking, changes, userEmail);
      console.log(`📧 Notificación de reagendado enviada a ${userEmail}`);
    } catch (notificationError) {
      console.error('Error enviando notificación de reagendado:', notificationError);
      // No fallar la operación por error de notificación
    }

    res.json({
      success: true,
      data: existingBooking,
      message: 'Reserva reagendada exitosamente y empleado notificado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/bookings/:id - Cancelar una reserva
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const bookingIndex = bookings.findIndex(b => b.id === id);

    if (bookingIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada',
        message: `No se encontró la reserva con ID: ${id}`
      });
    }

    const deletedBooking = bookings.splice(bookingIndex, 1)[0];

    res.json({
      success: true,
      data: deletedBooking,
      message: 'Reserva cancelada exitosamente'
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