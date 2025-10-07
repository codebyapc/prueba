FROM node:18-alpine

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY .env ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY src/ ./src/
COPY README.md ./

# Crear directorio para logs
RUN mkdir -p logs

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mcpuser -u 1001

# Cambiar propietario de archivos
RUN chown -R mcpuser:nodejs /app
USER mcpuser

# Exponer puertos
EXPOSE 8282 8283

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando por defecto
CMD ["npm", "start"]