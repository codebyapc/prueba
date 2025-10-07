# Guía de Uso - MCP GitHub Server

## 🚀 Inicio Rápido

### 1. Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd mcp-github-server

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env .env.local
# Editar .env.local con tus tokens de GitHub
```

### 2. Configuración

Edita el archivo `.env` con tu información:

```env
# Token de GitHub (necesario)
GITHUB_TOKEN=ghp_your_github_token_here

# Puertos del servidor
MCP_PORT=8282
DASHBOARD_PORT=8283

# Otros ajustes...
```

### 3. Ejecutar el servidor

```bash
# Iniciar servidor MCP
npm start

# O iniciar en modo desarrollo
npm run dev

# Iniciar dashboard (en otra terminal)
npm run dashboard
```

### 4. Acceder al dashboard

Abre tu navegador y ve a: `http://localhost:8283`

## 📖 Uso del Servidor MCP

### Herramientas Disponibles

El servidor MCP proporciona las siguientes herramientas para GitHub:

#### Gestión de Repositorios
- `github_create_repo` - Crear nuevo repositorio
- `github_get_repo_info` - Obtener información del repositorio

#### Gestión de Ramas
- `github_create_branch` - Crear nueva rama
- `github_list_branches` - Listar ramas disponibles

#### Pull Requests
- `github_create_pr` - Crear pull request
- `github_merge_pr` - Merge pull request
- `github_list_prs` - Listar pull requests

#### Issues
- `github_create_issue` - Crear issue
- `github_list_issues` - Listar issues

#### Commits
- `github_list_commits` - Listar commits

### Ejemplos de Uso

#### Crear un repositorio
```javascript
// Ejemplo de llamada MCP
{
  "toolName": "github_create_repo",
  "parameters": {
    "name": "mi-nuevo-proyecto",
    "description": "Descripción del proyecto",
    "private": false,
    "serverId": "github-server-1"
  }
}
```

#### Crear una rama
```javascript
{
  "toolName": "github_create_branch",
  "parameters": {
    "owner": "miusuario",
    "repo": "mi-repositorio",
    "branchName": "nueva-feature",
    "baseBranch": "main",
    "serverId": "github-server-1"
  }
}
```

#### Crear pull request
```javascript
{
  "toolName": "github_create_pr",
  "parameters": {
    "owner": "miusuario",
    "repo": "mi-repositorio",
    "title": "Nueva funcionalidad",
    "body": "Descripción de los cambios",
    "head": "nueva-feature",
    "base": "main",
    "serverId": "github-server-1"
  }
}
```

## ⚙️ Configuración Avanzada

### Múltiples Servidores GitHub

Edita `src/config/servers.json` para configurar múltiples servidores:

```json
{
  "servers": [
    {
      "id": "personal",
      "name": "GitHub Personal",
      "type": "github",
      "config": {
        "token": "ghp_token_personal",
        "baseUrl": "https://api.github.com"
      },
      "enabled": true
    },
    {
      "id": "trabajo",
      "name": "GitHub Trabajo",
      "type": "github",
      "config": {
        "token": "ghp_token_trabajo",
        "baseUrl": "https://api.github.com",
        "organization": "empresa"
      },
      "enabled": true
    }
  ]
}
```

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `GITHUB_TOKEN` | Token de acceso de GitHub | Requerido |
| `MCP_PORT` | Puerto del servidor MCP | 3000 |
| `DASHBOARD_PORT` | Puerto del dashboard | 8283 |
| `LOG_LEVEL` | Nivel de logging | info |
| `CORS_ORIGIN` | Origen permitido para CORS | http://localhost:8283 |

## 🐳 Despliegue con Docker

### Construir imagen
```bash
docker build -t mcp-github-server .
```

### Ejecutar contenedor
```bash
docker run -d \
  --name mcp-github-server \
  -p 8282:8282 \
  -p 8283:8283 \
  -v /path/to/.env:/app/.env \
  mcp-github-server
```

## 🔧 Desarrollo

### Estructura del proyecto
```
mcp-github-server/
├── src/
│   ├── server/
│   │   ├── mcp-server.js      # Servidor MCP principal
│   │   ├── github-client.js   # Cliente GitHub API
│   │   └── tools/             # Herramientas adicionales
│   ├── dashboard/
│   │   ├── server.js          # Servidor del dashboard
│   │   └── static/            # Archivos estáticos del frontend
│   └── config/
│       └── servers.json       # Configuración de servidores
├── .env                       # Variables de entorno
├── package.json               # Dependencias y scripts
├── Dockerfile                 # Para despliegue
└── README.md                  # Esta documentación
```

### Scripts disponibles
- `npm start` - Iniciar servidor MCP
- `npm run dev` - Modo desarrollo con nodemon
- `npm run dashboard` - Iniciar solo el dashboard
- `npm test` - Ejecutar tests
- `npm run docker:build` - Construir imagen Docker
- `npm run docker:run` - Ejecutar con Docker

## 🔍 Monitoreo

### Dashboard
El dashboard proporciona:
- Estado de conexión del servidor MCP
- Estadísticas de uso en tiempo real
- Logs de operaciones
- Estado de servidores configurados
- Gráfico de actividad

### Logs
Los logs se almacenan en:
- Consola del servidor
- Archivo: `logs/mcp-server.log` (configurable)
- Dashboard web en tiempo real

### Health Check
Endpoint para verificar estado del servidor:
```
GET http://localhost:3000/health
```

## 🚨 Solución de Problemas

### Error común: Token de GitHub inválido
```
Error: Bad credentials
```
**Solución**: Verifica que tu token de GitHub tenga los permisos necesarios:
- `repo` - Acceso completo a repositorios públicos y privados
- `public_repo` - Acceso a repositorios públicos
- `workflow` - Para acciones de GitHub (opcional)

### Error: Puerto ocupado
```
Error: listen EADDRINUSE: address already in use
```
**Solución**: Cambia el puerto en `.env`:
```env
MCP_PORT=8283
DASHBOARD_PORT=3002
```

### Error: CORS
```
Access-Control-Allow-Origin
```
**Solución**: Configura `CORS_ORIGIN` en `.env`:
```env
CORS_ORIGIN=http://localhost:8283
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras problemas o tienes preguntas:

1. Revisa la documentación
2. Busca en los Issues existentes
3. Crea un nuevo Issue con detalles del problema
4. Proporciona logs de error y pasos para reproducir

---

**¡Feliz coding! 🚀**