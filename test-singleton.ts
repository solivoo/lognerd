// Prueba del patrón singleton de lognerd
import { info, warn, error, debug, logger, configureLogger } from './src/index';

console.log('=== Prueba del Patrón Singleton ===\n');

// Prueba 1: Uso directo de funciones exportadas
console.log('1. Uso directo de funciones:');
info('Mensaje INFO desde función directa');
warn('Mensaje WARN desde función directa');
error('Mensaje ERROR desde función directa', { code: 500 });
debug('Mensaje DEBUG desde función directa', { test: true });

console.log('\n---\n');

// Prueba 2: Uso del objeto logger
console.log('2. Uso del objeto logger:');
logger.info('Mensaje INFO desde objeto logger');
logger.warn('Mensaje WARN desde objeto logger');
logger.error('Mensaje ERROR desde objeto logger', { error: 'test' });
logger.debug('Mensaje DEBUG desde objeto logger');

console.log('\n---\n');

// Prueba 3: Configuración del singleton
console.log('3. Configuración del singleton:');
configureLogger({
  level: 'WARN',
  filePath: './logs/singleton-test.log',
});

info('Este mensaje NO debería aparecer (nivel INFO < WARN)');
warn('Este mensaje SÍ debería aparecer');
error('Este mensaje también debería aparecer');

console.log('\n=== Prueba completada ===');
console.log('Revisa ./logs/app.log y ./logs/singleton-test.log');

