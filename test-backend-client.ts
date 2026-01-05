// Prueba de lognerd con LOG_ENVIRONMENT
import { info, warn, error, configureLogger } from './src/index';

console.log('=== Prueba de LOG_ENVIRONMENT ===\n');

// Simular diferentes entornos
console.log('1. Sin LOG_ENVIRONMENT (detección automática):');
info('Mensaje sin configuración de entorno');

console.log('\n---\n');

console.log('2. Configurando para BACKEND:');
configureLogger({
  runtimeEnvironment: 'backend',
});
info('Mensaje en backend');
error('Error en backend', { code: 500 });

console.log('\n---\n');

console.log('3. Configurando para CLIENT:');
configureLogger({
  runtimeEnvironment: 'client',
});
warn('⚠️ En cliente, la escritura de archivos está deshabilitada');
info('Mensaje en cliente');
error('Error en cliente', { code: 404 });

console.log('\n=== Prueba completada ===');

