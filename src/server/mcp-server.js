const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

class MCPServer {
  constructor() {
    this.app = express();
    this.wss = null;
    this.clients = new Map();
    this.logs = [];
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.loadServerConfigs();
  }

  setupMiddleware() {
    // Seguridad
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:8283'
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
      max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
      message: 'Demasiadas peticiones desde esta IP'
    });
    this.app.use(limiter);

    // Logging
    this.app.use(morgan('combined'));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: require('../../package.json').version
      });
    });

    // Listar herramientas disponibles
    this.app.get('/tools', (req, res) => {
      res.json({
        tools: this.getAvailableTools()
      });
    });

    // Ejecutar herramienta MCP
    this.app.post('/tools/:toolName', async (req, res) => {
      try {
        const { toolName } = req.params;
        const { parameters, serverId } = req.body;

        this.log(`Ejecutando herramienta: ${toolName}`, 'info');

        const result = await this.executeTool(toolName, parameters, serverId);

        this.log(`Herramienta ${toolName} ejecutada exitosamente`, 'success');
        this.broadcastToWebSocket({
          type: 'tool_execution',
          toolName,
          success: true,
          result,
          timestamp: new Date().toISOString()
        });

        res.json({
          success: true,
          result
        });
      } catch (error) {
        this.log(`Error ejecutando herramienta ${req.params.toolName}: ${error.message}`, 'error');
        this.broadcastToWebSocket({
          type: 'tool_execution',
          toolName: req.params.toolName,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });

        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Estado de servidores
    this.app.get('/servers', (req, res) => {
      res.json({
        servers: this.serverConfigs,
        activeConnections: this.clients.size
      });
    });

    // Logs del servidor
    this.app.get('/logs', (req, res) => {
      const limit = parseInt(req.query.limit) || 100;
      res.json({
        logs: this.logs.slice(-limit)
      });
    });

    // Dashboard API
    this.app.get('/dashboard/stats', (req, res) => {
      res.json({
        uptime: process.uptime(),
        totalRequests: this.getTotalRequests(),
        activeConnections: this.clients.size,
        serverHealth: this.getServerHealth(),
        recentActivity: this.logs.slice(-10)
      });
    });
  }

  setupWebSocket() {
    const server = this.app.listen(process.env.MCP_PORT || 3000, () => {
      console.log(`🚀 Servidor MCP iniciado en puerto ${process.env.MCP_PORT || 3000}`);
    });

    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);

      this.log(`Cliente WebSocket conectado: ${clientId}`, 'info');

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleWebSocketMessage(clientId, data);
        } catch (error) {
          this.log(`Error procesando mensaje WebSocket: ${error.message}`, 'error');
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        this.log(`Cliente WebSocket desconectado: ${clientId}`, 'info');
      });

      // Enviar estado inicial al cliente
      ws.send(JSON.stringify({
        type: 'welcome',
        clientId,
        timestamp: new Date().toISOString()
      }));
    });
  }

  loadServerConfigs() {
    try {
      const configPath = process.env.SERVERS_CONFIG_PATH || './src/config/servers.json';
      const configData = fs.readFileSync(configPath, 'utf8');
      this.serverConfigs = JSON.parse(configData);

      // Expandir variables de entorno en la configuración
      this.serverConfigs = this.expandEnvironmentVariables(this.serverConfigs);

      this.log(`Configuración de servidores cargada: ${this.serverConfigs.servers.length} servidores`, 'info');
    } catch (error) {
      this.log(`Error cargando configuración de servidores: ${error.message}`, 'error');
      this.serverConfigs = { servers: [] };
    }
  }

  expandEnvironmentVariables(obj) {
    const str = JSON.stringify(obj);
    const expanded = str.replace(/\$\{([^}]+)\}/g, (match, varName) => {
      return process.env[varName] || match;
    });
    return JSON.parse(expanded);
  }

  getAvailableTools() {
    return [
      {
        name: 'github_create_repo',
        description: 'Crear un nuevo repositorio en GitHub',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Nombre del repositorio' },
            description: { type: 'string', description: 'Descripción del repositorio' },
            private: { type: 'boolean', description: '¿Es privado?' },
            serverId: { type: 'string', description: 'ID del servidor GitHub' }
          },
          required: ['name']
        }
      },
      {
        name: 'github_create_branch',
        description: 'Crear una nueva rama en el repositorio',
        parameters: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Propietario del repositorio' },
            repo: { type: 'string', description: 'Nombre del repositorio' },
            branchName: { type: 'string', description: 'Nombre de la nueva rama' },
            baseBranch: { type: 'string', description: 'Rama base (por defecto: main)' },
            serverId: { type: 'string', description: 'ID del servidor GitHub' }
          },
          required: ['owner', 'repo', 'branchName']
        }
      },
      {
        name: 'github_create_pr',
        description: 'Crear un pull request',
        parameters: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Propietario del repositorio' },
            repo: { type: 'string', description: 'Nombre del repositorio' },
            title: { type: 'string', description: 'Título del PR' },
            body: { type: 'string', description: 'Descripción del PR' },
            head: { type: 'string', description: 'Rama fuente' },
            base: { type: 'string', description: 'Rama objetivo' },
            serverId: { type: 'string', description: 'ID del servidor GitHub' }
          },
          required: ['owner', 'repo', 'title', 'head']
        }
      },
      {
        name: 'github_merge_pr',
        description: 'Merge un pull request',
        parameters: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Propietario del repositorio' },
            repo: { type: 'string', description: 'Nombre del repositorio' },
            pullNumber: { type: 'number', description: 'Número del PR' },
            mergeMethod: { type: 'string', description: 'Método de merge (merge, squash, rebase)' },
            serverId: { type: 'string', description: 'ID del servidor GitHub' }
          },
          required: ['owner', 'repo', 'pullNumber']
        }
      },
      {
        name: 'github_create_issue',
        description: 'Crear un issue en el repositorio',
        parameters: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Propietario del repositorio' },
            repo: { type: 'string', description: 'Nombre del repositorio' },
            title: { type: 'string', description: 'Título del issue' },
            body: { type: 'string', description: 'Descripción del issue' },
            labels: { type: 'array', description: 'Etiquetas del issue' },
            serverId: { type: 'string', description: 'ID del servidor GitHub' }
          },
          required: ['owner', 'repo', 'title']
        }
      },
      {
        name: 'github_list_repos',
        description: 'Listar repositorios del usuario/organización',
        parameters: {
          type: 'object',
          properties: {
            type: { type: 'string', description: 'Tipo: owner, member, public' },
            sort: { type: 'string', description: 'Orden: created, updated, pushed, full_name' },
            per_page: { type: 'number', description: 'Resultados por página' },
            serverId: { type: 'string', description: 'ID del servidor GitHub' }
          }
        }
      },
      {
        name: 'github_get_repo_info',
        description: 'Obtener información detallada de un repositorio',
        parameters: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Propietario del repositorio' },
            repo: { type: 'string', description: 'Nombre del repositorio' },
            serverId: { type: 'string', description: 'ID del servidor GitHub' }
          },
          required: ['owner', 'repo']
        }
      }
    ];
  }

  async executeTool(toolName, parameters, serverId) {
    const serverConfig = this.serverConfigs.servers.find(s => s.id === serverId);

    if (!serverConfig) {
      throw new Error(`Servidor no encontrado: ${serverId}`);
    }

    const GitHubClient = require('./github-client');
    const github = new GitHubClient({
      token: serverConfig.config.token,
      baseUrl: serverConfig.config.baseUrl,
      owner: parameters.owner,
      repo: parameters.repo
    });

    switch (toolName) {
      case 'github_create_repo':
        return await github.createRepository(parameters.name, {
          description: parameters.description,
          private: parameters.private
        });

      case 'github_create_branch':
        return await github.createBranch(parameters.branchName, parameters.baseBranch);

      case 'github_create_pr':
        return await github.createPullRequest(
          parameters.title,
          parameters.body,
          parameters.head,
          parameters.base
        );

      case 'github_merge_pr':
        return await github.mergePullRequest(
          parameters.pullNumber,
          parameters.mergeMethod
        );

      case 'github_create_issue':
        return await github.createIssue(
          parameters.title,
          parameters.body,
          parameters.labels
        );

      case 'github_list_repos':
        const { Octokit } = require('@octokit/rest');
        const octokit = new Octokit({ auth: serverConfig.config.token });

        const response = await octokit.repos.listForAuthenticatedUser({
          type: parameters.type || 'owner',
          sort: parameters.sort || 'updated',
          per_page: parameters.per_page || 30
        });

        return response.data;

      case 'github_get_repo_info':
        return await github.getRepositoryInfo();

      default:
        throw new Error(`Herramienta no encontrada: ${toolName}`);
    }
  }

  handleWebSocketMessage(clientId, data) {
    this.log(`Mensaje WebSocket de ${clientId}: ${data.type}`, 'info');

    // Manejar diferentes tipos de mensajes
    switch (data.type) {
      case 'ping':
        this.clients.get(clientId).send(JSON.stringify({ type: 'pong' }));
        break;

      case 'subscribe_logs':
        // El cliente se suscribe a logs en tiempo real
        break;

      default:
        this.log(`Tipo de mensaje WebSocket desconocido: ${data.type}`, 'warn');
    }
  }

  broadcastToWebSocket(message) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach((ws, clientId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  log(message, level = 'info') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message
    };

    this.logs.push(logEntry);
    console.log(`[${level.toUpperCase()}] ${message}`);

    // Mantener solo los últimos 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getTotalRequests() {
    // Esta es una implementación básica, en producción usarías una base de datos
    return this.logs.filter(log => log.message.includes('Ejecutando herramienta')).length;
  }

  getServerHealth() {
    return {
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      activeServers: this.serverConfigs.servers.filter(s => s.enabled).length,
      totalServers: this.serverConfigs.servers.length
    };
  }

  // Método para iniciar el servidor
  start() {
    this.log('Iniciando servidor MCP para GitHub', 'info');
    this.log(`Puerto: ${process.env.MCP_PORT || 3000}`, 'info');
    this.log(`Dashboard habilitado: ${process.env.DASHBOARD_ENABLED || 'true'}`, 'info');
  }
}

// Crear e iniciar servidor si se ejecuta directamente
if (require.main === module) {
  const server = new MCPServer();
  server.start();
}

module.exports = MCPServer;