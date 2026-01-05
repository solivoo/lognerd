import { LoggerConfig, LogLevel, LogEntry } from './logger.types';
import { formatConsoleMessage, formatFileMessage } from './logger.utils';

// Detectar si estamos en Node.js
const isNode = typeof process !== 'undefined' && process.versions?.node !== undefined;

// Importaciones condicionales solo para Node.js
let fs: typeof import('fs') | null = null;
let path: typeof import('path') | null = null;

if (isNode) {
  try {
    fs = require('fs');
    path = require('path');
  } catch {
    // Ignorar si no están disponibles
  }
}

class LoggerService {
  private config: LoggerConfig;
  private logLevels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
  
  constructor(config: LoggerConfig) {
    this.config = config;
  }
  
  private shouldLog(level: LogLevel): boolean {
    const currentLevelIndex = this.logLevels.indexOf(this.config.level);
    const messageLevelIndex = this.logLevels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }
  
  private writeToFile(entry: LogEntry): void {
    if (!this.config.enableFile || !this.config.filePath) {
      return;
    }
    
    // Validar que estamos en backend antes de escribir
    if (this.config.runtimeEnvironment === 'client') {
      // No intentar escribir en cliente
      return;
    }
    
    // En el navegador, no podemos escribir archivos
    if (!isNode || !fs) {
      if (this.config.runtimeEnvironment === 'backend') {
        console.error(
          '[lognerd] ❌ ERROR: Intento de escribir archivo en backend pero fs no está disponible. ' +
          'Verifique que LOG_ENVIRONMENT=B esté configurado correctamente.'
        );
      }
      return;
    }
    
    try {
      const message = formatFileMessage(entry) + '\n';
      fs.appendFileSync(this.config.filePath, message, 'utf8');
      
      // Rotación de archivos si es necesario
      this.rotateLogFileIfNeeded();
    } catch (error) {
      // Fallback: escribir en consola si falla el archivo
      console.error('Error escribiendo en archivo de log:', error);
    }
  }
  
  private rotateLogFileIfNeeded(): void {
    if (!this.config.filePath || !this.config.maxFileSize || !isNode || !fs || !path) {
      return;
    }
    
    try {
      const stats = fs.statSync(this.config.filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      if (fileSizeInMB >= this.config.maxFileSize && path && fs) {
        const logDir = path.dirname(this.config.filePath);
        const logFileName = path.basename(this.config.filePath, '.log');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFileName = `${logFileName}-${timestamp}.log`;
        const rotatedFilePath = path.join(logDir, rotatedFileName);
        
        // Mover archivo actual
        fs.renameSync(this.config.filePath, rotatedFilePath);
        
        // Limpiar archivos antiguos
        this.cleanOldLogFiles(logDir, logFileName);
      }
    } catch (error) {
      // Ignorar errores de rotación
    }
  }
  
  private cleanOldLogFiles(logDir: string, logFileName: string): void {
    if (!this.config.maxFiles || !isNode || !fs || !path) {
      return;
    }
    
    try {
      const files = fs.readdirSync(logDir)
        .filter(file => file.startsWith(logFileName) && file.endsWith('.log'))
        .map(file => {
          const filePath = path.join(logDir, file);
          return {
            name: file,
            path: filePath,
            time: fs.statSync(filePath).mtime.getTime(),
          };
        })
        .sort((a, b) => b.time - a.time);
      
      // Eliminar archivos que excedan el máximo
      if (files.length > this.config.maxFiles) {
        files.slice(this.config.maxFiles).forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
    } catch (error) {
      // Ignorar errores de limpieza
    }
  }
  
  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };
    
    // Escribir en consola (si está habilitado)
    if (this.config.enableConsole) {
      console.log(formatConsoleMessage(level, message, data));
    }
    
    // Escribir en archivo (siempre, incluso en producción)
    this.writeToFile(entry);
  }
  
  error(message: string, data?: unknown): void {
    this.log('ERROR', message, data);
  }
  
  warn(message: string, data?: unknown): void {
    this.log('WARN', message, data);
  }
  
  info(message: string, data?: unknown): void {
    this.log('INFO', message, data);
  }
  
  debug(message: string, data?: unknown): void {
    this.log('DEBUG', message, data);
  }
  
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export { LoggerService };
