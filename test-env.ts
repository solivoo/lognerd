// Prueba de lognerd con variables de entorno
// Ejecuta con: LOGNERD_LEVEL=DEBUG pnpm test:env
// O para Vite: VITE_LOGNERD_LEVEL=DEBUG pnpm test:env

import { createLogger } from './src/index';

console.log('=== Prueba de lognerd con Variables de Entorno ===\n');
console.log('Variables de entorno detectadas:');
console.log(`  LOGNERD_LEVEL: ${process.env.LOGNERD_LEVEL || process.env.VITE_LOGNERD_LEVEL || 'no definida'}`);
console.log(`  LOGNERD_ENVIRONMENT: ${process.env.LOGNERD_ENVIRONMENT || process.env.VITE_LOGNERD_ENVIRONMENT || process.env.NODE_ENV || 'no definida'}`);
console.log(`  LOGNERD_MAX_FILE_SIZE: ${process.env.LOGNERD_MAX_FILE_SIZE || process.env.VITE_LOGNERD_MAX_FILE_SIZE || 'no definida'}`);
console.log(`  LOGNERD_MAX_FILES: ${process.env.LOGNERD_MAX_FILES || process.env.VITE_LOGNERD_MAX_FILES || 'no definida'}`);
console.log('\n---\n');

// Crear logger que leerá las variables de entorno
const logger = createLogger({
  filePath: './logs/env-test.log',
});

logger.debug('Mensaje DEBUG (solo si LOGNERD_LEVEL=DEBUG)');
logger.info('Mensaje INFO');
logger.warn('Mensaje WARN');
logger.error('Mensaje ERROR', { 
  envTest: true,
  variables: {
    level: process.env.LOGNERD_LEVEL || process.env.VITE_LOGNERD_LEVEL,
    environment: process.env.LOGNERD_ENVIRONMENT || process.env.VITE_LOGNERD_ENVIRONMENT || process.env.NODE_ENV,
  }
});

console.log('\n=== Prueba completada ===');
console.log('Revisa ./logs/env-test.log para ver los logs guardados');

