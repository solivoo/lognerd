# lognerd

Sistema de logging universal con colores y escritura a archivo para **Node.js (Backend)** y **Navegador (Frontend)**. Desarrollado con TypeScript y diseñado para ser fácil de usar y configurar. Compatible con Vite, Webpack, Next.js y otros entornos.

> **Isomórfico por diseño:** los módulos de Node.js (`fs`, `path`) se cargan mediante `await import()` solo en entorno servidor. En el navegador, el logger usa exclusivamente `console.log`, `console.warn` y `console.error` — sin importar módulos de Node.js.

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
| **`LOG_ENVIRONMENT`** | **`VITE_LOG_ENVIRONMENT`** | **Entorno de ejecución (OBLIGATORIO)** | **`B`, `BACKEND`, `C`, `CLIENT`** | **Auto-detecta** |
| `LOGNERD_LEVEL` | `VITE_LOGNERD_LEVEL` | Nivel mínimo de log | `DEBUG`, `INFO`, `WARN`, `ERROR` | `INFO` |
| `LOGNERD_ENVIRONMENT` | `VITE_LOGNERD_ENVIRONMENT` | Entorno de ejecución | `development`, `production` | `development` |
| `NODE_ENV` | `NODE_ENV` | También se puede usar (compatible) | `development`, `production` | - |
| `LOGNERD_ENABLE_CONSOLE` | `VITE_LOGNERD_ENABLE_CONSOLE` | Habilitar salida en consola | `true`, `false`, `1`, `0` | `true` |
| `LOGNERD_ENABLE_FILE` | `VITE_LOGNERD_ENABLE_FILE` | Habilitar escritura en archivo | `true`, `false`, `1`, `0` | `true` (solo backend) |
| `LOGNERD_FILE_PATH` | `VITE_LOGNERD_FILE_PATH` | Ruta del archivo de log | Ruta relativa o absoluta | `./logs/app.log` |
| `LOGNERD_MAX_FILE_SIZE` | `VITE_LOGNERD_MAX_FILE_SIZE` | Tamaño máximo del archivo en MB | Número entero | `10` |
| `LOGNERD_MAX_FILES` | `VITE_LOGNERD_MAX_FILES` | Número máximo de archivos rotados | Número entero | `5` |

### ⚠️ LOG_ENVIRONMENT (Importante)

Esta variable determina si el código se ejecuta en **backend** (Node.js) o **client** (navegador):

- **`LOG_ENVIRONMENT=B`** o **`LOG_ENVIRONMENT=BACKEND`**: Para backend (Node.js)
  - ✅ Permite escritura de archivos
  - ✅ Carga `fs` y `path` dinámicamente con `await import()`
  - ✅ Escritura de logs en archivos locales

- **`LOG_ENVIRONMENT=C`** o **`LOG_ENVIRONMENT=CLIENT`**: Para cliente (navegador)
  - ✅ Deshabilita escritura de archivos automáticamente
  - ✅ Solo usa `console.log`, `console.warn`, `console.error` del navegador
  - ✅ Nunca importa módulos de Node.js (`fs`, `path`)
  - ✅ Compatible con Vite, Webpack y otros bundlers

**Detección automática:**
Si no se configura `LOG_ENVIRONMENT`, se detecta automáticamente:
- Si está en Node.js → `backend`
- Si está en navegador → `client`

**Mensajes de error claros:**
- Si `LOG_ENVIRONMENT=B` pero se ejecuta en navegador → Error descriptivo
- Si `LOG_ENVIRONMENT=C` pero se intenta escribir archivos → Advertencia automática

**Ejemplo para Node.js/Next.js (Backend):**
```bash
# .env
LOG_ENVIRONMENT=B
LOGNERD_LEVEL=INFO
LOGNERD_ENVIRONMENT=development
LOGNERD_ENABLE_CONSOLE=true
LOGNERD_ENABLE_FILE=true
LOGNERD_FILE_PATH=./logs/app.log
LOGNERD_MAX_FILE_SIZE=10
LOGNERD_MAX_FILES=5
```

**Ejemplo para Vite (Cliente/Navegador):**
```bash
# .env
VITE_LOG_ENVIRONMENT=C
VITE_LOGNERD_LEVEL=INFO
VITE_LOGNERD_ENVIRONMENT=development
VITE_LOGNERD_ENABLE_CONSOLE=true
# VITE_LOGNERD_ENABLE_FILE se ignora en cliente (siempre false)
```

**Ejemplo para producción (Vite - Cliente):**
```bash
# .env.production
VITE_LOG_ENVIRONMENT=C
VITE_LOGNERD_LEVEL=WARN
VITE_LOGNERD_ENVIRONMENT=production
# La escritura de archivos está deshabilitada en cliente
```

**Ejemplo para producción (Backend):**
```bash
# .env.production
LOG_ENVIRONMENT=B
LOGNERD_LEVEL=WARN
LOGNERD_ENVIRONMENT=production
LOGNERD_FILE_PATH=./logs/production.log
LOGNERD_MAX_FILE_SIZE=50
LOGNERD_MAX_FILES=10
```

### Configuración mediante Código

También puedes configurar el logger mediante código TypeScript:

```typescript
import { createLogger } from 'lognerd';

// Para backend
const backendLogger = createLogger({
  runtimeEnvironment: 'backend', // o 'client' para navegador
  level: 'DEBUG', // Nivel mínimo de log: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  environment: 'development', // 'development' | 'production'
  enableConsole: true, // Habilitar salida en consola
  enableFile: true, // Habilitar escritura en archivo (solo backend)
  filePath: './logs/app.log', // Ruta del archivo de log
  maxFileSize: 10, // Tamaño máximo del archivo en MB (default: 10)
  maxFiles: 5, // Número máximo de archivos de log rotados (default: 5)
});

// Para cliente (navegador)
const clientLogger = createLogger({
  runtimeEnvironment: 'client',
  level: 'INFO',
  enableConsole: true,
  enableFile: false, // Se deshabilita automáticamente en cliente
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

- ✅ **Isomórfico (Node.js + Browser)**: Funciona en backend y navegador con la misma API
- ✅ **Importaciones dinámicas**: `fs` y `path` se cargan con `await import()` solo en Node.js
- ✅ **Browser-safe**: En navegador solo usa `console.log`/`console.warn`/`console.error`, sin importar módulos de Node
- ✅ **Tree-shaking**: `"sideEffects": false` y campo `"browser"` en `package.json` para Vite/Webpack
- ✅ **Niveles de log**: ERROR, WARN, INFO, DEBUG
- ✅ **Colores en consola** para desarrollo (rojo para ERROR, amarillo para WARN, cyan para INFO, magenta para DEBUG)
- ✅ **Escritura automática a archivo** (solo en backend, deshabilitada automáticamente en cliente)
- ✅ **Detección automática de entorno** (backend/client) o configuración manual con `LOG_ENVIRONMENT`
- ✅ **Mensajes de error claros** cuando hay configuración incorrecta
- ✅ **Deshabilitación automática de consola en producción**
- ✅ **Rotación automática de archivos** cuando alcanzan el tamaño máximo (solo backend)
- ✅ **Limpieza automática** de archivos antiguos (solo backend)
- ✅ **Patrón Singleton**: Uso directo sin crear instancias
- ✅ **TypeScript** con tipos completos
- ✅ **Sin dependencias externas** (solo usa módulos nativos)
- ✅ **Compatible con Vite y Webpack**: Soporte para variables `VITE_*` y tree-shaking

## 📝 Ejemplos

### Ejemplo Completo (Backend)

```typescript
import { info, warn, error, debug, configureLogger } from 'lognerd';

// Configurar el logger (opcional, se configura automáticamente desde variables de entorno)
// LOG_ENVIRONMENT=B debe estar en .env
configureLogger({
  runtimeEnvironment: 'backend',
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

### Ejemplo Completo (Frontend/Vite)

```typescript
import { info, warn, error, debug } from 'lognerd';

// En .env: VITE_LOG_ENVIRONMENT=C
// No necesitas configurar nada, se detecta automáticamente

info('Aplicación iniciada');
debug('Estado de la aplicación', { users: 10, active: true });

try {
  // Tu código aquí
  info('Operación exitosa');
} catch (err) {
  error('Error en operación', { error: err.message });
  // Los logs solo se muestran en consola del navegador
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

**Nota:** La rotación de archivos solo funciona en **backend** (Node.js). En **cliente** (navegador), la escritura de archivos está deshabilitada.

## 📦 Compatibilidad con Bundlers

lognerd está diseñado para funcionar correctamente con bundlers modernos sin configuración adicional.

### Vite / Webpack / Rollup

El `package.json` incluye:

```json
{
  "sideEffects": false,
  "browser": {
    "fs": false,
    "path": false
  }
}
```

- **`sideEffects: false`** permite que el bundler elimine código no utilizado (tree-shaking).
- **`browser`** indica a los bundlers que reemplacen `fs` y `path` con módulos vacíos en builds de navegador.

### Arquitectura interna

```
┌─────────────────────────────────────────────────┐
│                  logger.node.ts                  │
│  Carga dinámica: await import('fs'/'path')       │
│  Detección: typeof globalThis.window             │
├────────────────────┬────────────────────────────┤
│  Node.js (server)  │  Browser (client)          │
│  ✅ fs, path       │  ❌ fs, path (nunca carga) │
│  ✅ console.*      │  ✅ console.* únicamente   │
│  ✅ file write     │  ❌ file write             │
└────────────────────┴────────────────────────────┘
```

No necesitas configurar aliases, polyfills ni externals. Solo importa y usa.

## 🐛 Solución de Problemas

### Error: "process is not defined"
- **Causa**: Algunos bundlers eliminan `process` por completo en builds de navegador
- **Solución**: lognerd detecta la ausencia de `process` automáticamente y funciona solo con `console.*`. Si aún ves este error, agrega `VITE_LOG_ENVIRONMENT=C` en tu `.env` para Vite, o configura tu bundler para definir `process.env` como objeto vacío

### Error: "LOG_ENVIRONMENT está configurado para BACKEND pero se ejecuta en navegador"
- **Causa**: `LOG_ENVIRONMENT=B` está configurado pero el código corre en el navegador
- **Solución**: Cambia a `LOG_ENVIRONMENT=C` o `VITE_LOG_ENVIRONMENT=C` en tu `.env`

### Los archivos de log no se crean
- **Causa**: Estás en cliente (navegador) o `LOG_ENVIRONMENT=C`
- **Solución**: 
  - Para backend: Configura `LOG_ENVIRONMENT=B` y asegúrate de tener permisos de escritura
  - Para cliente: Es normal, los archivos no se pueden crear en el navegador

### Variables de entorno no se leen en Vite
- **Causa**: Falta el prefijo `VITE_` en las variables
- **Solución**: Usa `VITE_LOG_ENVIRONMENT`, `VITE_LOGNERD_LEVEL`, etc.

## 📄 Licencia

MIT

## 👤 Autor

Sergio Olivo O

