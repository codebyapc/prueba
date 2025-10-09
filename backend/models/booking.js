const Joi = require('joi');

// Esquema de validación para Booking
const bookingSchema = Joi.object({
  roomId: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.empty': 'El ID de la sala es requerido',
      'any.required': 'El ID de la sala es requerido'
    }),

  userId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'El ID del usuario debe ser un UUID válido',
      'any.required': 'El ID del usuario es requerido'
    }),

  startTime: Joi.date()
    .greater('now')
    .required()
    .messages({
      'date.greater': 'La fecha de inicio debe ser futura',
      'any.required': 'La fecha de inicio es requerida'
    }),

  endTime: Joi.date()
    .greater(Joi.ref('startTime'))
    .required()
    .messages({
      'date.greater': 'La fecha de fin debe ser posterior a la fecha de inicio',
      'any.required': 'La fecha de fin es requerida'
    }),

  purpose: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'El propósito de la reserva es requerido',
      'string.max': 'El propósito no puede exceder 200 caracteres',
      'any.required': 'El propósito de la reserva es requerido'
    }),

  status: Joi.string()
    .valid('pending', 'approved', 'rejected', 'cancelled')
    .default('pending')
    .messages({
      'any.only': 'El estado debe ser: pending, approved, rejected o cancelled'
    }),

  attendees: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .optional()
    .messages({
      'number.base': 'El número de asistentes debe ser un número',
      'number.integer': 'El número de asistentes debe ser un entero',
      'number.min': 'Debe haber al menos 1 asistente',
      'number.max': 'No puede exceder 1000 asistentes'
    })
});

// Función para validar datos de reserva
const validateBooking = (data) => {
  return bookingSchema.validate(data, { abortEarly: false });
};

// Función para validar actualización parcial de reserva
const validateBookingUpdate = (data) => {
  const updateSchema = Joi.object({
    roomId: Joi.string()
      .min(1)
      .optional()
      .messages({
        'string.empty': 'El ID de la sala no puede estar vacío'
      }),

    userId: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'El ID del usuario debe ser un UUID válido'
      }),

    startTime: Joi.date()
      .greater('now')
      .optional()
      .messages({
        'date.greater': 'La fecha de inicio debe ser futura'
      }),

    endTime: Joi.date()
      .greater(Joi.ref('startTime'))
      .optional()
      .messages({
        'date.greater': 'La fecha de fin debe ser posterior a la fecha de inicio'
      }),

    purpose: Joi.string()
      .min(1)
      .max(200)
      .optional()
      .messages({
        'string.empty': 'El propósito de la reserva no puede estar vacío',
        'string.max': 'El propósito no puede exceder 200 caracteres'
      }),

    status: Joi.string()
      .valid('pending', 'approved', 'rejected', 'cancelled')
      .optional()
      .messages({
        'any.only': 'El estado debe ser: pending, approved, rejected o cancelled'
      }),

    attendees: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .optional()
      .messages({
        'number.base': 'El número de asistentes debe ser un número',
        'number.integer': 'El número de asistentes debe ser un entero',
        'number.min': 'Debe haber al menos 1 asistente',
        'number.max': 'No puede exceder 1000 asistentes'
      })
  });

  return updateSchema.validate(data, { abortEarly: false });
};

// Función para validar aprobación/rechazo de reserva
const validateBookingApproval = (data) => {
  const approvalSchema = Joi.object({
    status: Joi.string()
      .valid('approved', 'rejected', 'cancelled')
      .required()
      .messages({
        'any.only': 'El estado debe ser: approved, rejected o cancelled',
        'any.required': 'El estado es requerido'
      }),

    reason: Joi.string()
      .max(500)
      .allow('')
      .optional()
      .messages({
        'string.max': 'La razón no puede exceder 500 caracteres'
      })
  });

  return approvalSchema.validate(data, { abortEarly: false });
};

// Función para validar reagendado de reserva
const validateBookingReschedule = (data) => {
  const rescheduleSchema = Joi.object({
    roomId: Joi.string()
      .min(1)
      .optional()
      .messages({
        'string.empty': 'El ID de la sala no puede estar vacío'
      }),

    startTime: Joi.date()
      .greater('now')
      .optional()
      .messages({
        'date.greater': 'La fecha de inicio debe ser futura'
      }),

    endTime: Joi.date()
      .greater(Joi.ref('startTime'))
      .optional()
      .messages({
        'date.greater': 'La fecha de fin debe ser posterior a la fecha de inicio'
      }),

    purpose: Joi.string()
      .min(1)
      .max(200)
      .optional()
      .messages({
        'string.empty': 'El propósito de la reserva no puede estar vacío',
        'string.max': 'El propósito no puede exceder 200 caracteres'
      }),

    attendees: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .optional()
      .messages({
        'number.base': 'El número de asistentes debe ser un número',
        'number.integer': 'El número de asistentes debe ser un entero',
        'number.min': 'Debe haber al menos 1 asistente',
        'number.max': 'No puede exceder 1000 asistentes'
      }),

    reason: Joi.string()
      .max(500)
      .allow('')
      .optional()
      .messages({
        'string.max': 'La razón no puede exceder 500 caracteres'
      })
  }).min(1); // Al menos uno de los campos debe estar presente

  return rescheduleSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateBooking,
  validateBookingUpdate,
  validateBookingApproval,
  validateBookingReschedule,
  bookingSchema
};