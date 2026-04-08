# Guía de Mantenimiento: Migraciones (Método Squash)

Esta guía explica cómo mantener la base de datos de **FrioCheck** limpia y profesional, trabajando siempre sobre un esquema consolidado para evitar el desorden de múltiples archivos de parches.

## 🟢 El Concepto: Un Solo Archivo de Verdad
En lugar de tener 30+ archivos de migración que cuentan "la historia" de errores y correcciones, trabajamos con un **Squash**. Esto significa que consolidamos todo en un único archivo inicial que representa la base actual y real del proyecto.

## 🛠️ Procedimiento de "Limpieza Profunda" (Squash)

Si en el futuro vuelves a tener muchos archivos de parches y quieres "limpiar", sigue estos pasos:

### 1. Preparación del Código
Asegúrate de que tus entidades (ej. `Machine.entity.ts`) están perfectamente alineadas con lo que quieres en la base de datos.

### 2. Borrón y Cuenta Nueva (Arquitectura)
1. **Mueve** las migraciones viejas a una carpeta temporal (o bórralas si ya están en producción).
2. **Genera** la nueva migración consolidada:
   ```bash
   npx typeorm migration:generate src/migrations/InitialSquash -d ormconfig.ts
   ```

### 3. El Truco de Sincronización (The Sync Hack)
Para que TypeORM no intente "borrar y volver a crear" tus tablas en Azure (lo que borraría tus datos), debes engañar al sistema:
1. Limpia la tabla interna de metadatos (puedes usar el script `scripts/sync-migrations.ts` que ya te creé).
2. El script borrará la tabla `migrations` e insertará el registro de tu nueva migración como ya ejecutada.

## ⚖️ Ventajas para el Equipo
- **Orden**: Solo un archivo para revisar la estructura de la DB.
- **Rendimiento**: Los despliegues en Azure son más rápidos al no tener que verificar 40 archivos.
- **Claridad**: Ideal para que nuevos desarrolladores entiendan el sistema de inmediato.

---
> [!TIP]
> **Regla de Oro**: Realiza un Squash cada vez que termines una fase importante del proyecto (ej. una vez al mes o por cada Release mayor).
