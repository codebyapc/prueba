# Gestión de Salas y Centros

Sistema completo para la gestión y reserva de salas en centros educativos y empresariales.

## Características

- ✅ Gestión de salas (añadir, editar, eliminar)
- ✅ Gestión de centros
- ✅ Sistema de reservas
- ✅ Autorización de reservas
- ✅ Reagendado de reservas
- ✅ Notificaciones automáticas

## Arquitectura

### Backend
- **Framework**: Node.js + Express
- **Base de datos**: SQLite (desarrollo) / PostgreSQL (producción)
- **Autenticación**: JWT
- **Validación**: Joi
- **Seguridad**: Helmet, CORS

### Frontend
- **Framework**: React 18
- **UI Library**: Ant Design
- **Estado**: React Query
- **Routing**: React Router v6
- **Estilos**: CSS3 + Styled Components

## Estructura del Proyecto

```
/
├── backend/                 # API REST
│   ├── server.js           # Punto de entrada
│   └── package.json        # Dependencias del backend
├── frontend/               # Aplicación React
│   ├── public/
│   │   └── index.html      # Template HTML
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── App.js         # Componente principal
│   │   └── index.js       # Punto de entrada React
│   └── package.json       # Dependencias del frontend
├── docs/                  # Documentación
└── requirements.md        # Especificaciones funcionales
```

## Instalación y Desarrollo

### Prerrequisitos
- Node.js 16+
- npm o yarn

### Backend
```bash
cd backend
npm install
npm run dev  # Desarrollo con nodemon
```

### Frontend
```bash
cd frontend
npm install
npm start    # Desarrollo con hot reload
```

## Ramas de Desarrollo

Cada funcionalidad tiene su propia rama siguiendo el patrón `feature/nombre-funcionalidad`:

- `feature/add-room` - Funcionalidad de añadir salas
- `feature/edit-room` - Funcionalidad de editar salas
- `feature/delete-room` - Funcionalidad de eliminar salas
- `feature/book-room` - Sistema de reservas
- `feature/approve-reservation` - Autorización de reservas
- `feature/reschedule-reservation` - Reagendado de reservas

## API Endpoints

### Centros
- `GET /api/centers` - Listar centros
- `GET /api/centers/:id` - Obtener centro específico
- `POST /api/centers` - Crear centro
- `PUT /api/centers/:id` - Actualizar centro
- `DELETE /api/centers/:id` - Eliminar centro

### Salas
- `GET /api/rooms` - Listar salas
- `GET /api/rooms/:id` - Obtener sala específica
- `POST /api/rooms` - Crear sala
- `PUT /api/rooms/:id` - Actualizar sala
- `DELETE /api/rooms/:id` - Eliminar sala

### Reservas
- `GET /api/bookings` - Listar reservas
- `GET /api/bookings/:id` - Obtener reserva específica
- `POST /api/bookings` - Crear reserva
- `PUT /api/bookings/:id` - Actualizar reserva
- `PUT /api/bookings/:id/reschedule` - Reagendar reserva
- `PUT /api/bookings/:id/approve` - Aprobar/rechazar reserva
- `DELETE /api/bookings/:id` - Cancelar reserva

### Notificaciones
- `GET /api/notifications` - Listar notificaciones
- `GET /api/notifications/:id` - Obtener notificación específica
- `POST /api/notifications` - Crear notificación
- `PUT /api/notifications/:id` - Actualizar notificación
- `POST /api/notifications/:id/resend` - Reenviar notificación
- `DELETE /api/notifications/:id` - Eliminar notificación

## Estados de Desarrollo

- ✅ Ramas creadas en GitHub
- ✅ Estructura base del proyecto configurada
- ✅ Funcionalidad de reagendado implementada
- ✅ Gestión completa de salas (CRUD)
- ✅ Gestión completa de centros (CRUD)
- ✅ Sistema completo de reservas
- ✅ Sistema de autorización de reservas
- ✅ Sistema de notificaciones automático
- ✅ Tests comprehensivos para todas las funcionalidades
- 🔄 Sincronización con Linear (pendiente)
- ⏳ Implementación del frontend React

## Tecnologías Utilizadas

- **Backend**: Node.js, Express, SQLite, Sequelize
- **Frontend**: React, Ant Design, React Query
- **Desarrollo**: Git, GitHub, Linear
- **Despliegue**: Docker (planeado)

## Contribución

1. Crear rama desde `main`
2. Desarrollar funcionalidad
3. Crear Pull Request
4. Revisión de código
5. Merge a `main`

## Licencia

MIT License - ver archivo LICENSE para más detalles.
