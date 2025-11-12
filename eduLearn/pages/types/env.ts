export interface AppConfig {
  apiBaseUrl: string;
  apiAuthUrl: string;
  appName: string;
  nodeEnv: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_BASE_URL: string;
      API_AUTH_URL: string;
      APP_NAME: string;
      APP_VERSION: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}