/**
 * Server-side environment configuration
 * This file should only be imported in server-side code
 * Environment variables accessed here are NEVER exposed to the browser
 */

interface ServerConfig {
  mongodb: {
    connectionString: string;
    database: string;
  };
  app: {
    nodeEnv: string;
    isDevelopment: boolean;
    isProduction: boolean;
  };
}

function getServerConfig(): ServerConfig {
  const mongoConnectionString = process.env['MONGODB_CONNECTION_STRING'];
  
  // During build/prerender time, MongoDB might not be available
  if (!mongoConnectionString) {
    if (process.env['NODE_ENV'] === 'production' && !process.env['PRERENDER']) {
      throw new Error('MONGODB_CONNECTION_STRING environment variable is required');
    }
    // Return a placeholder for build time
    return {
      mongodb: {
        connectionString: '',
        database: process.env['MONGODB_DATABASE'] || 'staticDb',
      },
      app: {
        nodeEnv: process.env['NODE_ENV'] || 'development',
        isDevelopment: (process.env['NODE_ENV'] || 'development') === 'development',
        isProduction: process.env['NODE_ENV'] === 'production',
      },
    };
  }

  return {
    mongodb: {
      connectionString: mongoConnectionString,
      database: process.env['MONGODB_DATABASE'] || 'staticDb',
    },
    app: {
      nodeEnv: process.env['NODE_ENV'] || 'development',
      isDevelopment: process.env['NODE_ENV'] !== 'production',
      isProduction: process.env['NODE_ENV'] === 'production',
    }
  };
}

// Singleton pattern to avoid re-parsing env vars
let serverConfig: ServerConfig | null = null;

export function getEnv(): ServerConfig {
  if (!serverConfig) {
    serverConfig = getServerConfig();
  }
  return serverConfig;
}
