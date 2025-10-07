class MCPDashboard {
    constructor() {
        this.autoRefresh = true;
        this.refreshInterval = null;
        this.charts = {};

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startAutoRefresh();
        this.loadInitialData();
        this.initCharts();
    }

    setupEventListeners() {
        // Actualizar datos cada 5 segundos si auto-refresh está activo
        this.refreshInterval = setInterval(() => {
            if (this.autoRefresh) {
                this.refreshAllData();
            }
        }, 5000);
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadMCPStats(),
                this.loadServers(),
                this.loadLogs()
            ]);
            this.updateServerStatus('connected');
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            this.updateServerStatus('disconnected');
        }
    }

    async refreshAllData() {
        await this.loadInitialData();
    }

    async loadMCPStats() {
        try {
            const response = await fetch('/api/mcp-stats');
            const data = await response.json();

            this.updateStats(data);
            this.updateActivityChart(data.recentActivity);
        } catch (error) {
            console.error('Error cargando estadísticas MCP:', error);
        }
    }

    async loadServers() {
        try {
            const response = await fetch('/api/servers');
            const data = await response.json();

            this.updateServersList(data.servers);
        } catch (error) {
            console.error('Error cargando servidores:', error);
        }
    }

    async loadLogs() {
        try {
            const response = await fetch('/api/mcp-logs');
            const data = await response.json();

            this.updateLogsList(data.logs);
        } catch (error) {
            console.error('Error cargando logs:', error);
        }
    }

    updateStats(stats) {
        // Formatear uptime
        const uptime = this.formatUptime(stats.uptime);
        document.getElementById('uptime').textContent = uptime;

        document.getElementById('totalRequests').textContent = stats.totalRequests;
        document.getElementById('activeConnections').textContent = stats.activeConnections;
        document.getElementById('serverHealth').textContent = stats.serverHealth.status;
    }

    updateServersList(servers) {
        const serversList = document.getElementById('serversList');

        if (servers.length === 0) {
            serversList.innerHTML = '<div class="server-item"><div class="server-info">No hay servidores configurados</div></div>';
            return;
        }

        serversList.innerHTML = servers.map(server => `
            <div class="server-item">
                <div class="server-info">
                    <div class="server-name">${server.name}</div>
                    <div class="server-type">${server.type}</div>
                </div>
                <div class="server-status">
                    <span class="status-dot ${server.status}"></span>
                    <span class="status-text">${server.status}</span>
                </div>
            </div>
        `).join('');
    }

    updateActivityList(activities) {
        const activityList = document.getElementById('activityList');

        if (activities.length === 0) {
            activityList.innerHTML = '<div class="activity-item"><div class="activity-message">No hay actividad reciente</div></div>';
            return;
        }

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
                <div class="activity-message">${activity.message}</div>
            </div>
        `).join('');
    }

    updateLogsList(logs) {
        const logsList = document.getElementById('logsList');

        if (logs.length === 0) {
            logsList.innerHTML = '<div class="log-item"><div class="log-message">No hay logs disponibles</div></div>';
            return;
        }

        logsList.innerHTML = logs.map(log => `
            <div class="log-item">
                <div class="log-time">${this.formatTime(log.timestamp)}</div>
                <div class="log-level ${log.level}">${log.level}</div>
                <div class="log-message">${log.message}</div>
            </div>
        `).join('');
    }

    updateServerStatus(status) {
        const statusIndicator = document.getElementById('serverStatus');
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('.status-text');

        statusDot.className = `status-dot ${status}`;
        statusText.textContent = status === 'connected' ? 'Conectado' : 'Desconectado';
    }

    initCharts() {
        const ctx = document.getElementById('activityChart').getContext('2d');

        this.charts.activity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Actividad por Hora',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    updateActivityChart(activities) {
        if (!activities || activities.length === 0) return;

        // Procesar actividades para el gráfico (últimas 24 horas)
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentActivities = activities.filter(activity =>
            new Date(activity.timestamp) > last24Hours
        );

        // Agrupar por hora
        const hourlyData = {};
        recentActivities.forEach(activity => {
            const hour = new Date(activity.timestamp).getHours();
            hourlyData[hour] = (hourlyData[hour] || 0) + 1;
        });

        // Crear arrays para el gráfico
        const labels = [];
        const data = [];

        for (let i = 23; i >= 0; i--) {
            const hour = (new Date().getHours() - i + 24) % 24;
            labels.push(`${hour}:00`);
            data.push(hourlyData[hour] || 0);
        }

        this.charts.activity.data.labels = labels;
        this.charts.activity.data.datasets[0].data = data;
        this.charts.activity.update();
    }

    formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) { // Menos de 1 minuto
            return 'Ahora';
        } else if (diff < 3600000) { // Menos de 1 hora
            const minutes = Math.floor(diff / 60000);
            return `Hace ${minutes}m`;
        } else if (diff < 86400000) { // Menos de 1 día
            const hours = Math.floor(diff / 3600000);
            return `Hace ${hours}h`;
        } else {
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
    }

    toggleAutoRefresh() {
        this.autoRefresh = !this.autoRefresh;
        const button = document.getElementById('autoRefreshBtn');

        if (this.autoRefresh) {
            button.textContent = 'Auto-refresh: ON';
            button.classList.remove('disabled');
        } else {
            button.textContent = 'Auto-refresh: OFF';
            button.classList.add('disabled');
        }
    }

    clearLogs() {
        document.getElementById('logsList').innerHTML = '';
    }

    // Método para destruir el dashboard
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
    }
}

// Inicializar dashboard cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.mcpDashboard = new MCPDashboard();
});

// Funciones globales para los botones
function toggleAutoRefresh() {
    window.mcpDashboard.toggleAutoRefresh();
}

function clearLogs() {
    window.mcpDashboard.clearLogs();
}