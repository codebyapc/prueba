const request = require('supertest');
const app = require('../server');

describe('Centers API', () => {
  describe('GET /api/centers', () => {
    it('should return all centers', async () => {
      const response = await request(app)
        .get('/api/centers')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/centers/:id', () => {
    it('should return a specific center', async () => {
      const response = await request(app)
        .get('/api/centers/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', '1');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('address');
    });

    it('should return 404 for non-existent center', async () => {
      const response = await request(app)
        .get('/api/centers/non-existent-id')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Centro no encontrado');
    });
  });

  describe('POST /api/centers', () => {
    it('should create a new center', async () => {
      const newCenter = {
        name: 'Centro Test',
        address: 'Dirección Test 123',
        phone: '+34 912 345 678',
        email: 'test@centro.com',
        description: 'Centro de pruebas'
      };

      const response = await request(app)
        .post('/api/centers')
        .send(newCenter)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Centro creado exitosamente');
      expect(response.body.data).toHaveProperty('name', newCenter.name);
      expect(response.body.data).toHaveProperty('address', newCenter.address);
    });

    it('should return validation error for invalid center data', async () => {
      const invalidCenter = {
        name: '', // Invalid: empty name
        address: 'Dirección Test 123'
      };

      const response = await request(app)
        .post('/api/centers')
        .send(invalidCenter)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Datos de validación inválidos');
      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
    });
  });

  describe('PUT /api/centers/:id', () => {
    it('should update an existing center', async () => {
      const updatedData = {
        name: 'Centro Principal Actualizado',
        phone: '+34 912 345 999'
      };

      const response = await request(app)
        .put('/api/centers/1')
        .send(updatedData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Centro actualizado exitosamente');
      expect(response.body.data).toHaveProperty('name', updatedData.name);
      expect(response.body.data).toHaveProperty('phone', updatedData.phone);
    });

    it('should return 404 for non-existent center update', async () => {
      const response = await request(app)
        .put('/api/centers/non-existent-id')
        .send({ name: 'Test' })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Centro no encontrado');
    });
  });

  describe('DELETE /api/centers/:id', () => {
    it('should delete an existing center', async () => {
      const response = await request(app)
        .delete('/api/centers/2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Centro eliminado exitosamente');
    });

    it('should return 404 for non-existent center deletion', async () => {
      const response = await request(app)
        .delete('/api/centers/non-existent-id')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Centro no encontrado');
    });
  });
});