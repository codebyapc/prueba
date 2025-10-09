const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Importar rutas
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || (process.env.NODE_ENV === 'test' ? 0 : 3001);

// Middleware de seguridad
app.use(helmet());

// Middleware para CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middleware para logging
app.use(morgan('combined'));

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: 'API de Gestión de Salas y Centros',
    version: '1.0.0',
    status: 'active'
  });
});

// Rutas de la API
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe`
  });
});

// Función para iniciar servidor con manejo de errores mejorado
const startServer = (port) => {
  const server = app.listen(port, () => {
    const actualPort = server.address().port;
    console.log(`🚀 Servidor corriendo en puerto ${actualPort}`);
    console.log(`📚 Documentación API disponible en http://localhost:${actualPort}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`⚠️  Puerto ${port} en uso, intentando con puerto alternativo...`);
      if (process.env.NODE_ENV === 'test') {
        // En tests, usar puerto 0 para asignación dinámica
        startServer(0);
      } else {
        startServer(0);
      }
    } else {
      console.error('❌ Error iniciando servidor:', error);
      process.exit(1);
    }
  });

  return server;
};

// Iniciar servidor
const server = startServer(PORT);

module.exports = app;