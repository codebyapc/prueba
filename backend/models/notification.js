const Joi = require('joi');

// Esquema de validación para Notificación
const notificationSchema = Joi.object({
  userId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'El ID del usuario debe ser un UUID válido',
      'any.required': 'El ID del usuario es requerido'
    }),

  bookingId: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.empty': 'El ID de la reserva es requerido',
      'any.required': 'El ID de la reserva es requerido'
    }),

  type: Joi.string()
    .valid('booking_rescheduled', 'booking_approved', 'booking_rejected', 'booking_cancelled')
    .required()
    .messages({
      'any.only': 'El tipo debe ser: booking_rescheduled, booking_approved, booking_rejected o booking_cancelled'
    }),

  title: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'El título de la notificación es requerido',
      'string.max': 'El título no puede exceder 200 caracteres',
      'any.required': 'El título de la notificación es requerido'
    }),

  message: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'El mensaje de la notificación es requerido',
      'string.max': 'El mensaje no puede exceder 1000 caracteres',
      'any.required': 'El mensaje de la notificación es requerido'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Debe ser un email válido',
      'any.required': 'El email es requerido'
    }),

  sentAt: Joi.date()
    .optional(),

  status: Joi.string()
    .valid('pending', 'sent', 'failed')
    .default('pending')
    .messages({
      'any.only': 'El estado debe ser: pending, sent o failed'
    }),

  metadata: Joi.object()
    .optional()
});

// Función para validar datos de notificación
const validateNotification = (data) => {
  return notificationSchema.validate(data, { abortEarly: false });
};

// Función para validar actualización de notificación
const validateNotificationUpdate = (data) => {
  const updateSchema = Joi.object({
    status: Joi.string()
      .valid('pending', 'sent', 'failed')
      .optional()
      .messages({
        'any.only': 'El estado debe ser: pending, sent o failed'
      }),

    sentAt: Joi.date()
      .optional(),

    metadata: Joi.object()
      .optional()
  });

  return updateSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateNotification,
  validateNotificationUpdate,
  notificationSchema
};