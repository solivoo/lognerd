import { LoggerConfig, LogLevel } from './logger.types';
import * as fs from 'fs';
import * as path from 'path';

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
  // Primero intentar con prefijo VITE_ (para Vite)
  const viteKey = `VITE_${key}`;
  if (process.env[viteKey] !== undefined) {
    return process.env[viteKey];
  }
  // Luego intentar sin prefijo (para Node.js y otros entornos)
  return process.env[key];
};

/**
 * Lee la configuración desde variables de entorno
 * Soporta tanto LOGNERD_* (Node.js) como VITE_LOGNERD_* (Vite)
 */
const getConfigFromEnv = (): Partial<LoggerConfig> => {
  const config: Partial<LoggerConfig> = {};

  // Nivel de log
  const levelValue = getEnvValue('LOGNERD_LEVEL');
  if (levelValue) {
    config.level = getEnvLogLevel('LOGNERD_LEVEL', 'INFO');
  }

  // Entorno (compatible con NODE_ENV, LOGNERD_ENVIRONMENT y VITE_LOGNERD_ENVIRONMENT)
  const environment = (
    getEnvValue('LOGNERD_ENVIRONMENT') || 
    process.env.NODE_ENV || 
    'development'
  ) as 'development' | 'production';
  if (environment === 'development' || environment === 'production') {
    config.environment = environment;
  }

  // Habilitar consola
  const enableConsoleValue = getEnvValue('LOGNERD_ENABLE_CONSOLE');
  if (enableConsoleValue !== undefined) {
    config.enableConsole = getEnvBoolean('LOGNERD_ENABLE_CONSOLE', true);
  }

  // Habilitar archivo
  const enableFileValue = getEnvValue('LOGNERD_ENABLE_FILE');
  if (enableFileValue !== undefined) {
    config.enableFile = getEnvBoolean('LOGNERD_ENABLE_FILE', true);
  }

  // Ruta del archivo
  const filePathValue = getEnvValue('LOGNERD_FILE_PATH');
  if (filePathValue) {
    config.filePath = filePathValue;
  }

  // Tamaño máximo del archivo en MB
  const maxFileSizeValue = getEnvValue('LOGNERD_MAX_FILE_SIZE');
  if (maxFileSizeValue !== undefined) {
    config.maxFileSize = getEnvNumber('LOGNERD_MAX_FILE_SIZE', 10);
  }

  // Número máximo de archivos
  const maxFilesValue = getEnvValue('LOGNERD_MAX_FILES');
  if (maxFilesValue !== undefined) {
    config.maxFiles = getEnvNumber('LOGNERD_MAX_FILES', 5);
  }

  return config;
};

const defaultConfig: LoggerConfig = {
  level: 'INFO',
  enableConsole: true,
  enableFile: true,
  filePath: path.join(process.cwd(), 'logs', 'app.log'),
  environment: 'development',
  maxFileSize: 10, // 10MB
  maxFiles: 5,
};

export const createLoggerConfig = (
  customConfig?: Partial<LoggerConfig>
): LoggerConfig => {
  // Primero leer desde variables de entorno
  const envConfig = getConfigFromEnv();
  
  // Combinar: defaults -> env -> customConfig (customConfig tiene prioridad)
  const config: LoggerConfig = {
    ...defaultConfig,
    ...envConfig,
    ...customConfig,
  };

  // En producción, deshabilitar consola pero mantener archivo
  // (solo si no se especificó explícitamente enableConsole)
  if (config.environment === 'production' && customConfig?.enableConsole === undefined && envConfig.enableConsole === undefined) {
    config.enableConsole = false;
    config.enableFile = true;
  }
  
  // Asegurar que el directorio de logs existe
  if (config.enableFile && config.filePath) {
    const logDir = path.dirname(config.filePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }
  
  return config;
};
