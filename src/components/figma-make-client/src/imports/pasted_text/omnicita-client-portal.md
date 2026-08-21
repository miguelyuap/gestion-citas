Diseña una aplicación web moderna, profesional y responsive para el **portal del cliente final de una plataforma SaaS de gestión y agendamiento de citas llamada OmniCitas**.

El producto es **multi-tenant**, por lo que esta interfaz representa la página pública y privada de un negocio específico que utiliza OmniCitas. El diseño debe estar preparado conceptualmente para que cada negocio pueda personalizar su identidad visual: logotipo, colores, tipografía, imágenes, textos y elementos de marca.

La aplicación será implementada posteriormente utilizando:

* Next.js 16
* App Router
* React 19
* TypeScript
* Tailwind CSS
* Supabase para autenticación y base de datos
* Lucide React para iconografía

No diseñes una interfaz administrativa. Esta experiencia corresponde exclusivamente al **cliente final que desea conocer el negocio, registrarse/iniciar sesión y gestionar sus citas**.

---

# 1. OBJETIVO GENERAL

Crear una experiencia moderna de agendamiento de citas que sea:

* Profesional
* Minimalista
* Moderna
* Intuitiva
* Fácil de utilizar desde celular
* Responsive para desktop, tablet y mobile
* Visualmente atractiva
* Accesible
* Orientada a conversión
* Fácil de implementar posteriormente en Next.js

El usuario debe poder entrar al sitio de un negocio, conocer sus servicios, registrarse o iniciar sesión, agendar una cita y posteriormente administrar sus citas y perfil.

La experiencia debe sentirse como una combinación entre una plataforma SaaS moderna y una página web personalizada de cada negocio.

---

# 2. CONCEPTO MULTI-TENANT

Ten siempre presente que OmniCitas es una plataforma **multi-tenant**.

La interfaz que diseñes debe funcionar como una plantilla reutilizable para diferentes negocios.

Por ejemplo, un tenant podría ser:

"Studio Beauty"

Pero el mismo diseño podría utilizarse para:

* Barberías
* Salones de belleza
* Consultorios
* Clínicas
* Spas
* Centros odontológicos
* Psicólogos
* Veterinarias
* Profesionales independientes
* Otros negocios que trabajen mediante citas

Por lo tanto:

* No acoples visualmente el diseño a un único negocio.
* Utiliza información de ejemplo fácilmente reemplazable.
* Diseña componentes reutilizables.
* La identidad visual debe poder cambiarse dinámicamente.
* El logotipo debe ser configurable.
* Los colores principales y secundarios deben ser configurables.
* La tipografía debe poder cambiarse.
* Las imágenes del negocio deben ser configurables.
* Los textos de bienvenida deben ser configurables.
* Los servicios deben ser dinámicos.
* Los especialistas deben ser dinámicos.

La estructura visual debe mantenerse aunque cambie completamente la identidad del tenant.

---

# 3. ESTRUCTURA PRINCIPAL DE LA APLICACIÓN

La aplicación debe tener las siguientes secciones principales:

1. Inicio
2. Agendar cita
3. Mis citas
4. Mi perfil
5. Notificaciones

También debe incluir:

6. Login
7. Registro
8. Recuperación de contraseña

En desktop, utiliza una navegación clara y elegante.

En mobile, utiliza una navegación inferior tipo Bottom Navigation con:

* Inicio
* Agendar
* Mis citas
* Notificaciones
* Perfil

El estado activo debe ser claramente identificable.

---

# 4. PANTALLA DE INICIO

Diseña una página de inicio moderna y visualmente atractiva.

Debe incluir:

## Header

Mostrar:

* Logo del negocio
* Nombre del negocio
* Navegación principal
* Botón "Agendar cita"
* Icono de notificaciones
* Avatar del usuario cuando haya sesión iniciada

En mobile:

* Logo
* Nombre o logotipo
* Icono de notificaciones
* Menú o navegación inferior

---

## Hero

Crear una sección principal de alto impacto.

Debe contener:

* Imagen principal configurable
* Badge o pequeño mensaje destacado
* Título principal configurable
* Subtítulo
* Botón principal "Agendar cita"
* Botón secundario opcional "Conocer servicios"

Ejemplo:

"Reserva tu próxima cita de forma fácil"

"Elige tu servicio, especialista y horario en pocos pasos."

El diseño debe utilizar una composición moderna, con imagen grande, bordes redondeados y excelente jerarquía visual.

---

# 5. SECCIÓN DE SERVICIOS

Mostrar los servicios disponibles del negocio.

Cada servicio debe aparecer como una card que incluya:

* Imagen o icono
* Nombre
* Descripción corta
* Duración
* Precio
* Botón "Agendar"

Ejemplo:

Corte de cabello
45 min
$35.000

Diseñar las cards de forma reutilizable.

Agregar estados hover.

En mobile, utilizar cards optimizadas para pantallas pequeñas.

---

# 6. SECCIÓN DE ESPECIALISTAS

Mostrar los profesionales disponibles.

Cada especialista debe tener:

* Fotografía
* Nombre
* Especialidad
* Breve descripción
* Servicios asociados
* Botón "Agendar con este especialista"

Ejemplo:

"Laura Martínez"
"Especialista en coloración"

La selección de especialista debe integrarse posteriormente con el flujo de agendamiento.

---

# 7. SECCIÓN "¿CÓMO FUNCIONA?"

Crear una sección sencilla de tres o cuatro pasos:

1. Elige tu servicio
2. Selecciona especialista
3. Elige fecha y hora
4. Confirma tu cita

Utilizar iconos modernos y una composición visual clara.

---

# 8. TESTIMONIOS

Agregar una sección de testimonios de clientes.

Cada testimonio debe mostrar:

* Avatar
* Nombre
* Calificación mediante estrellas
* Comentario

Crear un diseño elegante tipo carousel en mobile.

---

# 9. INFORMACIÓN DEL NEGOCIO

Agregar una sección con:

* Dirección
* Horarios de atención
* Teléfono
* Correo electrónico
* Redes sociales
* Mapa o placeholder de ubicación

Esta información debe considerarse configurable por tenant.

---

# 10. FOOTER

Crear un footer profesional con:

* Logo
* Nombre del negocio
* Información de contacto
* Enlaces
* Redes sociales
* Política de privacidad
* Términos y condiciones
* Copyright

---

# 11. FLUJO DE AGENDAMIENTO

Esta es una de las partes más importantes de la aplicación.

Crear una experiencia de agendamiento clara y sencilla.

El flujo debe ser:

### Paso 1 — Seleccionar servicio

Mostrar los servicios disponibles.

Cada servicio debe indicar:

* Nombre
* Duración
* Precio
* Descripción

Permitir seleccionar un servicio.

---

### Paso 2 — Seleccionar especialista

Mostrar los especialistas disponibles para el servicio seleccionado.

Cada especialista debe mostrar:

* Foto
* Nombre
* Especialidad

Permitir seleccionar uno.

---

### Paso 3 — Seleccionar fecha

Mostrar un calendario moderno.

Los días que no tengan disponibilidad deben aparecer:

* Deshabilitados
* Con color gris
* Sin posibilidad de selección

Los días disponibles deben destacarse visualmente.

---

### Paso 4 — Seleccionar hora

Después de seleccionar una fecha, mostrar los horarios disponibles.

Organizar los horarios en botones o cards.

Ejemplo:

09:00 AM
09:30 AM
10:00 AM
10:30 AM
11:00 AM

Los horarios ocupados deben aparecer deshabilitados.

---

### Paso 5 — Confirmación

Mostrar un resumen de la cita:

Servicio
Especialista
Fecha
Hora
Duración
Precio

Agregar botón:

"Confirmar cita"

---

### Paso 6 — Cita confirmada

Mostrar una pantalla de confirmación visual.

Ejemplo:

"¡Tu cita ha sido agendada!"

Mostrar:

* Servicio
* Especialista
* Fecha
* Hora
* Ubicación
* Código o identificador de la cita

Botones:

"Ver mis citas"

"Volver al inicio"

---

# 12. LOGIN

Diseñar una pantalla moderna de inicio de sesión.

Campos:

* Correo electrónico
* Contraseña

Acciones:

* Iniciar sesión
* ¿Olvidaste tu contraseña?
* Crear una cuenta

Agregar opciones de autenticación social únicamente como elemento visual opcional si resulta conveniente.

El diseño debe ser limpio y evitar exceso de elementos.

---

# 13. REGISTRO

Diseñar una pantalla de registro.

Campos:

* Nombre
* Apellido
* Correo electrónico
* Teléfono
* Contraseña
* Confirmar contraseña

Agregar:

* Checkbox de términos y condiciones
* Botón "Crear cuenta"

Mostrar una indicación visual sobre la seguridad de los datos.

---

# 14. RECUPERACIÓN DE CONTRASEÑA

Diseñar una pantalla para recuperar contraseña.

Debe incluir:

* Correo electrónico
* Botón "Enviar enlace"
* Opción para volver al login

También diseñar el estado posterior:

"Revisa tu correo"

---

# 15. MIS CITAS

Crear una sección donde el usuario pueda consultar todas sus citas.

Organizar las citas en:

### Próximas

Mostrar cards con:

* Servicio
* Especialista
* Fecha
* Hora
* Estado
* Precio

Estados:

* Confirmada
* Pendiente
* Cancelada
* Completada

Las citas próximas deben tener acciones como:

* Ver detalle
* Reprogramar
* Cancelar

---

## Detalle de cita

Diseñar una pantalla/modal de detalle.

Mostrar:

* Servicio
* Especialista
* Fecha
* Hora
* Duración
* Precio
* Ubicación
* Estado

Agregar:

"Reprogramar cita"

"Cancelar cita"

---

# 16. MI PERFIL

Diseñar una sección de perfil moderna.

Mostrar:

* Avatar
* Nombre
* Apellido
* Correo
* Teléfono

Permitir editar:

* Información personal
* Teléfono
* Foto de perfil
* Contraseña

Agregar sección:

"Preferencias"

Con opciones como:

* Recibir notificaciones
* Recordatorios de citas
* Comunicaciones del negocio

---

# 17. NOTIFICACIONES

Crear una sección dedicada a las notificaciones.

Ejemplos:

"Tu cita ha sido confirmada."

"Recuerda que tienes una cita mañana a las 10:00 AM."

"Tu cita fue cancelada."

"Tu cita ha sido reprogramada."

Cada notificación debe incluir:

* Icono
* Título
* Descripción
* Fecha/hora
* Estado leído/no leído

Las notificaciones no leídas deben diferenciarse visualmente.

Agregar opción:

"Marcar todas como leídas"

---

# 18. ESTADOS DE LA INTERFAZ

Diseñar también los principales estados de la aplicación:

* Loading
* Skeleton loading
* Empty state
* Error state
* Success state
* No hay citas
* No hay notificaciones
* No hay horarios disponibles
* Servicio no disponible
* Especialista no disponible

Por ejemplo, para "Mis citas" sin información:

"¿Todavía no tienes citas?"

"Agenda tu primera cita y comienza a disfrutar nuestros servicios."

Botón:

"Agendar cita"

---

# 19. RESPONSIVE DESIGN

El diseño debe ser completamente responsive.

Crear diseños para:

### Desktop

* 1440px
* 1280px

### Tablet

* 768px

### Mobile

* 390px
* 375px

La experiencia mobile es especialmente importante.

En mobile:

* Utilizar navegación inferior.
* Cards adaptadas al ancho.
* Botones grandes y fáciles de pulsar.
* Formularios optimizados.
* Calendario usable con una sola mano.
* Evitar elementos demasiado pequeños.

---

# 20. SISTEMA DE DISEÑO

Crear un sistema visual consistente.

Utilizar:

* Bordes redondeados modernos
* Sombras sutiles
* Espaciado consistente
* Tipografía moderna
* Iconografía consistente
* Estados hover
* Estados active
* Estados disabled
* Estados focus

La interfaz debe sentirse similar a productos SaaS modernos como:

* Stripe
* Linear
* Notion
* Calendly
* Airbnb

Pero NO copiar directamente sus diseños.

Crear una identidad visual propia para OmniCitas.

---

# 21. PERSONALIZACIÓN POR TENANT

Diseñar los componentes de manera que puedan recibir dinámicamente:

* primaryColor
* secondaryColor
* accentColor
* logo
* favicon
* fontFamily
* heroImage
* heroTitle
* heroSubtitle
* heroBadge
* heroCtaText

La interfaz debe poder cambiar de identidad visual sin modificar la estructura de los componentes.

Por ejemplo, mostrar una variante visual usando una paleta:

Primary: azul/púrpura
Secondary: blanco
Background: gris muy claro
Accent: violeta

Pero permitir que posteriormente el tenant cambie completamente estos colores.

---

# 22. COMPONENTES REUTILIZABLES

Diseñar pensando en una futura implementación con React/Next.js.

Crear componentes reutilizables como:

* Navbar
* BottomNavigation
* Button
* Input
* Select
* Modal
* Dialog
* Card
* ServiceCard
* SpecialistCard
* AppointmentCard
* NotificationItem
* Calendar
* TimeSlot
* Avatar
* Badge
* EmptyState
* LoadingState
* Toast
* Footer

Evitar diseños que dependan de elementos únicos difíciles de reutilizar.

---

# 23. UX DEL AGENDAMIENTO

La experiencia debe minimizar la cantidad de pasos y evitar confusión.

Utilizar un indicador de progreso:

1. Servicio
2. Especialista
3. Fecha
4. Hora
5. Confirmación

El usuario debe saber siempre en qué paso se encuentra.

Permitir regresar al paso anterior sin perder la información seleccionada.

El botón principal debe permanecer claramente visible.

---

# 24. ACCESIBILIDAD

Tener en cuenta:

* Contraste adecuado
* Estados focus
* Tamaños de fuente legibles
* Botones suficientemente grandes
* Labels claros
* Iconos acompañados de texto cuando sea necesario
* No depender únicamente del color para comunicar estados

---

# 25. RESULTADO ESPERADO

Crear un prototipo completo y navegable del portal del cliente.

No generar solamente una landing page.

Debe existir una experiencia completa que incluya:

Inicio
↓
Login / Registro
↓
Agendar cita
↓
Seleccionar servicio
↓
Seleccionar especialista
↓
Seleccionar fecha
↓
Seleccionar hora
↓
Confirmar cita
↓
Cita agendada
↓
Mis citas
↓
Detalle de cita
↓
Perfil
↓
Notificaciones

El resultado debe parecer un producto SaaS real listo para comenzar su implementación.

Prioriza una estética moderna, profesional, limpia y premium.

La interfaz debe transmitir confianza y facilidad de uso.

El diseño debe ser suficientemente flexible para convertirse en una plantilla multi-tenant donde cada negocio pueda personalizar su identidad sin romper la experiencia de usuario.

IMPORTANTE:

No crear un dashboard administrativo.

No utilizar tablas administrativas.

No sobrecargar la interfaz.

La prioridad es que un cliente final pueda entrar, entender el negocio, registrarse y agendar una cita de manera rápida y sencilla.
