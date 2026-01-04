import { LogLevel, LogEntry } from './logger.types';

const colors = {
  ERROR: '\x1b[31m', // Rojo
  WARN: '\x1b[33m',  // Amarillo
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[35m', // Magenta
  RESET: '\x1b[0m',
};

export const formatConsoleMessage = (
  level: LogLevel,
  message: string,
  data?: unknown
): string => {
  const color = colors[level];
  const reset = colors.RESET;
  const timestamp = new Date().toISOString();
  const levelTag = `[${level}]`;
  
  let output = `${color}${levelTag}${reset} ${timestamp} - ${message}`;
  
  if (data !== undefined) {
    output += `\n${JSON.stringify(data, null, 2)}`;
  }
  
  return output;
};

export const formatFileMessage = (entry: LogEntry): string => {
  const { timestamp, level, message, data } = entry;
  let output = `${timestamp} [${level}] ${message}`;
  
  if (data !== undefined) {
    output += ` | Data: ${JSON.stringify(data)}`;
  }
  
  return output;
};

export const getColorForLevel = (level: LogLevel): string => {
  return colors[level];
};
