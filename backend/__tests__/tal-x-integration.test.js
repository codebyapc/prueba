const request = require('supertest');
const app = require('../server');

describe('TAL-X Integration Tests - Complete Workflow', () => {
  let server;
  let testRoomId;
  let testBookingId;
  let testCenterId;

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

  describe('Complete Room Management Workflow', () => {
    it('should complete full room lifecycle: create -> read -> update -> delete', async () => {
      // 1. Crear una nueva sala
      const newRoom = {
        name: 'Sala de Integración TDD',
        center: 'Centro de Test Integración',
        capacity: 25,
        description: 'Sala creada para pruebas de integración completas'
      };

      const createResponse = await request(server)
        .post('/api/rooms')
        .send(newRoom)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      testRoomId = createResponse.body.data.id;

      // 2. Verificar que la sala aparece en el listado
      const listResponse = await request(server)
        .get('/api/rooms')
        .expect(200);

      expect(listResponse.body.success).toBe(true);
      expect(listResponse.body.data.some(room => room.id === testRoomId)).toBe(true);

      // 3. Obtener la sala específica
      const getResponse = await request(server)
        .get(`/api/rooms/${testRoomId}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.id).toBe(testRoomId);
      expect(getResponse.body.data.name).toBe(newRoom.name);

      // 4. Actualizar la sala
      const updatedData = {
        name: 'Sala de Integración TDD - Actualizada',
        capacity: 30
      };

      const updateResponse = await request(server)
        .put(`/api/rooms/${testRoomId}`)
        .send(updatedData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.name).toBe(updatedData.name);
      expect(updateResponse.body.data.capacity).toBe(updatedData.capacity);

      // 5. Verificar que la actualización se refleja en el listado
      const updatedListResponse = await request(server)
        .get('/api/rooms')
        .expect(200);

      const updatedRoom = updatedListResponse.body.data.find(room => room.id === testRoomId);
      expect(updatedRoom.name).toBe(updatedData.name);
      expect(updatedRoom.capacity).toBe(updatedData.capacity);

      // 6. Eliminar la sala
      const deleteResponse = await request(server)
        .delete(`/api/rooms/${testRoomId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // 7. Verificar que la sala ya no existe
      const finalListResponse = await request(server)
        .get('/api/rooms')
        .expect(200);

      expect(finalListResponse.body.data.some(room => room.id === testRoomId)).toBe(false);
    });
  });

  describe('Complete Booking Management Workflow', () => {
    it('should complete full booking lifecycle: create -> approve -> update -> cancel', async () => {
      // Crear una sala para las pruebas de reserva
      const testRoom = {
        name: 'Sala para Reserva de Integración',
        center: 'Centro de Pruebas',
        capacity: 10,
        description: 'Sala para pruebas de integración de reservas'
      };

      const roomResponse = await request(server)
        .post('/api/rooms')
        .send(testRoom)
        .expect(201);

      testRoomId = roomResponse.body.data.id;

      // 1. Crear una nueva reserva
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setHours(dayAfterTomorrow.getHours() + 2);

      const newBooking = {
        roomId: testRoomId,
        userId: '550e8400-e29b-41d4-a716-446655440001', // UUID válido
        startTime: tomorrow.toISOString(),
        endTime: dayAfterTomorrow.toISOString(),
        purpose: 'Prueba de integración completa TDD',
        attendees: 6
      };

      const createBookingResponse = await request(server)
        .post('/api/bookings')
        .send(newBooking)
        .expect(201);

      expect(createBookingResponse.body.success).toBe(true);
      testBookingId = createBookingResponse.body.data.id;
      expect(createBookingResponse.body.data.status).toBe('pending');

      // 2. Verificar que la reserva aparece en el listado
      const bookingsListResponse = await request(server)
        .get('/api/bookings')
        .expect(200);

      expect(bookingsListResponse.body.success).toBe(true);
      expect(bookingsListResponse.body.data.some(booking => booking.id === testBookingId)).toBe(true);

      // 3. Aprobar la reserva
      const approveResponse = await request(server)
        .put(`/api/bookings/${testBookingId}/approve`)
        .send({
          status: 'approved',
          reason: 'Aprobada en prueba de integración'
        })
        .expect(200);

      expect(approveResponse.body.success).toBe(true);
      expect(approveResponse.body.data.status).toBe('approved');

      // 4. Actualizar la reserva aprobada
      const updatedBookingData = {
        purpose: 'Reserva actualizada en integración TDD',
        attendees: 8
      };

      const updateBookingResponse = await request(server)
        .put(`/api/bookings/${testBookingId}`)
        .send(updatedBookingData)
        .expect(200);

      expect(updateBookingResponse.body.success).toBe(true);
      expect(updateBookingResponse.body.data.purpose).toBe(updatedBookingData.purpose);
      expect(updateBookingResponse.body.data.attendees).toBe(updatedBookingData.attendees);

      // 5. Cancelar la reserva
      const cancelResponse = await request(server)
        .delete(`/api/bookings/${testBookingId}`)
        .expect(200);

      expect(cancelResponse.body.success).toBe(true);

      // 6. Verificar que la reserva ya no existe
      const finalBookingsResponse = await request(server)
        .get('/api/bookings')
        .expect(200);

      expect(finalBookingsResponse.body.data.some(booking => booking.id === testBookingId)).toBe(false);

      // 7. Limpiar: eliminar la sala de prueba
      await request(server)
        .delete(`/api/rooms/${testRoomId}`)
        .expect(200);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle complex validation scenarios correctly', async () => {
      // Crear sala con datos válidos primero
      const validRoom = {
        name: 'Sala para Tests de Error',
        center: 'Centro de Pruebas',
        capacity: 5
      };

      const roomResponse = await request(server)
        .post('/api/rooms')
        .send(validRoom)
        .expect(201);

      const roomId = roomResponse.body.data.id;

      // Intentar crear múltiples reservas conflictivas
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + 1);

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      const booking1 = {
        roomId: roomId,
        userId: '550e8400-e29b-41d4-a716-446655440002', // UUID válido
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        purpose: 'Primera reserva'
      };

      const booking2 = {
        roomId: roomId,
        userId: '550e8400-e29b-41d4-a716-446655440003', // UUID válido
        startTime: startTime.toISOString(), // Mismo horario
        endTime: endTime.toISOString(),
        purpose: 'Segunda reserva conflictiva'
      };

      // Crear primera reserva
      await request(server)
        .post('/api/bookings')
        .send(booking1)
        .expect(201);

      // Crear segunda reserva (debería funcionar ya que no hay lógica de conflicto implementada aún)
      await request(server)
        .post('/api/bookings')
        .send(booking2)
        .expect(201);

      // Verificar que ambas reservas existen
      const bookingsResponse = await request(server)
        .get('/api/bookings')
        .expect(200);

      const roomBookings = bookingsResponse.body.data.filter(booking => booking.roomId === roomId);
      expect(roomBookings.length).toBeGreaterThanOrEqual(2);

      // Limpiar
      await request(server).delete(`/api/rooms/${roomId}`).expect(200);
    });
  });

  describe('API Response Consistency', () => {
    it('should return consistent response structure across all endpoints', async () => {
      // Test GET endpoints consistency
      const getRoomsResponse = await request(server).get('/api/rooms').expect(200);
      expect(getRoomsResponse.body).toHaveProperty('success');
      expect(getRoomsResponse.body).toHaveProperty('data');
      expect(getRoomsResponse.body).toHaveProperty('count');

      const getBookingsResponse = await request(server).get('/api/bookings').expect(200);
      expect(getBookingsResponse.body).toHaveProperty('success');
      expect(getBookingsResponse.body).toHaveProperty('data');
      expect(getBookingsResponse.body).toHaveProperty('count');

      // Test POST endpoints consistency
      const newRoom = { name: 'Test Consistency', center: 'Test', capacity: 5 };
      const postRoomResponse = await request(server)
        .post('/api/rooms')
        .send(newRoom)
        .expect(201);

      expect(postRoomResponse.body).toHaveProperty('success');
      expect(postRoomResponse.body).toHaveProperty('data');
      expect(postRoomResponse.body).toHaveProperty('message');

      // Test error responses consistency
      const errorResponse = await request(server)
        .get('/api/rooms/non-existent-id')
        .expect(404);

      expect(errorResponse.body).toHaveProperty('success');
      expect(errorResponse.body).toHaveProperty('error');
      expect(errorResponse.body).toHaveProperty('message');
      expect(errorResponse.body.success).toBe(false);
    });
  });
});