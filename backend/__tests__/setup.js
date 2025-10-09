// Configuración global para los tests
process.env.NODE_ENV = 'test';

// Limpiar todas las variables de entorno de test después de cada test
afterEach(() => {
  delete process.env.NODE_ENV;
});

// Cleanup después de todos los tests
afterAll(async () => {
  // Cerrar cualquier conexión de base de datos si existe
  if (global.__SERVER__) {
    await global.__SERVER__.close();
  }
});