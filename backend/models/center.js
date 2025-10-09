const Joi = require('joi');

// Esquema de validación para Center
const centerSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El nombre del centro es requerido',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'any.required': 'El nombre del centro es requerido'
    }),

  address: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'La dirección es requerida',
      'string.max': 'La dirección no puede exceder 200 caracteres',
      'any.required': 'La dirección es requerida'
    }),

  phone: Joi.string()
    .pattern(/^[\d\s\-\+\(\)]+$/)
    .max(20)
    .allow('')
    .optional()
    .messages({
      'string.pattern.base': 'El teléfono solo puede contener números, espacios, guiones y paréntesis',
      'string.max': 'El teléfono no puede exceder 20 caracteres'
    }),

  email: Joi.string()
    .email()
    .max(100)
    .allow('')
    .optional()
    .messages({
      'string.email': 'El email debe tener un formato válido',
      'string.max': 'El email no puede exceder 100 caracteres'
    }),

  description: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'La descripción no puede exceder 500 caracteres'
    })
});

// Función para validar datos de centro
const validateCenter = (data) => {
  return centerSchema.validate(data, { abortEarly: false });
};

// Función para validar actualización parcial de centro
const validateCenterUpdate = (data) => {
  const updateSchema = Joi.object({
    name: Joi.string()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.empty': 'El nombre del centro no puede estar vacío',
        'string.max': 'El nombre no puede exceder 100 caracteres'
      }),

    address: Joi.string()
      .min(1)
      .max(200)
      .optional()
      .messages({
        'string.empty': 'La dirección no puede estar vacía',
        'string.max': 'La dirección no puede exceder 200 caracteres'
      }),

    phone: Joi.string()
      .pattern(/^[\d\s\-\+\(\)]+$/)
      .max(20)
      .allow('')
      .optional()
      .messages({
        'string.pattern.base': 'El teléfono solo puede contener números, espacios, guiones y paréntesis',
        'string.max': 'El teléfono no puede exceder 20 caracteres'
      }),

    email: Joi.string()
      .email()
      .max(100)
      .allow('')
      .optional()
      .messages({
        'string.email': 'El email debe tener un formato válido',
        'string.max': 'El email no puede exceder 100 caracteres'
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
  validateCenter,
  validateCenterUpdate,
  centerSchema
};