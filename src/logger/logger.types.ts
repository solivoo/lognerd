export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
  environment: 'development' | 'production';
  maxFileSize?: number; // en MB
  maxFiles?: number;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}
