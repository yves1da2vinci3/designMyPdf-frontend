export enum Environment {
    DEV_SIMULATOR = "dev-simulator",
    DEV = "dev",
    PROD = "prod",
    STAGING = "staging",
  }
  
  export interface AppConfig {
    env?: Environment;
    appVersion: string;
    appBranch: string;
    cookieKey: string;
    apiBaseUrl: string;
  }
  
  export const AppConfig: AppConfig = {
    env: (process.env._ENV as Environment) || Environment.DEV,
    appVersion: (process.env._VERSION as string) || "local",
    appBranch: (process.env.BRANCH as string) || "local",
    cookieKey: "fest_nat_data",
    apiBaseUrl:
      (process.env.API_BASE_URL as string) || "http://localhost:5000/api",
  
  };
  