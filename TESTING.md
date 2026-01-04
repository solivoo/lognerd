# Guía de Pruebas para lognerd

## 🧪 Formas de Probar el Sistema

### 1. Prueba Básica (Configuración por Código)

Ejecuta el test básico que prueba todas las funcionalidades:

```bash
pnpm test
```

Esto probará:
- ✅ Logger con configuración por defecto
- ✅ Logger con configuración personalizada
- ✅ Logger en modo producción (sin consola)
- ✅ Logger con datos complejos
- ✅ Colores en consola
- ✅ Escritura en archivos

### 2. Prueba con Variables de Entorno

Prueba que el sistema lee correctamente las variables de entorno:

**En PowerShell:**
```powershell
$env:LOGNERD_LEVEL="DEBUG"
$env:LOGNERD_MAX_FILE_SIZE="5"
pnpm test:env
```

**En Bash/Linux/Mac:**
```bash
LOGNERD_LEVEL=DEBUG LOGNERD_MAX_FILE_SIZE=5 pnpm test:env
```

**Para Vite (con prefijo VITE_):**
```bash
VITE_LOGNERD_LEVEL=DEBUG VITE_LOGNERD_MAX_FILE_SIZE=5 pnpm test:env
```

### 3. Prueba Manual Rápida

Crea un archivo `quick-test.ts`:

```typescript
import { createLogger } from './src/index';

const logger = createLogger({
  level: 'DEBUG',
  filePath: './logs/quick-test.log'
});

logger.info('Prueba rápida');
logger.error('Error de prueba', { test: true });
```

Ejecuta:
```bash
ts-node quick-test.ts
```

### 4. Verificar Archivos de Log

Después de ejecutar las pruebas, revisa los archivos generados:

```bash
# Ver contenido de los logs
cat logs/app.log
cat logs/test.log
cat logs/env-test.log
```

O en PowerShell:
```powershell
Get-Content logs/app.log
Get-Content logs/test.log
Get-Content logs/env-test.log
```

## ✅ Qué Verificar

1. **Colores en Consola**: Deberías ver colores diferentes para cada nivel:
   - 🔴 Rojo para ERROR
   - 🟡 Amarillo para WARN
   - 🔵 Cyan para INFO
   - 🟣 Magenta para DEBUG

2. **Archivos de Log**: Deberían crearse en `./logs/` con el formato:
   ```
   2026-01-04T21:13:35.863Z [INFO] Mensaje | Data: {...}
   ```

3. **Variables de Entorno**: El test:env debería mostrar las variables detectadas

4. **Modo Producción**: En producción, no debería mostrar nada en consola pero sí escribir en archivo

## 🐛 Solución de Problemas

### No se crean los archivos de log
- Verifica que tengas permisos de escritura en el directorio
- Revisa que `LOGNERD_ENABLE_FILE=true` (o no esté definido, usa true por defecto)

### No se muestran colores
- Los colores solo funcionan en terminales que los soporten
- En algunos editores/IDEs pueden no mostrarse

### Variables de entorno no se leen
- En Vite, asegúrate de usar el prefijo `VITE_`
- Reinicia el servidor después de cambiar variables de entorno
- Verifica que las variables estén en el archivo `.env` correcto

