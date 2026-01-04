// Archivo de prueba para lognerd
import { createLogger } from './src/index';

console.log('=== Prueba de lognerd ===\n');

// Prueba 1: Logger con configuración por defecto
console.log('1. Logger con configuración por defecto:');
const logger1 = createLogger();
logger1.info('Mensaje informativo');
logger1.debug('Mensaje de debug');
logger1.warn('Mensaje de advertencia');
logger1.error('Mensaje de error', { code: 500, message: 'Error de prueba' });

console.log('\n---\n');

// Prueba 2: Logger con configuración personalizada
console.log('2. Logger con configuración personalizada:');
const logger2 = createLogger({
  level: 'DEBUG',
  environment: 'development',
  filePath: './logs/test.log',
  maxFileSize: 1, // 1MB para pruebas rápidas
  maxFiles: 3,
});

logger2.info('Logger personalizado - INFO');
logger2.debug('Logger personalizado - DEBUG');
logger2.warn('Logger personalizado - WARN');
logger2.error('Logger personalizado - ERROR', { test: true });

console.log('\n---\n');

// Prueba 3: Logger en modo producción (sin consola)
console.log('3. Logger en modo producción (solo archivo):');
const logger3 = createLogger({
  level: 'WARN',
  environment: 'production',
  filePath: './logs/production-test.log',
});

logger3.info('Este mensaje NO se mostrará en consola (solo en archivo)');
logger3.warn('Este mensaje SÍ se mostrará en consola');
logger3.error('Este mensaje también se mostrará', { production: true });

console.log('\n---\n');

// Prueba 4: Logger con datos complejos
console.log('4. Logger con datos complejos:');
const logger4 = createLogger({
  level: 'INFO',
});

const userData = {
  id: 123,
  name: 'Juan',
  email: 'juan@example.com',
  preferences: {
    theme: 'dark',
    notifications: true,
  },
};

logger4.info('Usuario creado', userData);
logger4.error('Error al procesar usuario', {
  userId: 123,
  error: 'Validation failed',
  details: {
    field: 'email',
    message: 'Invalid email format',
  },
});

console.log('\n=== Prueba completada ===');
console.log('Revisa los archivos en ./logs/ para ver los logs guardados');

