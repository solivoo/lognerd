import { LoggerService } from './logger/logger.service';
import { createLoggerConfig } from './logger/logger.config';
import { LoggerConfig, LogLevel } from './logger/logger.types';

export const createLogger = (config?: Partial<LoggerConfig>) => {
  const loggerConfig = createLoggerConfig(config);
  return new LoggerService(loggerConfig);
};

export { LoggerService };
export type { LoggerConfig, LogLevel };
export { createLoggerConfig };
