import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // When running inside Docker the Vite dev-server proxies /api calls to the
    // relevant backend containers.  When running locally the targets fall back
    // to the default localhost ports.
    const employeeServiceTarget =
      env.VITE_EMPLOYEE_PROXY_TARGET || 'http://localhost:8082';

    // Auth service proxy target (port 9000).
    const authServiceTarget =
      env.VITE_AUTH_PROXY_TARGET || 'http://localhost:9000';

    // Appointment service proxy target (port 8080).
    const appointmentServiceTarget =
      env.VITE_APPOINTMENT_PROXY_TARGET || 'http://localhost:8080';

    // Hospital service proxy target (port 8100).
    const hospitalServiceTarget =
      env.VITE_HOSPITAL_PROXY_TARGET || 'http://localhost:8100';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Use polling for file-change detection so that edits made on the macOS
        // host are picked up inside the Docker container (chokidar inotify events
        // are not forwarded through the Docker Desktop virtual filesystem).
        watch: {
          usePolling: true,
          interval: 300,
        },
        proxy: {
          // ── Auth service (port 9000) ───────────────────────────────────────
          // MUST be listed before the broader /api rule so that Vite matches
          // /api/auth/login before /api/employees/...
          '/api/auth': {
            target: authServiceTarget,
            changeOrigin: true,
            secure: false,
            headers: { origin: 'http://localhost:3002' },
          },

          // ── Hospital service (port 8100) ───────────────────────────────────
          // MUST be listed before the broader /api rule so that Vite matches
          // /api/complaints before /api/employees/...
          '/api/complaints': {
            target: hospitalServiceTarget,
            changeOrigin: true,
            secure: false,
            headers: { origin: 'http://localhost:3002' },
          },

          // ── Employee service (port 8082) ───────────────────────────────────
          // Catches all remaining /api/... requests.
          '/api': {
            target: employeeServiceTarget,
            changeOrigin: true,
            secure: false,
            headers: { origin: 'http://localhost:3002' },
          },

          // ── Appointment service (port 8080) ────────────────────────────────
          // MUST be listed after /api/auth so it does not intercept auth calls.
          '/appointment': {
            target: appointmentServiceTarget,
            changeOrigin: true,
            secure: false,
            rewrite: (path: string) => path.replace(/^\/appointment/, ''),
            headers: { origin: 'http://localhost:3002' },
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
