const request = require('supertest');
const app = require('../server');

describe('TAL-X Server Tests', () => {
  let server;

  beforeAll((done) => {
    // Crear instancia limpia del servidor para tests
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

  describe('GET /', () => {
    it('should return server information', async () => {
      const response = await request(server)
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status');
      expect(response.body.message).toBe('API de Gestión de Salas y Centros');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.status).toBe('active');
    });
  });

  describe('GET /non-existent-route', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(server)
        .get('/non-existent-route')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.error).toBe('Ruta no encontrada');
    });
  });
});