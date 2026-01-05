import { LoggerConfig, LogLevel } from './logger.types';

// Detectar si estamos en Node.js o en el navegador
const isNode = typeof process !== 'undefined' && process.versions?.node !== undefined;

/**
 * Detecta el entorno de ejecución (backend o client)
 * Basado en LOG_ENVIRONMENT o detección automática
 */
const detectRuntimeEnvironment = (): 'backend' | 'client' => {
  // Intentar leer LOG_ENVIRONMENT desde variables de entorno
  let envValue: string | undefined;
  
  try {
    if (typeof process !== 'undefined' && process.env) {
      envValue = process.env.LOG_ENVIRONMENT || process.env.VITE_LOG_ENVIRONMENT;
    }
  } catch {
    // process no disponible
  }
  
  // Si no está en process.env, intentar desde Vite
  if (!envValue && !isNode) {
    envValue = getViteEnv('LOG_ENVIRONMENT');
  }
  
  // Procesar el valor
  if (envValue) {
    const upperValue = envValue.trim().toUpperCase();
    if (upperValue === 'B' || upperValue === 'BACKEND') {
      return 'backend';
    }
    if (upperValue === 'C' || upperValue === 'CLIENT' || upperValue === 'CLIENTE') {
      return 'client';
    }
  }
  
  // Detección automática: si estamos en Node.js, asumimos backend
  // Si no, asumimos client (navegador)
  return isNode ? 'backend' : 'client';
};

// Función para obtener variables de entorno de Vite en tiempo de ejecución
// Vite inyecta import.meta.env en tiempo de compilación
const getViteEnv = (key: string): string | undefined => {
  try {
    // Acceder a import.meta.env de forma segura
    // En Vite, esto se reemplaza en tiempo de compilación
    const meta = (globalThis as any).__VITE_IMPORT_META__ || 
                 (typeof (globalThis as any).import !== 'undefined' ? 
                  (globalThis as any).import.meta : null);
    
    if (meta && meta.env && meta.env[key] !== undefined) {
      return String(meta.env[key]);
    }
  } catch {
    // Ignorar errores - no estamos en Vite o no está disponible
  }
  return undefined;
};

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
  // Verificar si process existe antes de usarlo (evita errores en navegador)
  let processEnv: NodeJS.ProcessEnv | undefined;
  try {
    if (typeof process !== 'undefined' && process.env) {
      processEnv = process.env;
    }
  } catch {
    // process no está disponible (estamos en navegador)
    processEnv = undefined;
  }
  
  // Para Node.js
  if (isNode && processEnv) {
    // Primero intentar con prefijo VITE_ (por si acaso)
    const viteKey = `VITE_${key}`;
    if (processEnv[viteKey] !== undefined) {
      return processEnv[viteKey];
    }
    // Luego intentar sin prefijo
    if (processEnv[key] !== undefined) {
      return processEnv[key];
    }
  }
  
  // Para Vite (navegador) - intentar obtener variables de Vite
  // Solo si no estamos en Node.js
  if (!isNode) {
    const viteKey = `VITE_${key}`;
    const viteValue = getViteEnv(viteKey);
    if (viteValue !== undefined) {
      return String(viteValue);
    }
    // También intentar sin prefijo
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

  // Nivel de log
  const levelValue = getEnvValue('LOGNERD_LEVEL');
  if (levelValue) {
    config.level = getEnvLogLevel('LOGNERD_LEVEL', 'INFO');
  }

  // Entorno (compatible con NODE_ENV, LOGNERD_ENVIRONMENT y VITE_LOGNERD_ENVIRONMENT)
  let nodeEnv: string | undefined;
  try {
    if (!isNode) {
      // En el navegador, intentar obtener de Vite
      nodeEnv = getViteEnv('MODE') || getViteEnv('NODE_ENV');
    } else if (typeof process !== 'undefined' && process.env) {
      nodeEnv = process.env.NODE_ENV;
    }
  } catch {
    // Ignorar errores si process no está disponible
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

// Obtener el directorio de trabajo (solo en Node.js)
const getDefaultFilePath = (): string => {
  if (isNode && path) {
    try {
      if (typeof process !== 'undefined' && process.cwd) {
        return path.join(process.cwd(), 'logs', 'app.log');
      }
    } catch {
      // Fallback si process.cwd() no está disponible
    }
  }
  // En el navegador, no podemos escribir archivos, así que retornamos una ruta relativa
  return './logs/app.log';
};

const defaultConfig: LoggerConfig = {
  level: 'INFO',
  enableConsole: true,
  enableFile: true,
  filePath: getDefaultFilePath(),
  environment: 'development',
  runtimeEnvironment: 'backend', // Se sobrescribirá con detectRuntimeEnvironment()
  maxFileSize: 10, // 10MB
  maxFiles: 5,
};

export const createLoggerConfig = (
  customConfig?: Partial<LoggerConfig>
): LoggerConfig => {
  // Detectar el entorno de ejecución primero
  const runtimeEnv = detectRuntimeEnvironment();
  
  // Primero leer desde variables de entorno
  const envConfig = getConfigFromEnv();
  
  // Combinar: defaults -> env -> customConfig (customConfig tiene prioridad)
  const config: LoggerConfig = {
    ...defaultConfig,
    runtimeEnvironment: runtimeEnv,
    ...envConfig,
    ...customConfig,
  };
  
  // Validar y ajustar según el entorno de ejecución
  if (config.runtimeEnvironment === 'client') {
    // En cliente (navegador), deshabilitar escritura de archivos
    if (config.enableFile) {
      console.warn(
        '[lognerd] ⚠️ LOG_ENVIRONMENT está configurado para CLIENT (C). ' +
        'La escritura de archivos está deshabilitada en el navegador. ' +
        'Configure LOG_ENVIRONMENT=B para backend si necesita escribir archivos.'
      );
      config.enableFile = false;
    }
  } else if (config.runtimeEnvironment === 'backend') {
    // En backend, asegurar que tenemos acceso a fs
    if (config.enableFile && !isNode) {
      console.error(
        '[lognerd] ❌ ERROR: LOG_ENVIRONMENT está configurado para BACKEND (B) ' +
        'pero el código se está ejecutando en el navegador. ' +
        'Configure LOG_ENVIRONMENT=C para cliente o corrija su configuración.'
      );
      config.enableFile = false;
    }
  }

  // En producción, deshabilitar consola pero mantener archivo
  // (solo si no se especificó explícitamente enableConsole)
  if (config.environment === 'production' && customConfig?.enableConsole === undefined && envConfig.enableConsole === undefined) {
    config.enableConsole = false;
    config.enableFile = true;
  }
  
  // Asegurar que el directorio de logs existe (solo en Node.js)
  if (config.enableFile && config.filePath && isNode && fs && path) {
    try {
      const logDir = path.dirname(config.filePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    } catch (error) {
      // En el navegador, no podemos crear directorios, así que deshabilitamos el archivo
      if (!isNode) {
        config.enableFile = false;
      }
    }
  } else if (!isNode && config.enableFile) {
    // En el navegador, deshabilitar escritura en archivo por defecto
    config.enableFile = false;
  }
  
  return config;
};
