const Joi = require('joi');

// Esquema de validación para Room
const roomSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El nombre de la sala es requerido',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'any.required': 'El nombre de la sala es requerido'
    }),

  center: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El centro es requerido',
      'string.max': 'El nombre del centro no puede exceder 100 caracteres',
      'any.required': 'El centro es requerido'
    }),

  capacity: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'number.base': 'La capacidad debe ser un número',
      'number.integer': 'La capacidad debe ser un número entero',
      'number.min': 'La capacidad debe ser al menos 1',
      'number.max': 'La capacidad no puede exceder 1000',
      'any.required': 'La capacidad es requerida'
    }),

  status: Joi.string()
    .valid('available', 'occupied', 'maintenance')
    .default('available')
    .messages({
      'any.only': 'El estado debe ser: available, occupied o maintenance'
    }),

  description: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'La descripción no puede exceder 500 caracteres'
    })
});

// Función para validar datos de sala
const validateRoom = (data) => {
  return roomSchema.validate(data, { abortEarly: false });
};

// Función para validar actualización parcial de sala
const validateRoomUpdate = (data) => {
  const updateSchema = Joi.object({
    name: Joi.string()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.empty': 'El nombre de la sala no puede estar vacío',
        'string.max': 'El nombre no puede exceder 100 caracteres'
      }),

    center: Joi.string()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.empty': 'El centro no puede estar vacío',
        'string.max': 'El nombre del centro no puede exceder 100 caracteres'
      }),

    capacity: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .optional()
      .messages({
        'number.base': 'La capacidad debe ser un número',
        'number.integer': 'La capacidad debe ser un número entero',
        'number.min': 'La capacidad debe ser al menos 1',
        'number.max': 'La capacidad no puede exceder 1000'
      }),

    status: Joi.string()
      .valid('available', 'occupied', 'maintenance')
      .optional()
      .messages({
        'any.only': 'El estado debe ser: available, occupied o maintenance'
      }),

    description: Joi.string()
      .max(500)
      .allow('')
      .optional()
      .messages({
        'string.max': 'La descripción no puede exceder 500 caracteres'
      })
  });

  return updateSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateRoom,
  validateRoomUpdate,
  roomSchema
};