# Funcionalidad de Reagendado de Reservas con Notificaciones

## Descripción

Esta funcionalidad permite a los gestores de salas reagendar reservas conflictivas cambiando la sala, fecha u hora, con notificación automática al empleado afectado.

## Escenario Implementado

**Given** que soy un gestor de salas
**And** existe una reserva conflictiva
**When** cambio la sala, fecha u hora de la reserva
**Then** la reserva se actualiza correctamente
**And** se notifica al empleado

## Arquitectura

### Componentes Implementados

1. **Modelo de Notificaciones** (`backend/models/notification.js`)
   - Validación de datos de notificaciones
   - Esquemas para diferentes tipos de notificaciones
   - Soporte para booking_rescheduled, booking_approved, booking_rejected, booking_cancelled

2. **Servicio de Notificaciones** (`backend/services/notificationService.js`)
   - Envío de emails usando nodemailer
   - Plantillas HTML y texto para diferentes tipos de notificaciones
   - Formateo de fechas y horas localizado
   - Configuración para modo desarrollo y producción

3. **Rutas de Notificaciones** (`backend/routes/notifications.js`)
   - CRUD completo para notificaciones
   - Endpoint para reenviar notificaciones
   - Gestión de estados (pending, sent, failed)

4. **Integración en Reservas** (`backend/routes/bookings.js`)
   - Endpoint `/api/bookings/:id/reschedule` mejorado
   - Notificación automática al reagendar
   - Notificación automática al aprobar/rechazar

## Endpoints de la API

### Reagendar Reserva
```http
PUT /api/bookings/:id/reschedule
Content-Type: application/json

{
  "roomId": "nueva-sala-id",           // Opcional
  "startTime": "2024-01-15T10:00:00Z", // Opcional
  "endTime": "2024-01-15T11:00:00Z",   // Opcional
  "purpose": "Nuevo propósito",        // Opcional
  "attendees": 10,                     // Opcional
  "reason": "Motivo del reagendado"    // Opcional
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "roomId": "nueva-sala-id",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z",
    "purpose": "Nuevo propósito",
    "attendees": 10,
    "status": "approved",
    "rescheduleReason": "Motivo del reagendado",
    "rescheduledAt": "2024-01-10T15:30:00Z",
    "updatedAt": "2024-01-10T15:30:00Z"
  },
  "message": "Reserva reagendada exitosamente y empleado notificado"
}
```

### Gestión de Notificaciones
```http
# Crear notificación
POST /api/notifications

# Listar notificaciones
GET /api/notifications

# Obtener notificación específica
GET /api/notifications/:id

# Actualizar notificación
PUT /api/notifications/:id

# Reenviar notificación
POST /api/notifications/:id/resend

# Eliminar notificación
DELETE /api/notifications/:id
```

## Tipos de Notificaciones

### Notificación de Reagendado
- **Tipo:** `booking_rescheduled`
- **Asunto:** "Reserva reagendada - TAL-X"
- **Contenido:** Detalles de la reserva actualizada con cambios destacados

### Notificación de Aprobación
- **Tipo:** `booking_approved`
- **Asunto:** "Reserva aprobada - TAL-X"
- **Contenido:** Confirmación de aprobación con detalles de la reserva

### Notificación de Rechazo
- **Tipo:** `booking_rejected`
- **Asunto:** "Reserva rechazada - TAL-X"
- **Contenido:** Información del rechazo con motivo

### Notificación de Cancelación
- **Tipo:** `booking_cancelled`
- **Asunto:** "Reserva cancelada - TAL-X"
- **Contenido:** Información de la cancelación

## Características Técnicas

### Validaciones
- Validación estricta de datos usando Joi
- Verificación de conflictos de horario
- Validación de fechas futuras
- Verificación de disponibilidad de salas

### Seguridad
- Validación de UUIDs para usuarios y reservas
- Sanitización de datos de entrada
- Manejo seguro de errores

### Configuración de Email
- Soporte para diferentes proveedores de email
- Configuración por variables de entorno
- Modo desarrollo con logging en lugar de envío real

## Variables de Entorno

```env
# Configuración de Email
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-password-de-aplicacion
EMAIL_FROM=noreply@talx.com

# URLs
FRONTEND_URL=http://localhost:3000

# Entorno
NODE_ENV=development
```

## Tests

### Tests de Reagendado
- ✅ Reagendar con nueva hora
- ✅ Reagendar con nueva sala
- ✅ Verificación de conflictos de horario
- ✅ Validación de datos inválidos
- ✅ No permitir reagendar reservas canceladas
- ✅ Reagendado parcial (solo propósito)
- ✅ **Verificación de envío de notificaciones**

### Tests de Notificaciones
- ✅ Crear notificación válida
- ✅ Validación de datos inválidos
- ✅ Obtener notificación específica
- ✅ Actualizar notificación
- ✅ Reenviar notificación
- ✅ Eliminar notificación

## Ejemplos de Uso

### Reagendar por Conflicto
```javascript
// Caso de uso típico: reagendar por conflicto
const rescheduleData = {
  startTime: "2024-01-15T14:00:00Z",
  endTime: "2024-01-15T15:00:00Z",
  roomId: "sala-alternativa-001",
  reason: "Conflicto con otra reserva de alta prioridad"
};
```

### Reagendar por Cambio de Necesidades
```javascript
// Caso de uso: cambio de sala por tamaño insuficiente
const rescheduleData = {
  roomId: "sala-mas-grande-002",
  attendees: 25,
  reason: "Necesitamos sala más grande para más asistentes"
};
```

## Estados de Reserva

- **pending:** Reserva creada, pendiente de aprobación
- **approved:** Reserva aprobada y activa
- **rejected:** Reserva rechazada
- **cancelled:** Reserva cancelada

## Notas de Implementación

1. **Notificaciones en Desarrollo:** En modo desarrollo, las notificaciones se registran en consola en lugar de enviarse por email.

2. **Emails de Empleados:** Actualmente se generan emails simulados basados en el ID del usuario. En producción, estos deberían obtenerse de una base de datos de usuarios.

3. **Plantillas de Email:** Las plantillas están diseñadas para ser responsive y accesibles.

4. **Manejo de Errores:** Los errores de envío de notificaciones no impiden que la operación principal se complete exitosamente.

## Próximas Mejoras

- [ ] Integración con servicios de email reales (SendGrid, AWS SES)
- [ ] Base de datos de usuarios para obtener emails reales
- [ ] Plantillas personalizables por tipo de notificación
- [ ] Sistema de colas para envío masivo de notificaciones
- [ ] Dashboard para seguimiento de notificaciones
- [ ] Configuración de reglas de notificación por usuario/equipo