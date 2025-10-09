const request = require('supertest');
const app = require('../server');

describe('TAL-X Bookings Management Tests', () => {
  let server;
  let createdBookingId;
  let testRoomId = '550e8400-e29b-41d4-a716-446655440001'; // Usar sala existente de los datos de ejemplo

  beforeAll((done) => {
    server = app.listen(0, () => {
      global.__SERVER__ = server;
      done();
    });
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  // Limpiar datos después de cada test
  afterEach(() => {
    // Nota: En una implementación real, aquí limpiaríamos la base de datos
    // Para esta implementación en memoria, los datos persisten entre tests
    // pero cada test debería crear sus propios datos independientes
  });

  describe('GET /api/bookings', () => {
    it('should return all bookings', async () => {
      const response = await request(server)
        .get('/api/bookings')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking with valid data', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setHours(dayAfterTomorrow.getHours() + 2);

      const newBooking = {
        roomId: testRoomId,
        userId: '550e8400-e29b-41d4-a716-446655440000', // UUID válido
        startTime: tomorrow.toISOString(),
        endTime: dayAfterTomorrow.toISOString(),
        purpose: 'Test TDD - Reunión importante',
        attendees: 5
      };

      const response = await request(server)
        .post('/api/bookings')
        .send(newBooking)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.roomId).toBe(newBooking.roomId);
      expect(response.body.data.purpose).toBe(newBooking.purpose);
      expect(response.body.data.status).toBe('pending');

      createdBookingId = response.body.data.id;
    });

    it('should return validation error for invalid booking data', async () => {
      const invalidBooking = {
        roomId: 'invalid-uuid',
        startTime: 'invalid-date',
        endTime: '2020-01-01T00:00:00Z' // Fecha pasada
      };

      const response = await request(server)
        .post('/api/bookings')
        .send(invalidBooking)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
    });

    it('should return validation error when end time is before start time', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const invalidBooking = {
        roomId: testRoomId,
        userId: '550e8400-e29b-41d4-a716-446655440003',
        startTime: tomorrow.toISOString(),
        endTime: yesterday.toISOString(), // End before start
        purpose: 'Test con fechas inválidas'
      };

      const response = await request(server)
        .post('/api/bookings')
        .send(invalidBooking)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('La fecha de fin debe ser posterior a la fecha de inicio');
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should return a specific booking', async () => {
      const response = await request(server)
        .get(`/api/bookings/${createdBookingId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', createdBookingId);
      expect(response.body.data).toHaveProperty('roomId');
      expect(response.body.data).toHaveProperty('purpose');
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await request(server)
        .get('/api/bookings/non-existent-id')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Reserva no encontrada');
    });
  });

  describe('PUT /api/bookings/:id/approve', () => {
    it('should approve a pending booking', async () => {
      const response = await request(server)
        .put(`/api/bookings/${createdBookingId}/approve`)
        .send({
          status: 'approved',
          reason: 'Aprobado por el gestor de salas'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body.data.status).toBe('approved');
      expect(response.body.data).toHaveProperty('approvalReason');
    });

    it('should reject a booking', async () => {
      // Crear una nueva reserva para rechazar
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setHours(dayAfterTomorrow.getHours() + 1);

      const bookingToReject = {
        roomId: testRoomId,
        userId: '550e8400-e29b-41d4-a716-446655440004',
        startTime: tomorrow.toISOString(),
        endTime: dayAfterTomorrow.toISOString(),
        purpose: 'Reserva a rechazar'
      };

      const createResponse = await request(server)
        .post('/api/bookings')
        .send(bookingToReject)
        .expect(201);

      const bookingIdToReject = createResponse.body.data.id;

      const response = await request(server)
        .put(`/api/bookings/${bookingIdToReject}/approve`)
        .send({
          status: 'rejected',
          reason: 'Sala no disponible en ese horario'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.status).toBe('rejected');
      expect(response.body.data).toHaveProperty('approvalReason');
    });

    it('should return validation error for invalid approval status', async () => {
      const response = await request(server)
        .put(`/api/bookings/${createdBookingId}/approve`)
        .send({
          status: 'invalid-status'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('El estado debe ser: approved, rejected o cancelled');
    });
  });

  describe('PUT /api/bookings/:id', () => {
    it('should update an existing booking', async () => {
      const updatedData = {
        purpose: 'Reserva actualizada mediante TDD',
        attendees: 8
      };

      const response = await request(server)
        .put(`/api/bookings/${createdBookingId}`)
        .send(updatedData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.purpose).toBe(updatedData.purpose);
      expect(response.body.data.attendees).toBe(updatedData.attendees);
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('should cancel an existing booking', async () => {
      const response = await request(server)
        .delete(`/api/bookings/${createdBookingId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('id', createdBookingId);
    });

    it('should return 404 when cancelling non-existent booking', async () => {
      const response = await request(server)
        .delete(`/api/bookings/${createdBookingId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Reserva no encontrada');
    });
  });

  describe('PUT /api/bookings/:id/reschedule', () => {
    let bookingToReschedule;

    beforeEach(async () => {
      // Crear una reserva específica para reagendar
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setHours(dayAfterTomorrow.getHours() + 1);

      const booking = {
        roomId: testRoomId,
        userId: '550e8400-e29b-41d4-a716-446655440005',
        startTime: tomorrow.toISOString(),
        endTime: dayAfterTomorrow.toISOString(),
        purpose: 'Reserva para reagendar',
        attendees: 3
      };

      const createResponse = await request(server)
        .post('/api/bookings')
        .send(booking)
        .expect(201);

      bookingToReschedule = createResponse.body.data;

      // Aprobar la reserva para poder reagendarla
      await request(server)
        .put(`/api/bookings/${bookingToReschedule.id}/approve`)
        .send({
          status: 'approved',
          reason: 'Aprobada para tests'
        });
    });

    it('should reschedule a booking with new time', async () => {
      const newStartTime = new Date();
      newStartTime.setDate(newStartTime.getDate() + 2);
      newStartTime.setHours(10, 0, 0, 0);

      const newEndTime = new Date(newStartTime);
      newEndTime.setHours(newEndTime.getHours() + 2);

      const rescheduleData = {
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
        reason: 'Cambio de horario por reunión importante'
      };

      const response = await request(server)
        .put(`/api/bookings/${bookingToReschedule.id}/reschedule`)
        .send(rescheduleData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body.data.startTime).toBe(rescheduleData.startTime);
      expect(response.body.data.endTime).toBe(rescheduleData.endTime);
      expect(response.body.data).toHaveProperty('rescheduleReason');
      expect(response.body.data).toHaveProperty('rescheduledAt');
    });

    it('should reschedule a booking with new room', async () => {
      const newRoomId = '550e8400-e29b-41d4-a716-446655440006'; // Nueva sala de prueba

      const rescheduleData = {
        roomId: newRoomId,
        reason: 'Cambio de sala por tamaño insuficiente'
      };

      const response = await request(server)
        .put(`/api/bookings/${bookingToReschedule.id}/reschedule`)
        .send(rescheduleData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.roomId).toBe(newRoomId);
      expect(response.body.data).toHaveProperty('rescheduleReason');
    });

    it('should return conflict error when rescheduling to occupied time slot', async () => {
      // Crear otra reserva que genere conflicto
      const conflictStart = new Date();
      conflictStart.setDate(conflictStart.getDate() + 3);
      conflictStart.setHours(14, 0, 0, 0);

      const conflictEnd = new Date(conflictStart);
      conflictEnd.setHours(conflictEnd.getHours() + 1);

      const conflictingBooking = {
        roomId: testRoomId,
        userId: '550e8400-e29b-41d4-a716-446655440007',
        startTime: conflictStart.toISOString(),
        endTime: conflictEnd.toISOString(),
        purpose: 'Reserva conflictiva'
      };

      const createResponse = await request(server)
        .post('/api/bookings')
        .send(conflictingBooking)
        .expect(201);

      // Aprobar la reserva conflictiva para que genere conflicto real
      await request(server)
        .put(`/api/bookings/${createResponse.body.data.id}/approve`)
        .send({
          status: 'approved',
          reason: 'Aprobada para generar conflicto en test'
        });

      const rescheduleData = {
        startTime: conflictStart.toISOString(),
        endTime: conflictEnd.toISOString(),
        reason: 'Intento de reagendar a horario ocupado'
      };

      const response = await request(server)
        .put(`/api/bookings/${bookingToReschedule.id}/reschedule`)
        .send(rescheduleData)
        .expect('Content-Type', /json/)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Conflicto de horario');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent booking reschedule', async () => {
      const response = await request(server)
        .put('/api/bookings/non-existent-id/reschedule')
        .send({
          startTime: new Date().toISOString(),
          reason: 'Test'
        })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Reserva no encontrada');
    });

    it('should return validation error for invalid reschedule data', async () => {
      const invalidData = {
        startTime: 'invalid-date',
        endTime: '2020-01-01T00:00:00Z' // Fecha pasada
      };

      const response = await request(server)
        .put(`/api/bookings/${bookingToReschedule.id}/reschedule`)
        .send(invalidData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
    });

    it('should not allow rescheduling cancelled bookings', async () => {
      // Primero cancelar la reserva usando la ruta de aprobación con status cancelled
      await request(server)
        .put(`/api/bookings/${bookingToReschedule.id}/approve`)
        .send({
          status: 'cancelled',
          reason: 'Cancelada para test'
        })
        .expect(200);

      const response = await request(server)
        .put(`/api/bookings/${bookingToReschedule.id}/reschedule`)
        .send({
          startTime: new Date().toISOString(),
          reason: 'Intento de reagendar reserva cancelada'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Operación no permitida');
      expect(response.body.message).toContain('No se puede reagendar una reserva cancelada');
    });

    it('should allow partial reschedule with only purpose change', async () => {
      const newPurpose = 'Propósito actualizado sin cambiar horario';

      const response = await request(server)
        .put(`/api/bookings/${bookingToReschedule.id}/reschedule`)
        .send({
          purpose: newPurpose,
          reason: 'Cambio solo de propósito'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.purpose).toBe(newPurpose);
      expect(response.body.data).toHaveProperty('rescheduleReason');
    });

    it('should send notification when rescheduling a booking', async () => {
      const newStartTime = new Date();
      newStartTime.setDate(newStartTime.getDate() + 2);
      newStartTime.setHours(10, 0, 0, 0);

      const newEndTime = new Date(newStartTime);
      newEndTime.setHours(newEndTime.getHours() + 2);

      const rescheduleData = {
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
        reason: 'Cambio de horario por reunión importante'
      };

      const response = await request(server)
        .put(`/api/bookings/${bookingToReschedule.id}/reschedule`)
        .send(rescheduleData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('empleado notificado');
      expect(response.body.data).toHaveProperty('rescheduleReason');
      expect(response.body.data).toHaveProperty('rescheduledAt');
    });
  });
});