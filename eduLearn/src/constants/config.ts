import Constants from 'expo-constants';
import { AppConfig } from '../types/env';

const config: AppConfig = {
  apiBaseUrl: Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:8000/api',
  apiAuthUrl: Constants.expoConfig?.extra?.apiAuthUrl || 'http://localhost:8000/api/auth',
  appName: Constants.expoConfig?.extra?.appName || 'eduLearn',
  nodeEnv: Constants.expoConfig?.extra?.nodeEnv || 'development',
};

export default config;