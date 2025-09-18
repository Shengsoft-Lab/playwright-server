#!/usr/bin/env node

const http = require('http');
const httpProxy = require('http-proxy');
const BrowserManager = require('./BrowserManager');
const config = require('../config/default');

class PlaywrightServer {
  constructor() {
    this.browserManager = new BrowserManager();
    this.proxyServer = null;
    this.proxy = null;
  }

  /**
   * Create and start the proxy server
   */
  async start() {
    console.log('🚀 Starting Playwright proxy server...\n');

    try {
      // Create HTTP proxy
      this.proxy = httpProxy.createProxyServer({
        ws: true,
        changeOrigin: config.proxy.changeOrigin,
        timeout: config.proxy.timeout,
        proxyTimeout: config.proxy.proxyTimeout
      });

      // Create HTTP server
      this.proxyServer = http.createServer((req, res) => {
        this.handleHttpRequest(req, res);
      });

      // Handle WebSocket upgrade requests
      this.proxyServer.on('upgrade', async (req, socket, head) => {
        await this.handleWebSocketUpgrade(req, socket, head);
      });

      // Start server
      this.proxyServer.listen(config.server.port, config.server.host, () => {
        console.log(`✅ Playwright proxy server started successfully!`);
        console.log(`   Server listening on ${config.server.host}:${config.server.port}`);
        console.log(`   Config host: ${config.server.host}`);
        console.log(`   WebKit servers will be created on-demand (starting from port ${config.browsers.webkit.startPort})`);
        console.log(`   Chrome servers will be created on-demand (starting from port ${config.browsers.chrome.startPort})`);
        console.log(`   Server TTL: ${config.browsers.webkit.ttl / 1000 / 60} minutes`);
        console.log(`   Available WebSocket paths:`);
        console.log(`     ws://${config.server.host}:${config.server.port}/webkit-<index> → WebKit Server (on-demand)`);
        console.log(`     ws://${config.server.host}:${config.server.port}/chrome-<index> → Chrome Server (on-demand)`);
        console.log('\n⚠️  Server will keep running...');
      });

      this.proxyServer.on('error', (error) => {
        console.error(`❌ Proxy server error:`, error.message);
      });

      // Setup graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      console.error('\n❌ Failed to start server:', error.message);
      await this.cleanup();
      process.exit(1);
    }
  }

  /**
   * Handle HTTP requests
   */
  handleHttpRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Health check endpoint
    if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }

    // Stats endpoint
    if (url.pathname === '/stats') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(this.browserManager.getStats(), null, 2));
      return;
    }

    // Default response
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Playwright Proxy Server\n\nAvailable endpoints:\n- GET /health - Health check\n- GET /stats - Server statistics\n- WebSocket paths: /webkit-<index>, /chrome-<index>');
  }

  /**
   * Handle WebSocket upgrade requests
   */
  async handleWebSocketUpgrade(req, socket, head) {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;

    try {
      // Parse browser type and index from path
      const match = path.match(/^\/(webkit|chrome)-(\d+)$/);
      if (!match) {
        console.error(`❌ Invalid WebSocket path: ${path}`);
        socket.destroy();
        return;
      }

      const [, browserType, indexStr] = match;
      const serverIndex = parseInt(indexStr);

      if (isNaN(serverIndex) || serverIndex < 0) {
        console.error(`❌ Invalid server index: ${indexStr}`);
        socket.destroy();
        return;
      }

      // Get or create browser server
      const serverInfo = await this.browserManager.getOrCreateServer(browserType, serverIndex);
      const target = `http://127.0.0.1:${serverInfo.port}`;

      // Proxy the WebSocket connection
      this.proxy.ws(req, socket, head, { target }, (error) => {
        console.error(`❌ WebSocket proxy error for ${path}:`, error.message);
        socket.destroy();
      });

    } catch (error) {
      console.error(`❌ Failed to handle WebSocket upgrade for ${path}:`, error.message);
      socket.destroy();
    }
  }

  /**
   * Setup graceful shutdown handlers
   */
  setupGracefulShutdown() {
    // Handle process exit signals
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Received SIGINT, shutting down gracefully...');
      await this.cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n\n🛑 Received SIGTERM, shutting down gracefully...');
      await this.cleanup();
      process.exit(0);
    });

    process.on('uncaughtException', async (error) => {
      console.error('\n❌ Uncaught Exception:', error);
      await this.cleanup();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error('\n❌ Unhandled Rejection at:', promise, 'reason:', reason);
      await this.cleanup();
      process.exit(1);
    });
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    console.log('\n🧹 Cleaning up server resources...');

    try {
      // Close proxy server
      if (this.proxyServer) {
        this.proxyServer.close();
        console.log(`✅ Proxy server closed`);
        this.proxyServer = null;
      }

      // Cleanup browser manager
      if (this.browserManager) {
        await this.browserManager.cleanup();
      }

      console.log(`✅ All resources cleaned up`);

    } catch (error) {
      console.error(`❌ Error during cleanup:`, error.message);
    }
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new PlaywrightServer();
  server.start().catch(async (error) => {
    console.error('❌ Startup failed:', error);
    await server.cleanup();
    process.exit(1);
  });
}

module.exports = PlaywrightServer;
