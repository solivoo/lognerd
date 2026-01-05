import { LoggerService } from './logger/logger.service';
import { createLoggerConfig } from './logger/logger.config';
import { LoggerConfig, LogLevel, RuntimeEnvironment } from './logger/logger.types';

// Instancia singleton del logger
let loggerInstance: LoggerService | null = null;

/**
 * Crea o retorna la instancia singleton del logger
 */
const getLogger = (): LoggerService => {
  if (!loggerInstance) {
    const config = createLoggerConfig();
    loggerInstance = new LoggerService(config);
  }
  return loggerInstance;
};

/**
 * Crea una nueva instancia del logger con configuración personalizada
 */
export const createLogger = (config?: Partial<LoggerConfig>) => {
  const loggerConfig = createLoggerConfig(config);
  return new LoggerService(loggerConfig);
};

/**
 * Actualiza la configuración del logger singleton
 */
export const configureLogger = (config: Partial<LoggerConfig>): void => {
  if (!loggerInstance) {
    getLogger();
  }
  loggerInstance!.updateConfig(config);
};

// Exportar métodos directos del logger singleton
export const info = (message: string, data?: unknown): void => {
  getLogger().info(message, data);
};

export const warn = (message: string, data?: unknown): void => {
  getLogger().warn(message, data);
};

export const error = (message: string, data?: unknown): void => {
  getLogger().error(message, data);
};

export const debug = (message: string, data?: unknown): void => {
  getLogger().debug(message, data);
};

// Exportar también el logger singleton completo
export const logger = {
  info,
  warn,
  error,
  debug,
  updateConfig: (config: Partial<LoggerConfig>) => configureLogger(config),
};

// Exportar tipos y clases
export { LoggerService };
export type { LoggerConfig, LogLevel, RuntimeEnvironment };
export { createLoggerConfig };
