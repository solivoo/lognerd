import { LoggerConfig, LogLevel } from './logger.types';
import { isNodeEnvironment, getPath } from './logger.node';

/**
 * Detecta el entorno de ejecución (backend o client)
 * Basado en LOG_ENVIRONMENT o detección automática
 */
const detectRuntimeEnvironment = (): 'backend' | 'client' => {
  let envValue: string | undefined;

  try {
    if (typeof process !== 'undefined' && process.env) {
      envValue = process.env.LOG_ENVIRONMENT || process.env.VITE_LOG_ENVIRONMENT;
    }
  } catch {
    // process no disponible
  }

  if (!envValue && !isNodeEnvironment()) {
    envValue = getViteEnv('LOG_ENVIRONMENT');
  }

  if (envValue) {
    const upperValue = envValue.trim().toUpperCase();
    if (upperValue === 'B' || upperValue === 'BACKEND') {
      return 'backend';
    }
    if (upperValue === 'C' || upperValue === 'CLIENT' || upperValue === 'CLIENTE') {
      return 'client';
    }
  }

  return isNodeEnvironment() ? 'backend' : 'client';
};

const getViteEnv = (key: string): string | undefined => {
  try {
    const meta = (globalThis as any).__VITE_IMPORT_META__ ||
                 (typeof (globalThis as any).import !== 'undefined' ?
                  (globalThis as any).import.meta : null);

    if (meta && meta.env && meta.env[key] !== undefined) {
      return String(meta.env[key]);
    }
  } catch {
    // No estamos en Vite
  }
  return undefined;
};

/**
 * Lee una variable de entorno y la convierte a boolean
 * Soporta tanto LOGNERD_* como VITE_LOGNERD_*
 */
const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = getEnvValue(key);
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

/**
 * Lee una variable de entorno y la convierte a number
 * Soporta tanto LOGNERD_* como VITE_LOGNERD_*
 */
const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = getEnvValue(key);
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Lee una variable de entorno y valida que sea un LogLevel válido
 * Soporta tanto LOGNERD_* como VITE_LOGNERD_*
 */
const getEnvLogLevel = (key: string, defaultValue: LogLevel): LogLevel => {
  const value = getEnvValue(key);
  if (value === undefined) return defaultValue;
  const upperValue = value.toUpperCase();
  if (['DEBUG', 'INFO', 'WARN', 'ERROR'].includes(upperValue)) {
    return upperValue as LogLevel;
  }
  return defaultValue;
};

/**
 * Lee una variable de entorno con soporte para prefijo VITE_
 * Vite solo expone variables que comienzan con VITE_ al código del cliente
 */
const getEnvValue = (key: string): string | undefined => {
  let processEnv: NodeJS.ProcessEnv | undefined;
  try {
    if (typeof process !== 'undefined' && process.env) {
      processEnv = process.env;
    }
  } catch {
    processEnv = undefined;
  }

  if (isNodeEnvironment() && processEnv) {
    const viteKey = `VITE_${key}`;
    if (processEnv[viteKey] !== undefined) {
      return processEnv[viteKey];
    }
    if (processEnv[key] !== undefined) {
      return processEnv[key];
    }
  }

  if (!isNodeEnvironment()) {
    const viteKey = `VITE_${key}`;
    const viteValue = getViteEnv(viteKey);
    if (viteValue !== undefined) {
      return String(viteValue);
    }
    const directValue = getViteEnv(key);
    if (directValue !== undefined) {
      return String(directValue);
    }
  }

  return undefined;
};

/**
 * Lee la configuración desde variables de entorno
 * Soporta tanto LOGNERD_* (Node.js) como VITE_LOGNERD_* (Vite)
 */
const getConfigFromEnv = (): Partial<LoggerConfig> => {
  const config: Partial<LoggerConfig> = {};

  const levelValue = getEnvValue('LOGNERD_LEVEL');
  if (levelValue) {
    config.level = getEnvLogLevel('LOGNERD_LEVEL', 'INFO');
  }

  let nodeEnv: string | undefined;
  try {
    if (!isNodeEnvironment()) {
      nodeEnv = getViteEnv('MODE') || getViteEnv('NODE_ENV');
    } else if (typeof process !== 'undefined' && process.env) {
      nodeEnv = process.env.NODE_ENV;
    }
  } catch {
    nodeEnv = undefined;
  }

  const environment = (
    getEnvValue('LOGNERD_ENVIRONMENT') ||
    nodeEnv ||
    'development'
  ) as 'development' | 'production';
  if (environment === 'development' || environment === 'production') {
    config.environment = environment;
  }

  const enableConsoleValue = getEnvValue('LOGNERD_ENABLE_CONSOLE');
  if (enableConsoleValue !== undefined) {
    config.enableConsole = getEnvBoolean('LOGNERD_ENABLE_CONSOLE', true);
  }

  const enableFileValue = getEnvValue('LOGNERD_ENABLE_FILE');
  if (enableFileValue !== undefined) {
    config.enableFile = getEnvBoolean('LOGNERD_ENABLE_FILE', true);
  }

  const filePathValue = getEnvValue('LOGNERD_FILE_PATH');
  if (filePathValue) {
    config.filePath = filePathValue;
  }

  const maxFileSizeValue = getEnvValue('LOGNERD_MAX_FILE_SIZE');
  if (maxFileSizeValue !== undefined) {
    config.maxFileSize = getEnvNumber('LOGNERD_MAX_FILE_SIZE', 10);
  }

  const maxFilesValue = getEnvValue('LOGNERD_MAX_FILES');
  if (maxFilesValue !== undefined) {
    config.maxFiles = getEnvNumber('LOGNERD_MAX_FILES', 5);
  }

  return config;
};

const getDefaultFilePath = (): string => {
  if (isNodeEnvironment()) {
    try {
      const p = getPath();
      if (p) return p.join(process.cwd(), 'logs', 'app.log');
      return `${process.cwd()}/logs/app.log`;
    } catch {
      // Fallback
    }
  }
  return './logs/app.log';
};

const defaultConfig: LoggerConfig = {
  level: 'INFO',
  enableConsole: true,
  enableFile: true,
  filePath: getDefaultFilePath(),
  environment: 'development',
  runtimeEnvironment: 'backend',
  maxFileSize: 10,
  maxFiles: 5,
};

export const createLoggerConfig = (
  customConfig?: Partial<LoggerConfig>
): LoggerConfig => {
  const runtimeEnv = detectRuntimeEnvironment();
  const envConfig = getConfigFromEnv();

  const config: LoggerConfig = {
    ...defaultConfig,
    runtimeEnvironment: runtimeEnv,
    ...envConfig,
    ...customConfig,
  };

  if (config.runtimeEnvironment === 'client') {
    if (config.enableFile) {
      console.warn(
        '[lognerd] ⚠️ LOG_ENVIRONMENT está configurado para CLIENT (C). ' +
        'La escritura de archivos está deshabilitada en el navegador. ' +
        'Configure LOG_ENVIRONMENT=B para backend si necesita escribir archivos.'
      );
      config.enableFile = false;
    }
  } else if (config.runtimeEnvironment === 'backend') {
    if (config.enableFile && !isNodeEnvironment()) {
      console.error(
        '[lognerd] ❌ ERROR: LOG_ENVIRONMENT está configurado para BACKEND (B) ' +
        'pero el código se está ejecutando en el navegador. ' +
        'Configure LOG_ENVIRONMENT=C para cliente o corrija su configuración.'
      );
      config.enableFile = false;
    }
  }

  if (config.environment === 'production' && customConfig?.enableConsole === undefined && envConfig.enableConsole === undefined) {
    config.enableConsole = false;
    config.enableFile = true;
  }

  if (!isNodeEnvironment() && config.enableFile) {
    config.enableFile = false;
  }

  return config;
};
