import { defineConfig, type Plugin } from 'vite';
import { demoMiddleware } from './src/mock/demoMiddleware';

function demoApiPlugin(): Plugin {
  return {
    name: 'demo-api-server',
    configureServer(server) {
      server.middlewares.use(demoMiddleware());
    },
  };
}

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
  },
  plugins: [demoApiPlugin()],
});
