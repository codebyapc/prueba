const request = require('supertest');
const app = require('../server');

describe('TAL-X Rooms Management Tests', () => {
  let server;
  let createdRoomId;

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

  describe('GET /api/rooms', () => {
    it('should return all rooms', async () => {
      const response = await request(server)
        .get('/api/rooms')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/rooms', () => {
    it('should create a new room with valid data', async () => {
      const newRoom = {
        name: 'Sala de Test TDD',
        center: 'Centro de Pruebas',
        capacity: 15,
        description: 'Sala creada mediante TDD'
      };

      const response = await request(server)
        .post('/api/rooms')
        .send(newRoom)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(newRoom.name);
      expect(response.body.data.center).toBe(newRoom.center);
      expect(response.body.data.capacity).toBe(newRoom.capacity);

      createdRoomId = response.body.data.id;
    });

    it('should return validation error for invalid room data', async () => {
      const invalidRoom = {
        name: '', // Nombre vacío
        capacity: -1 // Capacidad negativa
      };

      const response = await request(server)
        .post('/api/rooms')
        .send(invalidRoom)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
    });
  });

  describe('GET /api/rooms/:id', () => {
    it('should return a specific room', async () => {
      const response = await request(server)
        .get(`/api/rooms/${createdRoomId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', createdRoomId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('center');
    });

    it('should return 404 for non-existent room', async () => {
      const response = await request(server)
        .get('/api/rooms/non-existent-id')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Sala no encontrada');
    });
  });

  describe('PUT /api/rooms/:id', () => {
    it('should update an existing room', async () => {
      const updatedData = {
        name: 'Sala de Test TDD Actualizada',
        capacity: 20
      };

      const response = await request(server)
        .put(`/api/rooms/${createdRoomId}`)
        .send(updatedData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body.data.name).toBe(updatedData.name);
      expect(response.body.data.capacity).toBe(updatedData.capacity);
    });

    it('should return 404 when updating non-existent room', async () => {
      const response = await request(server)
        .put('/api/rooms/non-existent-id')
        .send({ name: 'Test' })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Sala no encontrada');
    });
  });

  describe('DELETE /api/rooms/:id', () => {
    it('should delete an existing room', async () => {
      const response = await request(server)
        .delete(`/api/rooms/${createdRoomId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('id', createdRoomId);
    });

    it('should return 404 when deleting non-existent room', async () => {
      const response = await request(server)
        .delete(`/api/rooms/${createdRoomId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Sala no encontrada');
    });
  });
});