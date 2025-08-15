declare module 'drizzle-kit' {
  export interface Config {
    schema: string;
    out: string;
    dialect: 'postgresql' | 'mysql' | 'sqlite';
    dbCredentials: {
      url: string;
    };
    verbose?: boolean;
    strict?: boolean;
  }

  export function defineConfig(config: Config): Config;
}
