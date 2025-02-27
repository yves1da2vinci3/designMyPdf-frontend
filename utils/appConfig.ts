export enum Environment {
  DEV_SIMULATOR = 'dev-simulator',
  DEV = 'dev',
  PROD = 'prod',
  STAGING = 'staging',
}

export interface AppConfig {
  env?: Environment;
  appVersion: string;
  appBranch: string;
  cookieKey: string;
  apiBaseUrl: string;
}

export const AppConfig: AppConfig = {
  env: (process.env.NEXT_PUBLIC_ENV as Environment) || Environment.DEV,
  appVersion: (process.env.NEXT_PUBLIC_VERSION as string) || 'local',
  appBranch: (process.env.NEXT_PUBLIC_BRANCH as string) || 'local',
  cookieKey: 'fest_nat_data',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL as string,
};
