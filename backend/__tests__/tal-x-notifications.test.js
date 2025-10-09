const request = require('supertest');
const app = require('../server');

describe('TAL-X Notifications Management Tests', () => {
  let server;
  let createdNotificationId;

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

  describe('GET /api/notifications', () => {
    it('should return all notifications', async () => {
      const response = await request(server)
        .get('/api/notifications')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/notifications', () => {
    it('should create a new notification with valid data', async () => {
      const newNotification = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        bookingId: '1',
        type: 'booking_rescheduled',
        title: 'Reserva reagendada',
        message: 'Su reserva ha sido reagendada por el gestor de salas',
        email: 'empleado1@empresa.com'
      };

      const response = await request(server)
        .post('/api/notifications')
        .send(newNotification)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.userId).toBe(newNotification.userId);
      expect(response.body.data.type).toBe(newNotification.type);
      expect(response.body.data.title).toBe(newNotification.title);
      expect(response.body.data.email).toBe(newNotification.email);

      createdNotificationId = response.body.data.id;
    });

    it('should return validation error for invalid notification data', async () => {
      const invalidNotification = {
        userId: 'invalid-uuid',
        type: 'invalid-type',
        email: 'invalid-email'
      };

      const response = await request(server)
        .post('/api/notifications')
        .send(invalidNotification)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
    });
  });

  describe('GET /api/notifications/:id', () => {
    it('should return a specific notification', async () => {
      const response = await request(server)
        .get(`/api/notifications/${createdNotificationId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', createdNotificationId);
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('type');
    });

    it('should return 404 for non-existent notification', async () => {
      const response = await request(server)
        .get('/api/notifications/non-existent-id')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Notificación no encontrada');
    });
  });

  describe('PUT /api/notifications/:id', () => {
    it('should update an existing notification', async () => {
      const updatedData = {
        status: 'sent',
        sentAt: new Date().toISOString()
      };

      const response = await request(server)
        .put(`/api/notifications/${createdNotificationId}`)
        .send(updatedData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.status).toBe(updatedData.status);
    });
  });

  describe('POST /api/notifications/:id/resend', () => {
    it('should resend an existing notification', async () => {
      const response = await request(server)
        .post(`/api/notifications/${createdNotificationId}/resend`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent notification resend', async () => {
      const response = await request(server)
        .post('/api/notifications/non-existent-id/resend')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Notificación no encontrada');
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('should delete an existing notification', async () => {
      const response = await request(server)
        .delete(`/api/notifications/${createdNotificationId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('id', createdNotificationId);
    });

    it('should return 404 when deleting non-existent notification', async () => {
      const response = await request(server)
        .delete(`/api/notifications/${createdNotificationId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Notificación no encontrada');
    });
  });
});