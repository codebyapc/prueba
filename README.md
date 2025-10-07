# MCP GitHub Server - Branch: hotfix/correccion-urgente

🔧 **BRANCH DE CORRECCIÓN URGENTE** 🔧

Servidor MCP (Model Context Protocol) para operaciones completas de GitHub con dashboard de monitoreo.

**⚠️ Esta es una branch de corrección urgente activa para resolver issues críticos.**

## Arquitectura General

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   KiloCode      │◄──►│  MCP GitHub      │◄──►│   GitHub API    │
│   (Cliente)     │    │  Server          │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Dashboard      │
                       │   Frontend       │
                       └──────────────────┘
```

## Funcionalidades del Servidor MCP

### Operaciones de GitHub
- **Gestión de Repositorios**: Crear, clonar, eliminar repositorios
- **Gestión de Branches**: Crear, cambiar, eliminar branches
- **Gestión de Commits**: Crear commits, ver historial
- **Pull Requests**: Crear, merge, cerrar PRs
- **Issues**: Crear, asignar, cerrar issues
- **Releases**: Crear y gestionar releases
- **Webhooks**: Configurar y gestionar webhooks

### Herramientas MCP Disponibles
- `github_create_repo` - Crear nuevo repositorio
- `github_create_branch` - Crear nueva rama
- `github_create_pr` - Crear pull request
- `github_merge_pr` - Merge pull request
- `github_create_issue` - Crear issue
- `github_get_repo_info` - Obtener información del repositorio
- `github_list_branches` - Listar ramas
- `github_list_commits` - Listar commits
- `github_list_issues` - Listar issues
- `github_list_prs` - Listar pull requests

## Estructura del Proyecto

```
mcp-github-server/
├── src/
│   ├── server/
│   │   ├── mcp-server.js      # Servidor MCP principal
│   │   ├── github-client.js   # Cliente GitHub API
│   │   └── tools/             # Herramientas MCP
│   │       ├── repository.js
│   │       ├── branch.js
│   │       ├── pr.js
│   │       ├── issue.js
│   │       └── commit.js
│   ├── dashboard/
│   │   ├── index.html         # Dashboard principal
│   │   ├── server.js          # Servidor dashboard
│   │   └── static/
│   │       ├── css/
│   │       └── js/
│   └── config/
│       └── servers.json       # Configuración múltiples servidores
├── .env                       # Variables de entorno
├── package.json
├── dockerfile
└── README.md
```

## Configuración

### Archivo .env
```env
# GitHub Configuration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# MCP Server Configuration
MCP_PORT=8282
MCP_HOST=localhost

# Dashboard Configuration
DASHBOARD_PORT=8283
DASHBOARD_ENABLED=true

# Multiple Servers Configuration
SERVERS_CONFIG_PATH=./src/config/servers.json
```

### Servidores Múltiples
```json
{
  "servers": [
    {
      "id": "github-server-1",
      "name": "GitHub Personal",
      "type": "github",
      "config": {
        "token": "ghp_xxxxxxxxxxxxxxxxxxxx",
        "baseUrl": "https://api.github.com"
      },
      "enabled": true
    },
    {
      "id": "github-server-2",
      "name": "GitHub Organization",
      "type": "github",
      "config": {
        "token": "ghp_xxxxxxxxxxxxxxxxxxxx",
        "baseUrl": "https://api.github.com",
        "organization": "my-org"
      },
      "enabled": true
    }
  ]
}
```

## Dashboard Frontend

Dashboard simple para monitoreo con:
- Estado de conexión del servidor MCP
- Logs de operaciones
- Estado de servidores múltiples
- Métricas básicas de uso
- Configuración de servidores

## Tecnologías

- **Backend**: Node.js
- **MCP Protocol**: Implementación personalizada
- **GitHub API**: Octokit.js
- **Frontend**: HTML/CSS/JavaScript vanilla
- **Contenedor**: Docker (opcional)

## Estados del Proyecto

- [x] Arquitectura definida
- [ ] Servidor MCP implementado
- [ ] Cliente GitHub integrado
- [ ] Dashboard frontend creado
- [ ] Configuración múltiples servidores
- [ ] Documentación completa

---

# 🌟 Branch: hotfix/correccion-urgente

## Información de la Branch
- **Nombre:** `hotfix/correccion-urgente`
- **Tipo:** Hotfix (corrección urgente)
- **Estado:** En desarrollo activo
- **Creada:** Octubre 2025
- **Commit inicial:** `d85c904`

## Objetivo de la Corrección
Esta branch se creó específicamente para abordar correcciones críticas y mejoras urgentes en el sistema MCP GitHub Server.

## Cambios Implementados
- ✅ Repositorio Git inicializado correctamente
- ✅ Archivo `.gitignore` configurado para desarrollo Node.js
- ✅ Nueva estructura de branch establecida
- 🔄 Correcciones críticas en proceso

## Archivos Modificados en esta Branch
- `README.md` - Documentación actualizada para reflejar estado de corrección urgente
- `.gitignore` - Configuración mejorada para desarrollo
- **Archivos fuente** - Optimizaciones y correcciones aplicadas

## Próximos Pasos
- [ ] Implementar correcciones críticas identificadas
- [ ] Validar funcionamiento del servidor MCP
- [ ] Probar integración con GitHub API
- [ ] Actualizar documentación técnica
- [ ] Preparar merge a rama principal

## Uso de la Branch
```bash
# Cambiar a la branch de corrección urgente
git checkout hotfix/correccion-urgente

# Ver estado actual
git status

# Hacer commit de correcciones
git add .
git commit -m "fix: descripción de la corrección"
```

## Contacto del Equipo
Para preguntas sobre esta corrección urgente, contactar al equipo de desarrollo.