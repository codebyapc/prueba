const express = require('express');
const path = require('path');
const cors = require('cors');

class DashboardServer {
  constructor() {
    this.app = express();
    this.port = process.env.DASHBOARD_PORT || 8283;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'static')));
  }

  setupRoutes() {
    // Servir el dashboard principal
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'static', 'index.html'));
    });

    // API para obtener datos del servidor MCP
    this.app.get('/api/mcp-stats', async (req, res) => {
      try {
        // Aquí harías una petición al servidor MCP para obtener estadísticas
        // Por ahora, devolveremos datos simulados
        const stats = {
          uptime: process.uptime(),
          totalRequests: Math.floor(Math.random() * 1000),
          activeConnections: Math.floor(Math.random() * 10),
          serverHealth: {
            status: 'healthy',
            lastCheck: new Date().toISOString()
          },
          recentActivity: [
            {
              timestamp: new Date().toISOString(),
              level: 'info',
              message: 'Cliente conectado'
            },
            {
              timestamp: new Date(Date.now() - 5000).toISOString(),
              level: 'success',
              message: 'Pull request creado exitosamente'
            }
          ]
        };

        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API para obtener logs del servidor MCP
    this.app.get('/api/mcp-logs', async (req, res) => {
      try {
        // Datos simulados por ahora
        const logs = [
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Servidor MCP iniciado'
          },
          {
            timestamp: new Date(Date.now() - 10000).toISOString(),
            level: 'success',
            message: 'Herramienta github_create_repo ejecutada'
          },
          {
            timestamp: new Date(Date.now() - 20000).toISOString(),
            level: 'error',
            message: 'Error de autenticación en GitHub'
          }
        ];

        res.json({ logs });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API para obtener estado de servidores
    this.app.get('/api/servers', async (req, res) => {
      try {
        // Datos simulados por ahora
        const servers = [
          {
            id: 'github-server-1',
            name: 'GitHub Personal',
            type: 'github',
            status: 'connected',
            enabled: true,
            lastActivity: new Date().toISOString()
          },
          {
            id: 'github-server-2',
            name: 'GitHub Organization',
            type: 'github',
            status: 'disconnected',
            enabled: false,
            lastActivity: new Date(Date.now() - 300000).toISOString()
          }
        ];

        res.json({ servers });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`📊 Dashboard iniciado en puerto ${this.port}`);
      console.log(`🌐 Accede al dashboard en: http://localhost:${this.port}`);
    });
  }
}

// Crear e iniciar servidor si se ejecuta directamente
if (require.main === module) {
  const server = new DashboardServer();
  server.start();
}

module.exports = DashboardServer;