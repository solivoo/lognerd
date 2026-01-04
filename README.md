# lognerd

Sistema de logging con colores y escritura a archivo para Node.js. Desarrollado con TypeScript y diseñado para ser fácil de usar y configurar.

## 🚀 Instalación

```bash
pnpm add lognerd
```

o con npm:

```bash
npm install lognerd
```

## 📖 Uso Básico

### Uso Directo (Recomendado - Patrón Singleton)

Puedes usar el logger directamente sin necesidad de crear una instancia:

```typescript
import { info, warn, error, debug } from 'lognerd';

// Uso directo - el logger se configura automáticamente desde variables de entorno
info('Aplicación iniciada');
error('Error crítico', { code: 500, message: 'Error de servidor' });
warn('Advertencia: conexión lenta');
debug('Información de debug', { userId: 123 });
```

O usando el objeto logger:

```typescript
import { logger } from 'lognerd';

logger.info('Aplicación iniciada');
logger.error('Error crítico', { code: 500 });
logger.warn('Advertencia');
logger.debug('Debug info');
```

### Uso con Instancia Personalizada

Si necesitas múltiples instancias con configuraciones diferentes:

```typescript
import { createLogger } from 'lognerd';

const customLogger = createLogger({
  level: 'DEBUG',
  filePath: './logs/custom.log',
});

customLogger.info('Mensaje con logger personalizado');
```

## ⚙️ Configuración

### Configuración mediante Variables de Entorno (Recomendado)

Puedes configurar lognerd completamente mediante variables de entorno. Esto es ideal para Vite, Next.js, y otros entornos.

**⚠️ Importante para Vite:** Vite solo expone variables que comienzan con `VITE_` al código del cliente. Para Vite, usa el prefijo `VITE_LOGNERD_*`.

**Variables de entorno disponibles:**

| Variable (Node.js/Next.js) | Variable (Vite) | Descripción | Valores | Por defecto |
|----------------------------|-----------------|-------------|---------|-------------|
| `LOGNERD_LEVEL` | `VITE_LOGNERD_LEVEL` | Nivel mínimo de log | `DEBUG`, `INFO`, `WARN`, `ERROR` | `INFO` |
| `LOGNERD_ENVIRONMENT` | `VITE_LOGNERD_ENVIRONMENT` | Entorno de ejecución | `development`, `production` | `development` |
| `NODE_ENV` | `NODE_ENV` | También se puede usar (compatible) | `development`, `production` | - |
| `LOGNERD_ENABLE_CONSOLE` | `VITE_LOGNERD_ENABLE_CONSOLE` | Habilitar salida en consola | `true`, `false`, `1`, `0` | `true` |
| `LOGNERD_ENABLE_FILE` | `VITE_LOGNERD_ENABLE_FILE` | Habilitar escritura en archivo | `true`, `false`, `1`, `0` | `true` |
| `LOGNERD_FILE_PATH` | `VITE_LOGNERD_FILE_PATH` | Ruta del archivo de log | Ruta relativa o absoluta | `./logs/app.log` |
| `LOGNERD_MAX_FILE_SIZE` | `VITE_LOGNERD_MAX_FILE_SIZE` | Tamaño máximo del archivo en MB | Número entero | `10` |
| `LOGNERD_MAX_FILES` | `VITE_LOGNERD_MAX_FILES` | Número máximo de archivos rotados | Número entero | `5` |

**Ejemplo para Node.js/Next.js:**
```bash
# .env
LOGNERD_LEVEL=INFO
LOGNERD_ENVIRONMENT=development
LOGNERD_ENABLE_CONSOLE=true
LOGNERD_ENABLE_FILE=true
LOGNERD_FILE_PATH=./logs/app.log
LOGNERD_MAX_FILE_SIZE=10
LOGNERD_MAX_FILES=5
```

**Ejemplo para Vite:**
```bash
# .env
VITE_LOGNERD_LEVEL=INFO
VITE_LOGNERD_ENVIRONMENT=development
VITE_LOGNERD_ENABLE_CONSOLE=true
VITE_LOGNERD_ENABLE_FILE=true
VITE_LOGNERD_FILE_PATH=./logs/app.log
VITE_LOGNERD_MAX_FILE_SIZE=10
VITE_LOGNERD_MAX_FILES=5
```

**Ejemplo para producción (Vite):**
```bash
# .env.production
VITE_LOGNERD_LEVEL=WARN
VITE_LOGNERD_ENVIRONMENT=production
VITE_LOGNERD_FILE_PATH=./logs/production.log
VITE_LOGNERD_MAX_FILE_SIZE=50
VITE_LOGNERD_MAX_FILES=10
```

### Configuración mediante Código

También puedes configurar el logger mediante código TypeScript:

```typescript
import { createLogger } from 'lognerd';

const logger = createLogger({
  level: 'DEBUG', // Nivel mínimo de log: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  environment: 'development', // 'development' | 'production'
  enableConsole: true, // Habilitar salida en consola
  enableFile: true, // Habilitar escritura en archivo
  filePath: './logs/app.log', // Ruta del archivo de log
  maxFileSize: 10, // Tamaño máximo del archivo en MB (default: 10)
  maxFiles: 5, // Número máximo de archivos de log rotados (default: 5)
});
```

**Nota:** La configuración mediante código tiene prioridad sobre las variables de entorno. El orden de prioridad es: `código > variables de entorno > valores por defecto`.

### Configuración para Producción

En producción, la consola se deshabilita automáticamente pero los logs se siguen escribiendo en archivo:

```typescript
const logger = createLogger({
  environment: 'production', // Automáticamente deshabilita consola
  level: 'WARN', // Solo logs de WARN y ERROR en producción
  filePath: './logs/production.log',
});
```

O simplemente usando variables de entorno:
```bash
NODE_ENV=production LOGNERD_LEVEL=WARN
```

## 🎨 Características

- ✅ **Niveles de log**: ERROR, WARN, INFO, DEBUG
- ✅ **Colores en consola** para desarrollo (rojo para ERROR, amarillo para WARN, cyan para INFO, magenta para DEBUG)
- ✅ **Escritura automática a archivo** (siempre activa, incluso en producción)
- ✅ **Deshabilitación automática de consola en producción**
- ✅ **Rotación automática de archivos** cuando alcanzan el tamaño máximo
- ✅ **Limpieza automática** de archivos antiguos
- ✅ **TypeScript** con tipos completos
- ✅ **Sin dependencias externas** (solo usa módulos nativos de Node.js)

## 📝 Ejemplos

### Ejemplo Completo

```typescript
import { info, warn, error, debug, configureLogger } from 'lognerd';

// Configurar el logger (opcional, se configura automáticamente desde variables de entorno)
configureLogger({
  level: process.env.NODE_ENV === 'production' ? 'WARN' : 'DEBUG',
  environment: process.env.NODE_ENV || 'development',
  filePath: './logs/app.log',
});

// En desarrollo: se muestra en consola con colores y se guarda en archivo
// En producción: solo se guarda en archivo

info('Servidor iniciado en puerto 3000');
debug('Variables de entorno cargadas', { env: process.env.NODE_ENV });

try {
  // Tu código aquí
  info('Operación exitosa');
} catch (err) {
  error('Error en operación', { error: err.message, stack: err.stack });
}
```

### Actualizar Configuración en Tiempo de Ejecución

```typescript
import { configureLogger } from 'lognerd';

// Cambiar el nivel de log dinámicamente del singleton
configureLogger({ level: 'ERROR' });
```

## 🔧 API

### Funciones Directas (Singleton)

El paquete exporta funciones directas que usan una instancia singleton del logger:

```typescript
import { info, warn, error, debug, logger, configureLogger } from 'lognerd';

// Funciones directas
info('Mensaje informativo');
warn('Advertencia');
error('Error', { code: 500 });
debug('Debug', { data: 'test' });

// Objeto logger (mismo singleton)
logger.info('Mensaje');
logger.warn('Advertencia');

// Configurar el singleton
configureLogger({ level: 'WARN', filePath: './logs/custom.log' });
```

### `createLogger(config?: Partial<LoggerConfig>): LoggerService`

Crea una nueva instancia del logger con configuración personalizada (útil para múltiples loggers).

### Métodos Disponibles

**Funciones directas (singleton):**
- `info(message: string, data?: unknown): void` - Log informativo
- `warn(message: string, data?: unknown): void` - Log de advertencia
- `error(message: string, data?: unknown): void` - Log de error
- `debug(message: string, data?: unknown): void` - Log de debug
- `configureLogger(config: Partial<LoggerConfig>): void` - Actualizar configuración del singleton

**Objeto logger (singleton):**
- `logger.info(message: string, data?: unknown): void` - Log informativo
- `logger.warn(message: string, data?: unknown): void` - Log de advertencia
- `logger.error(message: string, data?: unknown): void` - Log de error
- `logger.debug(message: string, data?: unknown): void` - Log de debug
- `logger.updateConfig(config: Partial<LoggerConfig>): void` - Actualizar configuración

**Instancias personalizadas:**
- `logger.updateConfig(newConfig: Partial<LoggerConfig>): void` - Actualizar configuración (en instancias creadas con `createLogger`)

## 📦 Estructura de Archivos de Log

Los logs se guardan en el formato:

```
2024-01-15T10:30:45.123Z [ERROR] Error crítico | Data: {"code":500}
2024-01-15T10:30:46.456Z [WARN] Advertencia | Data: {"timeout":5000}
2024-01-15T10:30:47.789Z [INFO] Operación completada
```

## 🔄 Rotación de Archivos

Cuando un archivo de log alcanza el tamaño máximo configurado (`maxFileSize`), se renombra automáticamente con un timestamp y se crea un nuevo archivo. Los archivos antiguos se eliminan automáticamente cuando exceden el número máximo configurado (`maxFiles`).

## 📄 Licencia

MIT

## 👤 Autor

Sergio Olivo O

