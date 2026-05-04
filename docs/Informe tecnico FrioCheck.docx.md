

**INFORME TÉCNICO**

**Sistema FrioCheck**

Plataforma de Control, Validación y Trazabilidad de Activos Refrigerados

# **1\. Introducción**

El presente documento constituye el informe técnico formal del sistema FrioCheck, una plataforma digital diseñada para resolver los problemas de gestión, control y trazabilidad de activos refrigerados distribuidos en terreno. El documento consolida la arquitectura del sistema, las decisiones tecnológicas adoptadas, los casos de uso operativos, la especificación de endpoints REST, los contratos de transferencia de datos (DTO), el modelo de datos entidad por entidad, ejemplos de payloads reales y las políticas de sincronización offline, documentando en cada sección el fundamento técnico y operativo que justifica cada decisión.

FrioCheck nace de una necesidad concreta: las empresas que distribuyen activos refrigerados en puntos de venta externos carecen de visibilidad real sobre el estado, ubicación y actividad de sus máquinas. La coordinación se realiza por canales informales, las visitas de terreno no son verificables y el historial de cada activo no existe como fuente estructurada y confiable. Este sistema resuelve esos problemas de forma sistemática, imponiendo validación presencial obligatoria a través de tecnología NFC y GPS, y centralizando toda la información en una plataforma de gestión multi-tenant.

El alcance del documento cubre la totalidad del ecosistema: la capa de hardware físico (tags NFC), la aplicación móvil, el panel web administrativo, el backend API y la infraestructura de despliegue en la nube de Azure.

# 	**Índice** 

# 																																																																		

# 

# 

# 

# 

# 

# **2\. Definición del Problema y Justificación Estratégica**

## **2.1 Contexto Operacional**

Las empresas que distribuyen activos refrigerados, como vitrinas congeladores, heladeras o equipos de frío para puntos de venta, enfrentan un problema estructural: tienen docenas o cientos de máquinas instaladas en locales de terceros, pero no cuentan con un sistema que les permita saber con certeza cuál es el estado real de cada activo en tiempo real.

La coordinación entre vendedores, técnicos, transportistas y el equipo de soporte se realiza predominantemente a través de WhatsApp, llamadas telefónicas y planillas Excel. Este modelo de operación produce información fragmentada, no estructurada, no verificable y sin trazabilidad cronológica. Una empresa que opera 500 máquinas en terreno no puede responder con datos objetivos preguntas básicas como: ¿Cuántas máquinas están activas hoy? ¿Cuándo fue la última visita técnica de la máquina número 247? ¿Qué técnico la atendió y qué intervención realizó?

## **2.2 Problemas Detectados**

**Los problemas identificados en el análisis operacional son los siguientes:**

* **Gestión informal y fragmentada:** la coordinación mediante canales no estructurados genera pérdida de información, duplicidad de registros y ausencia de fuente única de verdad.

* **Visitas fantasma:** sin mecanismo de validación presencial, es imposible garantizar que un técnico o vendedor estuvo físicamente frente a la máquina. Los registros pueden ser generados de forma remota o fabricada.

* **Ausencia de trazabilidad histórica:** no existe un historial estructurado por activo. No se puede reconstruir la línea de tiempo de mantenimientos, fallas y visitas de una máquina específica.

* **Capital inactivo no detectado:** las máquinas que llevan semanas o meses sin generar pedidos o recibir visitas no son detectadas, representando capital inmovilizado no identificado.

* **Falta de medición objetiva del desempeño:** las métricas de productividad de vendedores y técnicos se basan en auto reportes, no en datos verificados.

* **Riesgo patrimonial:** sin registro formal, la diferencia entre los activos que contabilidad registra y los que existen físicamente en terreno puede ser significativa.

## 

## **2.3 Impacto Económico Cuantificable**

El impacto económico de estos problemas es concreto y medible. Estudios de McKinsey & Company sobre mantenimiento predictivo demuestran que los sistemas de monitoreo avanzados pueden reducir las fallas entre un 30% y un 50%, y disminuir los costos de mantenimiento entre un 10% y un 40%. En el contexto específico del sector retail de refrigeración, el 20% de los equipos experimenta algún tipo de falla al menos una vez al año.

Para una empresa distribuidora de helados, una vitrina congeladora puede contener entre 150 y 300 unidades con un precio de venta de entre $1.000 y $1.500 CLP por unidad. Esto representa entre $150.000 y $450.000 CLP en productos en riesgo por cada máquina que falla sin detección temprana. A escala de flota, el impacto acumulado justifica ampliamente la inversión en un sistema de trazabilidad activa.

# 

# **3\. Objetivos del Sistema**

## **3.1 Objetivo General**

Desarrollar una plataforma digital robusta que permita registrar, validar y auditar el ciclo de vida de activos refrigerados, asegurando integridad de la información, reduciendo errores operativos y proveyendo visibilidad gerencial basada en datos estructurados y verificados.

## **3.2 Objetivos Específicos**

1. Implementar validación presencial obligatoria mediante escaneo NFC combinado con geolocalización GPS, de modo que ninguna operación pueda registrarse sin prueba física de presencia.

2. Construir un historial digital inmutable por activo que centralice mantenimientos, fallas, visitas comerciales y entregas en una línea de tiempo cronológica verificable.

3. Permitir operación offline completa en la aplicación móvil, garantizando que las zonas sin conectividad no interrumpan el registro de operaciones.

4. Garantizar sincronización consistente y sin pérdida de datos entre dispositivos móviles y el servidor central, con políticas de retry robustas.

5. Proveer un dashboard gerencial con KPIs operativos basados exclusivamente en datos estructurados, no en auto reportes.

6. Implementar arquitectura multi-tenant que permita operar múltiples empresas bajo la misma plataforma con aislamiento total de datos.

## **3.3 KPIs Iniciales del Sistema**

Los indicadores clave de desempeño que validan el cumplimiento de los objetivos son:

* **Tasa de validación presencial:** porcentaje de visitas en terreno que registran exitosamente el cruce del GPS con la lectura NFC, calculado sobre el total de rutas asignadas en el mes. Meta inicial: \>90%.

* **Índice de recuperación de activos:** cantidad de máquinas rescatadas o reubicadas luego de que el sistema alerta inactividad por más de 40 días consecutivos.

* **Adopción del canal formal:** proporción de tickets de mantenimiento creados en la plataforma versus reportes por teléfono o WhatsApp. Meta: \>80% en los primeros 6 meses.

* **Desviación de inventario:** diferencia porcentual entre activos registrados en contabilidad y activos verificados físicamente mediante escaneo en terreno.

* **Tiempo efectivo de respuesta:** horas entre la creación de una alerta técnica y el escaneo de check-in del técnico asignado en el activo afectado.


**4\. Arquitectura del Sistema**

## **4.1 Enfoque Arquitectónico**

El sistema adopta una arquitectura cliente-servidor desacoplada con tres capas de cliente diferenciadas: la aplicación móvil para operación en terreno, el panel web administrativo para gestión y análisis, y el backend centralizado como única fuente de lógica de negocio.

La decisión de centralizar la lógica en el backend y no en los clientes responde a un principio de seguridad fundamental: nunca confiar en el cliente. Cualquier validación crítica, autenticidad del NFC, coherencia GPS, permisos de rol, se ejecuta en el servidor. Los clientes son responsables únicamente de la captura de datos y la presentación de información.

## **4.2 Capas del Sistema**

La siguiente tabla describe cada capa tecnológica del sistema, su tecnología y su función:

| Capa | Tecnología | Función |
| :---- | :---- | :---- |
| **Capa Física** | NTAG-215 / PET | Tag adherido a cada máquina. Valida presencia física obligatoria antes de cualquier operación. |
| **App Móvil** | Flutter / Dart | Escaneo NFC, captura GPS, fotografía de evidencia, operación offline-first. |
| **Panel Web** | Angular / TypeScript / Angular Material | Dashboard KPIs, gestión de activos, visualización de historial, multi-tenant. |
| **API Gateway** | NestJS / JWT / RBAC / TenantGuard | Única puerta de entrada. Válida identidad, permisos, tenant y autenticidad de NFC. |
| **Business Modules** | NestJS / TypeScript / Clean Architecture | Módulos: Assets, Visits, Tickets, Orders, Sync, Media, Users. |
| **Cola de Tareas** | BullMQ \+ Redis Workers | Procesa fotos, sincronización diferida y jobs en segundo plano sin bloquear la API. |
| **Base de Datos** | PostgreSQL 15 / Redis | Historial estructurado, integridad referencial, caché de sesiones y datos frecuentes. |
| **Almacenamiento** | Azure Blob Storage | Evidencia fotográfica. La BD almacena únicamente la URL; el binario reside en Blob. |
| **Infraestructura** | Azure / Docker / Azure DevOps / App Insights | Despliegue automático CI/CD, monitoreo de producción, alertas de performance. |

## **4.3 Justificación de Decisiones Tecnológicas**

### **4.3.1 Flutter sobre desarrollo nativo**

Se evaluaron dos opciones de desarrollo móvil: Swift/Kotlin nativo por plataforma, o Flutter multiplataforma. El desarrollo nativo ofrece acceso directo al hardware sin capas intermedias y rendimiento máximo, pero duplica el costo de desarrollo y mantenimiento al requerir dos equipos especializados y dos codebases independientes.

Flutter fue seleccionado porque provee un único codebase en Dart para iOS y Android, con acceso suficiente a las APIs nativas de NFC, GPS y cámara a través de Platform Channels. El motor gráfico propio de Flutter garantiza una experiencia de usuario consistente entre plataformas. Para las funcionalidades críticas del sistema ,escaneo NFC, geolocalización y almacenamiento local, Flutter ofrece el acceso nativo necesario sin los costos de duplicidad.

### **4.3.2 Angular sobre React para el Panel Web**

Angular fue elegido para el panel web administrativo por ser un framework de arquitectura opinionada que integra nativamente manejo de estado asíncrono con RxJS, inyección de dependencias, y un sistema de módulos que facilita el mantenimiento a largo plazo de una aplicación de gestión compleja. A diferencia de React, que requiere decisiones adicionales sobre librerías de estado, enrutamiento y validación de formularios, Angular provee una solución integrada que reduce la fragmentación tecnológica del equipo.

Angular Material provee un sistema de diseño coherente con Flutter Material Design, lo que garantiza consistencia visual entre la aplicación móvil y el panel web, reduciendo la curva de aprendizaje del usuario y los costos de soporte.

### **4.3.3 NestJS sobre Express para el Backend**

NestJS fue seleccionado sobre Express por su arquitectura modular basada en controladores, servicios e inyección de dependencias, que facilita la implementación de principios SOLID y Clean Architecture. En un sistema con múltiples módulos de negocio (Assets, Visits, Tickets, Orders, Sync, Media, Users), la estructura de NestJS permite mantener fronteras claras entre dominios, lo que es crítico para la mantenibilidad a medida que el sistema escala.

NestJS también facilita la implementación de DTOs con validación automática mediante class-validator, guards de autenticación y autorización reutilizables, y decoradores personalizados para la lógica de multi-tenant y validación de NFC.

### **4.3.4 PostgreSQL sobre bases de datos NoSQL**

La naturaleza relacional del dominio de negocio justifica el uso de una base de datos relacional. La trazabilidad requiere relaciones claras y verificables entre entidades: un evento de visita pertenece a un usuario, a un activo, a un tenant; un ticket está asociado a un activo específico con un historial de intervenciones. La integridad referencial de PostgreSQL garantiza que estas relaciones no puedan corromperse, lo que es crítico para la confiabilidad del historial.

Adicionalmente, PostgreSQL 15 provee soporte nativo para datos geoespaciales mediante PostGIS (útil para consultas por radio de GPS), índices parciales para optimizar consultas de activos inactivos, y funciones de ventana para cálculo de métricas de tiempo entre eventos.

### **4.3.5 Azure Blob Storage para evidencia fotográfica**

Las fotografías de evidencia no se almacenan en la base de datos relacional. Guardar binarios en PostgreSQL degradará el rendimiento de las consultas, dificultará el escalamiento del almacenamiento de forma independiente al procesamiento, e incrementa los costos de backup innecesariamente. Azure Blob Storage, dentro del mismo ecosistema de Azure donde reside el backend, provee alta disponibilidad, redundancia geográfica y URLs de acceso con tiempo de expiración (SAS tokens) para acceso seguro a evidencias desde los clientes.

# 

# **5\. Fundamento Tecnológico: Hardware NFC**

## **5.1 Justificación del Uso de NFC frente a Alternativas**

Se evaluaron cuatro tecnologías de identificación de activos: NFC, QR, código de barras y RFID. La siguiente tabla resume el análisis comparativo:

| Tecnología | Ventajas | Desventajas | Evaluación para FrioCheck |
| :---- | :---- | :---- | :---- |
| **NFC** | Lectura de proximidad controlada, difícil de clonar por UID inmutable, integrado en smartphones modernos. | Requiere chip físico en cada activo. | Opción seleccionada. Mejor balance seguridad/costo para validación presencial. |
| **QR** | Bajo costo de producción, sin hardware especializado. | Fácil de fotografiar y reutilizar sin presencia física. Vulnerable a fraude. | Descartado como identificador principal. Débil para antifraude. |
| **Código de Barras** | Estándar industrial consolidado. | Fácil replicación. Sin mecanismo de validación de proximidad. | Descartado. Sin valor para prueba de presencia. |
| **RFID** | Lectura masiva sin línea de visión. | Requiere infraestructura de lectores fija, costo elevado por punto. | Sobredimensionado para este caso de uso. Válido para inventario masivo, no para visitas. |

La decisión de adoptar NFC se fundamenta en su capacidad para establecer un mecanismo de prueba de presencia física. El operario debe estar a menos de 5 cm del tag para leerlo, lo que hace imposible registrar una visita sin estar físicamente frente a la máquina. QR y código de barras no proveen esta garantía porque pueden ser fotografiados y reutilizados remotamente.

## **5.2 Chip Seleccionado: NTAG-215**

Se seleccionó el chip NTAG-215 del fabricante NXP Semiconductors. La evaluación comparativa de la familia NTAG fue la siguiente:

| Modelo | Memoria | Precio estimado | Evaluación |
| :---- | :---- | :---- | :---- |
| NTAG-213 | 144 bytes | $300 – $310 CLP | Limitado para un payload JSON estructurado. Descartado. |
| **NTAG-215 (seleccionado)** | 504 bytes | $322 – $340 CLP | Suficiente para JSON con sid, tid y chk. Equilibrio óptimo costo/capacidad. |
| NTAG-216 | 888 bytes | $509 – $530 CLP | Capacidad excesiva para el payload requerido. Incremento de costo sin beneficio. |

## **5.3 Estructura de Datos del Tag**

El tag almacena únicamente identificadores referenciales en formato NDEF con tipo MIME application/json. No se almacena información sensible en el chip para reducir el impacto de cualquier clonación.

{  
  "sid": "MACH-2024-00247",   // ID de serie del activo en el sistema  
  "tid": "tenant\_abc123",      // Identificador del tenant propietario  
  "chk": "a3f9"               // Hash corto para verificación básica de integridad  
}

## **5.4 Seguridad del Tag**

El NTAG-215 no incorpora criptografía avanzada por hardware. La seguridad se implementa en dos niveles complementarios:

* **Nivel físico:** activación de Password Protection tras la vinculación del tag al activo en el sistema, y bloqueo permanente de escritura para impedir modificación del contenido NDEF.

* **Nivel backend:** registro del UID inmutable del chip en la base de datos durante el proceso de enrolamiento. En cada escaneo, el backend valida que el UID reportado por el dispositivo coincida con el UID registrado para ese Machine ID. Si el contenido NDEF es clonado en un chip distinto con UID diferente, el backend rechaza la operación.

## **5.5 Material del Tag**

Para equipos refrigerados, el material seleccionado es PET (polietileno tereftalato), por su alta resistencia en ambientes húmedos y fríos, capacidad de adhesión a superficies metálicas y plásticas, y durabilidad en condiciones de temperatura bajo cero. PVC y papel sintético son aptos para uso general o interior, pero no para la exposición constante a humedad y frío que caracteriza al entorno de una vitrina congeladora.

# **6\. Actores del Sistema y Casos de Uso Detallados**

## **6.1 Clasificación de Actores**

El sistema define seis actores con responsabilidades diferenciadas. Esta distinción no es meramente organizacional: impacta directamente en el modelo de datos, en los endpoints disponibles por rol, en los flujos de validación y en las métricas generadas.

### **6.1.1 Vendedor en Terreno**

Actor operativo cuya función principal es la gestión comercial de la cartera de clientes.             El sistema transforma al vendedor en un Gestor de Cuentas con respaldo digital verificable, reemplazando la coordinación por WhatsApp con un registro estructurado de cada visita.

Responsabilidades en el sistema:

* Registrar check-in y check-out en cada visita comercial mediante escaneo NFC.

* Crear pedidos vinculados al activo escaneado.

* Registrar mermas, anomalías visuales y reportes de estado del activo.

* Acceder al historial del cliente y métricas de su cartera desde la app móvil.

Caso de uso detallado, Visita comercial con pedido:

7. El vendedor llega al punto de venta y abre la aplicación FrioCheck.

8. La app detecta el tag NFC de la máquina y el vendedor realiza el escaneo de check-in.

9. El sistema captura la posición GPS y la registra junto al timestamp del escaneo.

10. Se carga automáticamente el perfil 360° del cliente: datos maestros, activos asociados, historial de pedidos y últimas visitas.

11. El vendedor crea un nuevo pedido, seleccionando productos y cantidades desde la interfaz.

12. Al finalizar la visita, realiza el escaneo de check-out. El sistema calcula la duración efectiva de la visita.

13. Si no hay conectividad, los datos se almacenan localmente y se sincronizan al recuperar red.

### **6.1.2 Técnico**

Actor especializado en intervenciones de mantenimiento y reparación. Cada intervención técnica genera un registro estructurado con evidencia fotográfica, checklist validado y firma digital del receptor del servicio.

Responsabilidades en el sistema:

* Realizar doble escaneo NFC: uno al iniciar la intervención (check-in) y otro al cerrar (check-out), registrando la duración exacta del servicio.

* Consultar la hoja de vida digital del activo: historial de reparaciones, fallas recurrentes y diagnósticos previos.

* Completar el checklist de mantenimiento preventivo antes de cerrar el ticket.

* Capturar evidencia fotográfica del estado inicial y final del activo.

* Registrar repuestos utilizados para el control de inventario de la flota técnica.

* Obtener la firma digital de conformidad del minorista o encargado del local.

**Caso de uso detallado, Intervención técnica correctiva:**

14. El técnico recibe una notificación de ticket asignado desde el sistema.

15. Al llegar al local, escanea el NFC del activo para abrir la visita. El sistema valida GPS y registra el check-in.

16. Se carga la hoja de vida del activo: el técnico visualiza la timeline de intervenciones previas, fallas recurrentes y el diagnóstico que originó el ticket actual.

17. El técnico realiza la reparación, registra los repuestos utilizados y completa el checklist preventivo obligatorio.

18. Captura fotografías del estado antes y después de la intervención.

19. El minorista o encargado del local firma digitalmente en la pantalla del técnico.

20. El técnico realiza el escaneo de check-out. El ticket se cierra automáticamente y el historial del activo se actualiza.

### **6.1.3 Transportista**

Actor responsable de la logística de activos: instalaciones, retiros y entregas de mercadería. El sistema garantiza que el transportista entregue el activo correcto en el destino correcto, con evidencia verificable.

**Responsabilidades en el sistema:**

* Escanear el NFC del activo antes de cualquier entrega o retiro para validar la identidad del equipo.

* Registrar la entrega de mercadería asociada al activo.

* Obtener la firma de conformidad digital del cliente receptor.

* Registrar rechazos o diferencias con evidencia fotográfica y generación automática de ticket.

* Actualizar el estado del activo a 'En Tránsito' al escanear durante un retiro.

Caso de uso detallado, Entrega de activo nuevo:

21. El transportista recibe la orden de entrega en su app con la hoja de ruta georeferenciada.

22. Al llegar al local, escanea el NFC del activo que transporta para confirmar que es el equipo correcto antes de descargarlo.

23. Verifica mediante checklist que el activo llega en condiciones (temperatura, estado físico).

24. El cliente firma digitalmente en la app del transportista para declarar la recepción conforme.

25. El sistema actualiza el estado del activo a 'Instalado' y registra la ubicación GPS del punto de instalación.

### **6.1.4 Minorista**

Actor externo que opera el punto de venta donde está instalado el activo.                      El sistema empodera al minorista para autogestionar reportes de fallas y solicitudes de servicio, eliminando la dependencia de canales informales.

Responsabilidades en el sistema:

* Generar tickets de soporte técnico mediante escaneo NFC del activo afectado.

* Solicitar visita comercial del vendedor asignado.

* Adjuntar evidencia fotográfica al reportar fallas.

* Verificar la identidad y credencial digital del técnico o transportista que visita el local.

* Firmar digitalmente la conformidad de servicios recibidos.

### **6.1.5 Encargado de Soporte**

Actor con visibilidad centralizada de todos los activos, tickets e incidentes.               Opera principalmente desde el panel web administrativo.

* Recepcionar, filtrar y asignar tickets generados desde la app móvil.

* Detectar activos inactivos mediante alertas automáticas del sistema.

* Validar la coherencia entre escaneo NFC y posición GPS para detectar operaciones sospechosas.

* Monitorear métricas de desempeño por actor y por activo.

### **6.1.6 Administrador**

Actor con acceso total a la configuración del sistema dentro de su tenant.        Responsable de la gobernanza operacional.

* Gestionar usuarios, roles y permisos dentro del tenant.

* Configurar activos, modelos de máquina y puntos de venta.

* Acceder a reportes completos y exportar datos para auditoría.

* Supervisar el dashboard de KPIs gerenciales.

# **7\. Modelo Entidad-Relación: Descripción Detallada**

El modelo de datos está diseñado en torno a un principio fundamental: cada acción relevante genera un evento persistente e inmutable. Esto garantiza que el historial de un activo pueda reconstruirse en cualquier momento sin ambigüedades.

## **7.1 Entidad: Tenant**

Representa una empresa o cliente que opera en la plataforma bajo el modelo multi-tenant. Todos los datos del sistema están aislados por tenant, garantizando que una empresa no pueda acceder a los datos de otra.

| Campo | Tipo | Descripción |
| :---- | :---- | :---- |
| **id** | UUID | Identificador único del tenant. Se propaga como clave de partición en todas las entidades hijas. |
| **name** | VARCHAR(255) | Nombre comercial de la empresa. |
| **slug** | VARCHAR(100) | Identificador URL-friendly único. Usado en subdominios y cabeceras X-Tenant-ID. |
| **isActive** | BOOLEAN | Permite desactivar un tenant sin eliminar sus datos históricos. |
| **createdAt** | TIMESTAMPTZ | Fecha de creación del tenant en la plataforma. |

## 

## **7.2 Entidad: User**

Representa a cada actor humano del sistema. Un usuario pertenece exactamente a un tenant y tiene exactamente un rol que determina sus permisos. La autenticación se realiza con email y contraseña, el acceso se controla mediante JWT con claims de tenantId y role.

| Campo | Tipo | Descripción |
| :---- | :---- | :---- |
| **id** | UUID | Identificador único del usuario. |
| **tenantId** | UUID FK | Referencia al tenant. Clave de aislamiento de datos. |
| **email** | VARCHAR(255) | Correo electrónico. Único por tenant (un mismo email puede existir en distintos tenants). |
| **passwordHash** | VARCHAR(255) | Hash bcrypt de la contraseña. Nunca se almacena ni transmite la contraseña en texto plano. |
| **role** | ENUM | Rol del usuario: VENDOR, TECHNICIAN, DRIVER, RETAILER, SUPPORT, ADMIN. |
| **fullName** | VARCHAR(255) | Nombre completo para credencial digital e identificación en historial. |
| **isActive** | BOOLEAN | Permite desactivar usuarios sin eliminar su historial de operaciones. |

##        **7.3 Entidad: Machine (Activo)**

Entidad central del sistema. Representa cada activo refrigerado físico.                     Cada Machine tiene exactamente un tag NFC asociado, y genera un historial de eventos a lo largo de toda su vida operativa. El diseño garantiza que la Machine sea la entidad de consulta principal en el 80% de las operaciones del sistema.

| Campo | Tipo | Descripción |
| :---- | :---- | :---- |
| **id** | UUID | Identificador interno del activo en el sistema. |
| **tenantId** | UUID FK | Referencia al tenant propietario del activo. |
| **serialNumber** | VARCHAR(100) | Número de serie físico del equipo. Único por tenant. |
| **nfcUid** | VARCHAR(50) | UID inmutable del chip NFC vinculado al activo. Validado en cada escaneo. |
| **nfcTagId** | VARCHAR(100) | Identificador del tag tal como aparece en el payload NDEF (campo sid). |
| **model** | VARCHAR(100) | Modelo del equipo. Usado para asociar guías técnicas y checklists específicos. |
| **status** | ENUM | Estado del activo: ACTIVE, INACTIVE, IN\_TRANSIT, MAINTENANCE, DECOMMISSIONED. |
| **locationId** | UUID FK | Referencia al punto de venta donde está instalado. |
| **installedAt** | TIMESTAMPTZ | Fecha de instalación en el punto de venta actual. |
| **lastActivityAt** | TIMESTAMPTZ | Timestamp de la última interacción registrada. Usado para detectar activos inactivos. |

## **7.4 Entidad: Location (Punto de Venta)**

Representa el local físico donde está o estuvo instalado un activo. Almacena la ubicación geográfica de referencia para validar la coherencia con el GPS del dispositivo en el momento del escaneo.

| Campo | Tipo | Descripción |
| :---- | :---- | :---- |
| **id** | UUID | Identificador único del punto de venta. |
| **tenantId** | UUID FK | Tenant al que pertenece este punto de venta. |
| **name** | VARCHAR(255) | Nombre del local (ej. 'Minimarket El Sol , Pudahuel'). |
| **address** | TEXT | Dirección física completa. |
| **latitude** | DECIMAL(9,6) | Latitud GPS de referencia del local. |
| **longitude** | DECIMAL(9,6) | Longitud GPS de referencia del local. |
| **contactName** | VARCHAR(255) | Nombre del encargado del local para contacto. |

## 

## **7.5 Entidad: Visit**

Registra cada visita presencial validada al activo. Es la entidad que materializa el núcleo funcional del sistema: la prueba de presencia física. Una visit se abre con el escaneo de check-in y se cierra con el check-out. Entre ambos escaneos, el sistema registra la duración efectiva de la visita.

| Campo | Tipo | Descripción |
| :---- | :---- | :---- |
| **id** | UUID | Identificador único de la visita. |
| **machineId** | UUID FK | Activo visitado. |
| **userId** | UUID FK | Usuario que realiza la visita. |
| **tenantId** | UUID FK | Tenant. Clave de partición para aislamiento de datos. |
| **visitType** | ENUM | Tipo de visita: COMMERCIAL, TECHNICAL, DELIVERY, PICKUP. |
| **checkInAt** | TIMESTAMPTZ | Timestamp del escaneo de apertura. |
| **checkOutAt** | TIMESTAMPTZ | Timestamp del escaneo de cierre. NULL mientras la visita está abierta. |
| **checkInLat / Lng** | DECIMAL(9,6) | Coordenadas GPS capturadas en el momento del check-in. |
| **checkOutLat / Lng** | DECIMAL(9,6) | Coordenadas GPS capturadas en el momento del check-out. |
| **isGpsValid** | BOOLEAN | Resultado de la validación backend: GPS dentro del radio permitido del punto de venta. |
| **nfcScanCount** | INTEGER | Contador de escaneos NFC durante la visita. Para técnicos debe ser \>= 2 (doble escaneo). |
| **notes** | TEXT | Observaciones libres del operario sobre la visita. |
| **syncStatus** | ENUM | Estado de sincronización: PENDING, SYNCED, FAILED. Gestionado por el módulo Sync. |

##  

## **7.6 Entidad: Ticket**

Registra incidencias técnicas reportadas sobre un activo. Un ticket es creado mediante escaneo NFC, lo que garantiza su vinculación directa al activo físico. El ticket tiene un ciclo de vida con estados que permiten seguimiento desde el reporte hasta la resolución.

| Campo | Tipo | Descripción |
| :---- | :---- | :---- |
| **id** | UUID | Identificador único del ticket. |
| **machineId** | UUID FK | Activo sobre el que se reporta la falla. |
| **reportedBy** | UUID FK | Usuario que generó el reporte (puede ser RETAILER, VENDOR o SUPPORT). |
| **assignedTo** | UUID FK | Técnico asignado a la resolución del ticket. NULL si aún no asignado. |
| **faultType** | ENUM | Categoría de la falla: REFRIGERATION, ELECTRICAL, STRUCTURAL, DISPLAY, OTHER. |
| **description** | TEXT | Descripción libre de la falla observada. |
| **status** | ENUM | Estado del ticket: OPEN, ASSIGNED, IN\_PROGRESS, RESOLVED, CLOSED. |
| **priority** | ENUM | Prioridad: LOW, MEDIUM, HIGH, CRITICAL. CRITICAL bloquea el activo para pedidos. |
| **createdAt** | TIMESTAMPTZ | Timestamp de creación del reporte. |
| **resolvedAt** | TIMESTAMPTZ | Timestamp de resolución. Permite calcular tiempo de respuesta efectivo. |

## **7.7 Entidad: Order (Pedido)**

Registra las órdenes de reposición de producto generadas desde la app del vendedor o el minorista, siempre vinculadas al activo escaneado. El módulo de pedidos es una extensión funcional del control de activos, no el núcleo del sistema.

| Campo | Tipo | Descripción |
| :---- | :---- | :---- |
| **id** | UUID | Identificador único del pedido. |
| **machineId** | UUID FK | Activo al que está vinculado el pedido. |
| **createdBy** | UUID FK | Usuario que generó el pedido. |
| **status** | ENUM | Estado: PENDING, CONFIRMED, IN\_DELIVERY, DELIVERED, CANCELLED. |
| **items** | JSONB | Array de líneas del pedido: \[{productId, productName, quantity, unitPrice}\]. |
| **totalAmount** | DECIMAL(12,2) | Monto total del pedido calculado. |
| **deliveryConfirmedAt** | TIMESTAMPTZ | Timestamp de confirmación de entrega con firma digital. |

## **7.8 Entidad: SyncQueue**

Entidad exclusiva del dispositivo móvil que gestiona los eventos pendientes de sincronización cuando opera en modo offline. Es la base de la arquitectura offline-first y su diseño es crítico para garantizar que ningún evento se pierda.

| Campo | Tipo | Descripción |
| :---- | :---- | :---- |
| **id** | UUID | Identificador local del evento pendiente. |
| **eventType** | ENUM | Tipo de evento: VISIT\_CHECKIN, VISIT\_CHECKOUT, TICKET\_CREATE, ORDER\_CREATE, MEDIA\_UPLOAD. |
| **payload** | JSON | Datos completos del evento serializado, listos para enviar al endpoint correspondiente. |
| **createdLocallyAt** | TIMESTAMP | Timestamp local del dispositivo en el momento de captura del evento. |
| **status** | ENUM | Estado: PENDING, PROCESSING, SYNCED, FAILED. |
| **retryCount** | INTEGER | Número de intentos de sincronización fallidos. Máximo configurable. |
| **lastAttemptAt** | TIMESTAMP | Timestamp del último intento de sincronización. |
| **errorMessage** | TEXT | Mensaje de error del último intento fallido. Para debugging y soporte. |

##  

## **7.9 Entidad: MediaEvidence**

Gestiona la evidencia fotográfica vinculada a eventos. La foto en sí reside en Azure Blob Storage; esta entidad almacena únicamente los metadatos y la URL de acceso. Esto mantiene la base de datos eficiente y permite escalar el almacenamiento de forma independiente.

| Campo | Tipo | Descripción |
| :---- | :---- | :---- |
| **id** | UUID | Identificador único del archivo de evidencia. |
| **entityType** | ENUM | Entidad a la que pertenece: VISIT, TICKET, ORDER. |
| **entityId** | UUID | ID de la entidad asociada. |
| **blobUrl** | TEXT | URL de acceso al archivo en Azure Blob Storage. |
| **mimeType** | VARCHAR(50) | Tipo MIME del archivo (image/jpeg, image/png). |
| **fileSizeBytes** | INTEGER | Tamaño del archivo en bytes para control de cuotas. |
| **uploadedAt** | TIMESTAMPTZ | Timestamp de subida al Blob Storage. |

# **8\. Especificación de Endpoints REST**

Todos los endpoints son prefijados con /api/v1. Todas las rutas (excepto /auth/\*) requieren el header Authorization: Bearer {jwt\_token} y el header X-Tenant-ID: {tenant\_slug}. Las respuestas utilizan el formato JSON estándar.

## **8.1 Módulo de Autenticación (/auth)**

| Método | Endpoint | Ruta | Descripción |
| :---- | :---- | :---- | :---- |
| **POST** | Login | /auth/login | Autentica al usuario. Retorna access\_token JWT y refresh\_token. |
| **POST** | Refresh | /auth/refresh | Genera un nuevo access\_token a partir del refresh\_token válido. |
| **POST** | Logout | /auth/logout | Invalida el refresh\_token en Redis. Requiere autenticación. |

## 

## **8.2 Módulo de Activos (/machines)**

| Método | Rol mínimo | Ruta | Descripción |
| :---- | :---- | :---- | :---- |
| **GET** | SUPPORT | /machines | Lista paginada de activos del tenant. Filtros: status, locationId, inactiveSince. |
| **POST** | ADMIN | /machines | Crea un nuevo activo y lo registra en el sistema. |
| **GET** | VENDOR | /machines/:id | Retorna la ficha completa del activo: datos, estado, ubicación y última visita. |
| **PATCH** | ADMIN | /machines/:id | Actualiza campos del activo (estado, ubicación, modelo). |
| **GET** | VENDOR | /machines/:id/history | Retorna la línea de tiempo cronológica de todos los eventos del activo. |
| **POST** | VENDOR | /machines/scan | Identifica un activo por su nfcTagId y valida el UID del chip. Endpoint central del flujo NFC. |

## 

## **8.3 Módulo de Visitas (/visits)**

| Método | Rol mínimo | Ruta | Descripción |
| :---- | :---- | :---- | :---- |
| **POST** | VENDOR | /visits/checkin | Abre una nueva visita. Requiere machineId, nfcUid, latitude, longitude. |
| **PATCH** | VENDOR | /visits/:id/checkout | Cierra la visita activa. Registra GPS de salida y calcula duración. |
| **GET** | SUPPORT | /visits | Lista paginada de visitas. Filtros: userId, machineId, dateRange, visitType. |
| **GET** | VENDOR | /visits/:id | Detalle completo de una visita: eventos, GPS, evidencias adjuntas. |

## 

## **8.4 Módulo de Tickets (/tickets)**

| Método | Rol mínimo | Ruta | Descripción |
| :---- | :---- | :---- | :---- |
| **POST** | RETAILER | /tickets | Crea un ticket de soporte. Requiere escaneo NFC previo para vincular al activo. |
| **GET** | SUPPORT | /tickets | Lista paginada de tickets. Filtros: status, priority, assignedTo, machineId. |
| **GET** | TECHNICIAN | /tickets/:id | Detalle del ticket con historial de intervenciones. |
| **PATCH** | SUPPORT | /tickets/:id/assign | Asigna el ticket a un técnico. Cambia estado a ASSIGNED. |
| **PATCH** | TECHNICIAN | /tickets/:id/resolve | Cierra el ticket con checklist completado y evidencia fotográfica. |

## **8.5 Módulo de Sincronización (/sync)**

| Método | Rol mínimo | Ruta | Descripción |
| :---- | :---- | :---- | :---- |
| **POST** | VENDOR | /sync/batch | Recibe un array de eventos offline. Procesa en orden de createdLocallyAt. Retorna resultado por evento. |
| **GET** | VENDOR | /sync/status | Retorna el estado de sincronización del dispositivo: eventos pendientes, último sync exitoso. |

## **8.6 Módulo de Media (/media)**

| Método | Rol mínimo | Ruta | Descripción |
| :---- | :---- | :---- | :---- |
| **POST** | VENDOR | /media/presigned-url | Genera una URL pre-firmada de Azure Blob Storage. El cliente sube directamente a Blob sin pasar por el backend. |
| **POST** | VENDOR | /media/confirm | Confirma al backend que la subida fue exitosa y registra los metadatos en MediaEvidence. |

# **9\. Contratos DTO , Transferencia de Datos**

Los DTOs (Data Transfer Objects) definen los contratos de entrada y salida de la API. Son validados automáticamente por NestJS mediante class-validator. Se documenta el DTO de los endpoints más críticos del sistema.

## **9.1 LoginDto , POST /auth/login**

// REQUEST  
{  
  "email": "juan.perez@empresa.cl",    // string, required, isEmail  
  "password": "Cl4v3Segura\!",          // string, required, minLength(8)  
  "deviceId": "device\_abc123"          // string, required , identifica el dispositivo móvil  
}

// RESPONSE 200 OK  
{  
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",  
  "refreshToken": "d3f8a1b2c4...",  
  "user": {  
    "id": "uuid-user",  
    "fullName": "Juan Pérez",  
    "role": "VENDOR",  
    "tenantId": "uuid-tenant"  
  }  
}

## **9.2 ScanMachineDto , POST /machines/scan**

Este es el endpoint más crítico del sistema. Cada operación en terreno comienza con este escaneo.

// REQUEST  
{  
  "nfcTagId": "MACH-2024-00247",     // string, required , campo sid del payload NDEF  
  "nfcUid": "04:A3:B2:C1:D0:E9:F8",  // string, required , UID inmutable del chip  
  "latitude": \-33.4567,               // number, required, min(-90), max(90)  
  "longitude": \-70.6543,              // number, required, min(-180), max(180)  
  "gpsAccuracy": 8.5,                 // number, optional , precisión en metros  
  "scannedAt": "2026-03-15T14:30:00Z" // ISO8601, required , timestamp del dispositivo  
}

// RESPONSE 200 OK  
{  
  "machine": {  
    "id": "uuid-machine",  
    "serialNumber": "FRZ-2024-00247",  
    "model": "Vitrina Congeladora VX-500",  
    "status": "ACTIVE",  
    "location": { "name": "Minimarket El Sol", "address": "Av. Principal 1234" }  
  },  
  "validation": {  
    "nfcValid": true,  
    "gpsValid": true,  
    "gpsDistanceMeters": 23.4  
  },  
  "lastVisit": { "visitedAt": "2026-03-10T09:15:00Z", "visitType": "TECHNICAL" }  
}

## 

## 

## **9.3 CheckInDto , POST /visits/checkin**

// REQUEST  
{  
  "machineId": "uuid-machine",         // uuid, required  
  "nfcUid": "04:A3:B2:C1:D0:E9:F8",   // string, required  
  "visitType": "COMMERCIAL",            // enum: COMMERCIAL | TECHNICAL | DELIVERY | PICKUP  
  "latitude": \-33.4567,  
  "longitude": \-70.6543,  
  "checkInAt": "2026-03-15T14:30:00Z"  // timestamp local del dispositivo  
}

// RESPONSE 201 CREATED  
{  
  "visitId": "uuid-visit",  
  "status": "OPEN",  
  "checkInAt": "2026-03-15T14:30:00Z",  
  "gpsValidated": true  
}

## **9.4 CreateTicketDto , POST /tickets**

// REQUEST  
{  
  "machineId": "uuid-machine",          // uuid, required  
  "nfcUid": "04:A3:B2:C1:D0:E9:F8",    // string, required , obliga presencia física  
  "faultType": "REFRIGERATION",          // enum: REFRIGERATION|ELECTRICAL|STRUCTURAL|DISPLAY|OTHER  
  "description": "El compresor hace ruido excesivo y la temperatura...",  
  "priority": "HIGH",                    // enum: LOW|MEDIUM|HIGH|CRITICAL  
  "latitude": \-33.4567,  
  "longitude": \-70.6543  
}

// RESPONSE 201 CREATED  
{  
  "ticketId": "uuid-ticket",  
  "status": "OPEN",  
  "priority": "HIGH",  
  "createdAt": "2026-03-15T14:35:00Z",  
  "machine": { "serialNumber": "FRZ-2024-00247", "model": "Vitrina VX-500" }  
}

## **9.5 SyncBatchDto , POST /sync/batch**

// REQUEST  
{  
  "deviceId": "device\_abc123",  
  "events": \[  
    {  
      "localId": "local-uuid-1",  
      "eventType": "VISIT\_CHECKIN",  
      "createdLocallyAt": "2026-03-15T09:00:00Z",  
      "payload": { "machineId": "uuid-m", "nfcUid": "04:...", "visitType": "COMMERCIAL", ... }  
    },  
    {  
      "localId": "local-uuid-2",  
      "eventType": "TICKET\_CREATE",  
      "createdLocallyAt": "2026-03-15T09:45:00Z",  
      "payload": { "machineId": "uuid-m", "faultType": "ELECTRICAL", ... }  
    }  
  \]  
}

// RESPONSE 200 OK  
{  
  "results": \[  
    { "localId": "local-uuid-1", "status": "SYNCED", "serverId": "uuid-visit" },  
    { "localId": "local-uuid-2", "status": "SYNCED", "serverId": "uuid-ticket" }  
  \],  
  "syncedAt": "2026-03-15T14:50:00Z"  
}

# **10\. Arquitectura Offline-First y Políticas de Sincronización**

## **10.1 Fundamento de la Decisión Offline-First**

La decisión de diseñar la aplicación móvil como offline-first no es una optimización opcional: es un requisito fundamental dictado por las condiciones reales de operación.           Los activos refrigerados se encuentran en distintos tipos de locales, muchos de ellos con conectividad deficiente o nula: cámaras de frío con paredes de concreto, sótanos de supermercados, o localidades rurales con cobertura LTE intermitente. Un sistema que dependa de conectividad constante detendrá las operaciones en estos escenarios, que no son excepcionales sino habituales.

La arquitectura offline-first invierte el paradigma: en lugar de intentar la operación en línea y fallar cuando no hay red, el sistema opera siempre localmente y sincroniza en segundo plano cuando hay red disponible. El usuario en terreno nunca espera una respuesta de red para completar una operación.

## **10.2 Almacenamiento Local en el Dispositivo**

La aplicación móvil Flutter utiliza dos mecanismos de almacenamiento local complementarios:

* **Core Data / Room (SQLite):** base de datos estructurada local para almacenar eventos pendientes de sincronización (SyncQueue), caché de datos de activos consultados recientemente y sesión de usuario. En iOS se implementa con SQLite vía sqflite; en Android, con la capa de abstracción equivalente.

* **FileManager / MediaStore:** sistema de archivos nativo del dispositivo para almacenar temporalmente las fotografías de evidencia capturadas offline, en espera de su subida a Azure Blob Storage al recuperar la conectividad.

## **10.3 Cola de Sincronización: Flujo Detallado**

El flujo de sincronización offline sigue estos pasos de forma determinista:

26. El usuario realiza una operación en terreno (check-in, create ticket, etc.) sin conectividad.

27. La app genera el objeto del evento con todos los campos necesarios y un UUID local único (localId).

28. El evento se persiste inmediatamente en la tabla SyncQueue local con estado PENDING y el timestamp del dispositivo (createdLocallyAt).

29. La operación se confirma visualmente al usuario: el sistema no espera respuesta del servidor.

30. El Background Sync Service monitorea continuamente el estado de conectividad del dispositivo (LTE/WiFi) mediante la API de conectividad del sistema operativo.

31. Al detectar red disponible, el servicio construye un batch de todos los eventos PENDING ordenados por createdLocallyAt ascendente y los envía al endpoint POST /sync/batch.

32. El backend procesa los eventos en orden, los persiste y retorna el resultado por evento.

33. Para cada evento con status SYNCED, la app actualiza la SyncQueue local a SYNCED y limpia los archivos temporales asociados.

34. Para eventos con status FAILED, se aplica la política de retry descrita a continuación.

## **10.4 Política de Retry**

La política de retry está diseñada para ser resiliente ante fallos de red transitorios sin saturar el servidor en escenarios de reconexión masiva (ej. múltiples dispositivos conectando simultáneamente).

| Intento | Espera | Descripción |
| :---- | :---- | :---- |
| 1er reintento | 30 segundos | Primer reintento inmediato tras el fallo inicial. |
| 2do reintento | 2 minutos | Backoff exponencial comienza. |
| 3er reintento | 10 minutos | El dispositivo asume fallo de red sostenido. |
| 4to reintento | 30 minutos | Evento marcado como FAILED temporalmente. |
| 5to reintento | 2 horas | Último intento automático. |
| Sin resolución | , | Después de 5 intentos fallidos, el evento queda en estado FAILED con retryCount=5 y requiere revisión manual desde el panel de soporte. |

La política de backoff exponencial con jitter (variación aleatoria entre dispositivos) previene el problema de 'thundering herd': si 100 dispositivos pierden y recuperan conectividad al mismo tiempo, los intentos de sincronización no llegan todos al servidor en el mismo segundo.

## **10.5 Resolución de Conflictos**

El servidor es la única fuente de verdad. En caso de conflicto entre un evento local y el estado actual del servidor (por ejemplo, un check-in llega al servidor cuando ya existe un check-out posterior), el backend aplica las siguientes reglas:

* **Orden temporal:** los eventos se procesan en orden de createdLocallyAt. Un evento cuyo timestamp sea anterior a un estado ya existente en el servidor se procesa como evento histórico válido.

* **Idempotencia por localId:** si el mismo localId se envía dos veces (por retry), el servidor detecta el duplicado y retorna el resultado original sin crear una segunda entrada.

* **Eventos incompatibles:** si un evento no puede procesarse por conflicto irresolvable (ej. check-in sobre un activo que fue dado de baja entre tanto), el backend retorna status FAILED con un código de error específico y el soporte puede revisar el caso desde el panel.

# **11\. Seguridad del Sistema**

## **11.1 Autenticación y Autorización**

La autenticación se implementa mediante JWT (JSON Web Tokens) con acceso de corta duración (15 minutos) y refresh tokens de larga duración (7 días). Los refresh tokens se almacenan en Redis con invalidación explícita en logout, lo que permite revocar sesiones activas de forma inmediata en caso de compromiso.

La autorización se implementa mediante RBAC (Role-Based Access Control) centralizado en el backend. Los roles son: VENDOR, TECHNICIAN, DRIVER, RETAILER, SUPPORT y ADMIN. Ningún cliente tiene autoridad sobre los permisos: el JWT es verificado en cada request y los permisos del rol se comprueban en el servidor antes de ejecutar cualquier operación.

## **11.2 Multi-tenant y Aislamiento de Datos**

El TenantGuard es un interceptor de NestJS que se ejecuta antes de cada handler de ruta autenticado. Extrae el tenantId del JWT, valida que el tenant esté activo, y lo inyecta en el contexto de cada request. Cada query a la base de datos incluye tenantId como condición WHERE, garantizando que una operación de un usuario de Tenant A no pueda acceder a datos de Tenant B, incluso si conoce el UUID de un recurso.

## **11.3 Validación de NFC Anti-fraude**

La validación anti-fraude del NFC se realiza en el backend mediante tres capas:

* **Validación de UID:** el UID del chip NFC, que es inmutable y único por fabricación, se registra durante el enrolamiento del activo. En cada escaneo, el backend compara el UID reportado con el registrado para ese activo. Un tag clonado con diferente UID es rechazado.

* **Validación de GPS:** el backend verifica que las coordenadas GPS del dispositivo en el momento del escaneo estén dentro de un radio de tolerancia (configurable por tenant, default: 100 metros) del punto de venta registrado. Escaneos desde fuera del radio generan isGpsValid: false y una alerta para el equipo de soporte.

* **Detección de anomalías de velocidad:** el backend detecta si el mismo usuario realizó escaneos en dos ubicaciones físicamente imposibles de alcanzar en el tiempo transcurrido entre ambos (ej. Santiago y Valparaíso en 2 minutos), generando una alerta de seguridad.

## 

## **11.4 Comunicación Cifrada**

Toda comunicación entre clientes y el backend se realiza exclusivamente por HTTPS con TLS 1.2 mínimo. Los certificados son gestionados por Azure App Service con renovación automática. Las URLs de evidencia fotográfica en Azure Blob son generadas como SAS tokens con espiración de 1 hora, limitando el acceso no autorizado a las imágenes incluso si la URL es compartida.

# **12\. Escalabilidad e Infraestructura**

## **12.1 Estrategia de Escalamiento**

El sistema está diseñado para escalar horizontalmente desde el primer día sin requerir cambios de arquitectura. El backend NestJS es stateless: no almacena estado de sesión en memoria (las sesiones están en Redis), por lo que múltiples instancias pueden ejecutarse en paralelo detrás de un load balancer sin coordinación entre ellas.

BullMQ delega el procesamiento pesado (subida de fotos, jobs de sincronización, generación de reportes) a workers en segundo plano, desacoplando las operaciones de alta latencia del ciclo de request-response de la API. Esto garantiza que un pico de cargas de fotos no degrade el tiempo de respuesta de los endpoints críticos como /machines/scan.

## **12.2 Infraestructura Azure**

El despliegue se realiza sobre Azure con los siguientes servicios:

* **Azure Container Instances / AKS:** los contenedores Docker del backend y los workers BullMQ se despliegan con escalamiento automático basado en métricas de CPU y longitud de la cola.

* **Azure Database for PostgreSQL:** instancia gestionada con backups automáticos diarios, réplica de lectura para queries de reporting y alta disponibilidad con failover automático.

* **Azure Cache for Redis:** instancia gestionada para sesiones JWT, caché de datos frecuentes y cola BullMQ.

* **Azure Blob Storage:** almacenamiento de evidencia fotográfica con redundancia geográfica (GRS). Las fotos de un activo son inmutables una vez subidas.

* **Azure DevOps \+ App Insights:** CI/CD con pipelines de despliegue automático y monitoreo de performance, trazas de error y alertas de disponibilidad en producción.

# **13\. Requisitos Funcionales y No Funcionales**

## **13.1 Requisitos Funcionales Completos**

| ID | Requisito |
| :---- | :---- |
| **RF-01** | El sistema debe permitir registrar activos (máquinas congeladoras) con identificador, modelo, ubicación, fecha de instalación y empresa propietaria. |
| **RF-02** | El sistema debe asociar cada activo a un tag NFC único mediante registro del UID del chip en la base de datos. |
| **RF-03** | El sistema debe validar el UID del chip NFC en cada escaneo contra el UID registrado en la base de datos. |
| **RF-04** | El sistema debe registrar la geolocalización GPS del dispositivo en cada escaneo NFC. |
| **RF-05** | El sistema debe exigir doble escaneo NFC (check-in y check-out) para las visitas técnicas. |
| **RF-06** | El sistema debe permitir operación completamente offline en la app móvil, sin pérdida de datos. |
| **RF-07** | El sistema debe sincronizar automáticamente los eventos offline al recuperar la conectividad. |
| **RF-08** | El sistema debe registrar tickets de soporte obligatoriamente vinculados a un escaneo NFC. |
| **RF-09** | El sistema debe permitir adjuntar evidencia fotográfica a visitas, tickets e intervenciones. |
| **RF-10** | El sistema debe mantener una línea de tiempo cronológica de todos los eventos por activo. |
| **RF-11** | El sistema debe proveer un dashboard con métricas de activos activos/inactivos, tiempo de respuesta y productividad por actor. |
| **RF-12** | El sistema debe soportar múltiples empresas (multi-tenant) con aislamiento total de datos. |
| **RF-13** | El sistema debe restringir el acceso a funcionalidades según el rol del usuario. |
| **RF-14** | El sistema debe permitir registrar pedidos vinculados al activo escaneado. |
| **RF-15** | El sistema debe detectar y alertar sobre activos sin actividad por períodos configurables. |

## **13.2 Requisitos No Funcionales Completos**

| ID | Categoría | Requisito |
| :---- | :---- | :---- |
| **RNF-01** | Seguridad | Autenticación mediante JWT con refresh tokens. Access token con expiración de 15 minutos. |
| **RNF-02** | Seguridad | Autorización centralizada en backend mediante RBAC. El cliente no tiene autoridad sobre sus propios permisos. |
| **RNF-03** | Seguridad | Comunicación exclusivamente HTTPS con TLS 1.2 mínimo. |
| **RNF-04** | Rendimiento | Tiempo de respuesta de la API \< 500 ms en el percentil 95 bajo carga normal. |
| **RNF-05** | Rendimiento | Validación de escaneo NFC completada en menos de 1 segundo. |
| **RNF-06** | Disponibilidad | Disponibilidad mínima de 99.5% anual del servicio backend. |
| **RNF-07** | Disponibilidad | Recuperación ante fallos críticos en un tiempo máximo de 2 horas (RTO). |
| **RNF-08** | Disponibilidad | Backups automáticos diarios de la base de datos con retención de 30 días. |
| **RNF-09** | Escalabilidad | El backend debe escalar horizontalmente mediante contenedores Docker sin cambios de arquitectura. |
| **RNF-10** | Escalabilidad | El sistema debe soportar al menos 100.000 activos registrados y miles de eventos diarios. |
| **RNF-11** | Usabilidad | La app móvil debe permitir registrar operaciones en menos de 3 pasos. Botones usables con una mano. |
| **RNF-12** | Compatibilidad | Compatible con Android 10+ e iOS 15+. Requiere NFC nativo en el dispositivo. |
| **RNF-13** | Mantenibilidad | Arquitectura modular en backend. Documentación de API, arquitectura y despliegue. |
| **RNF-14** | Observabilidad | Monitoreo de CPU, memoria y tráfico. Registro de logs de errores para diagnóstico. |

# 

# **14\. Riesgos Técnicos y Estrategias de Mitigación**

| Riesgo | Severidad | Estrategia de Mitigación |
| :---- | :---- | :---- |
| Inconsistencias de datos en modo offline | **Alta** | Política de retry con backoff exponencial. Idempotencia por localId. Servidor como única fuente de verdad. |
| Clonación de tags NFC | **Alta** | Validación de UID inmutable en backend. Detección de anomalías de velocidad GPS. Bloqueo de escritura en chip. |
| Degradación de rendimiento por volumen de fotos | **Media** | Subida directa a Azure Blob desde el cliente (URL pre-firmada). BullMQ para procesamiento asíncrono. |
| Diferencias de experiencia UX entre plataformas móviles | **Media** | Flutter garantiza renderizado consistente con motor propio. Design system unificado con Angular Material. |
| Adopción insuficiente por parte del personal en terreno | **Alta** | Diseño UX optimizado para operación en terreno. Modo offline elimina fricción por conectividad. Protocolo de contingencia para fallas de tag. |
| Pérdida de eventos offline por borrado del dispositivo | **Media** | Sincronización frecuente (cada vez que hay red). Alertas al usuario cuando hay eventos pendientes. |

# 

# **15\. Conclusiones**

El sistema FrioCheck representa una solución técnicamente sólida y operativamente justificada para el problema de gestión y trazabilidad de activos refrigerados en terreno. Cada decisión tecnológica documentada en este informe responde a un requisito concreto del dominio de negocio, no a preferencias arbitrarias.

La adopción de NFC sobre QR elimina las visitas fantasma con un costo marginal por activo de aproximadamente $340 CLP. La arquitectura offline-first garantiza que las operaciones en terreno no dependan de una conectividad que no siempre existe. La centralización de la lógica en el backend y el modelo multi-tenant proveen la base para escalar la plataforma a múltiples clientes empresariales. Y el historial inmutable por activo crea la fuente de verdad que la operación necesitaba.

El siguiente paso natural es la implementación iterativa por módulos, iniciando por el núcleo de validación presencial (NFC \+ Visits) y expandiendo hacia los módulos de Tickets, Orders y Analytics en fases sucesivas, validando cada entrega con usuarios reales en terreno.

Modifica la topbar debe funcionar como un centro de mando dinámico que se adapta al contexto de cada sección, permitiendo una navegación fluida sin recargas. En el extremo izquierdo, un buscador global actúa como puerta de entrada para localizar activos por código NFC, tickets por número de incidencia o clientes por nombre. A su lado, se despliega una cadena de selectores geográficos jerarquizados que permiten filtrar desde la región hasta la comuna, facilitando la detección de problemas específicos en sectores determinados de la ciudad.

Para garantizar la operatividad, la barra incluye filtros de estado con una codificación visual inmediata. En la vista de activos, este selector permite aislar equipos inactivos o en alerta por falta de comunicación, mientras que en la vista de tickets, el filtro se transforma en un selector de prioridad para identificar urgencias críticas en el sistema de refrigeración. Un filtro por rol de usuario complementa esta estructura en la sección de visitas, permitiendo diferenciar entre el cumplimiento de los técnicos, el despliegue de los vendedores y la efectividad del reparto.

El diseño se mantiene compacto y anclado en la parte superior, incorporando un selector de rango de fechas para el análisis de tendencias y un botón de limpieza rápida para restablecer los parámetros. La distribución lógica vincula cada filtro a una necesidad específica: la segmentación geográfica y el buscador son transversales a todo el sistema, mientras que los estados de alerta y prioridades se activan según se navegue por el inventario o la gestión de incidencias. Este esquema asegura que la información sea siempre accionable y que el soporte pueda validar la presencialidad en terreno con solo un par de clics.

