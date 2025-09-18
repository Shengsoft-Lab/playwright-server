module.exports = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT) || 80,
    host: '0.0.0.0'
  },

  // Browser configuration
  browsers: {
    // WebKit configuration
    webkit: {
      startPort: parseInt(process.env.WEBKIT_START_PORT) || 20000,
      enabled: process.env.WEBKIT_ENABLED !== 'false',
      ttl: parseInt(process.env.WEBKIT_TTL) || 2 * 60 * 60 * 1000, // 2 hours in milliseconds
      launchOptions: {
        headless: true,
        args: [
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-field-trial-config',
          '--disable-ipc-flooding-protection',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    },

    // Chrome configuration
    chrome: {
      startPort: parseInt(process.env.CHROME_START_PORT) || 30000,
      enabled: process.env.CHROME_ENABLED !== 'false',
      ttl: parseInt(process.env.CHROME_TTL) || 2 * 60 * 60 * 1000, // 2 hours in milliseconds
      launchOptions: {
        headless: true,
        args: [
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-field-trial-config',
          '--disable-ipc-flooding-protection',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-extensions',
          '--disable-default-apps'
        ]
      }
    }
  },

  // Proxy configuration
  proxy: {
    timeout: 30000,
    proxyTimeout: 30000,
    changeOrigin: true
  },

  // Cleanup configuration
  cleanup: {
    interval: parseInt(process.env.CLEANUP_INTERVAL) || 5 * 60 * 1000, // 5 minutes
    enabled: process.env.CLEANUP_ENABLED !== 'false'
  }
};
