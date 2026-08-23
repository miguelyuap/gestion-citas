Diseña una aplicación web SaaS multi-tenant profesional para gestión y agendamiento de citas, orientada principalmente a pequeñas y medianas empresas.

El producto debe ser moderno, intuitivo, escalable y comercialmente atractivo. La interfaz debe estar pensada para posteriormente ser implementada como una aplicación frontend en React utilizando componentes reutilizables.

## 1. OBJETIVO DEL PRODUCTO

La aplicación permite a una empresa administrar:

* Citas y agenda.
* Clientes.
* Profesionales o colaboradores.
* Servicios.
* Sucursales.
* Horarios de atención.
* Usuarios y roles.
* Reportes.
* Configuración de la empresa.
* Suscripción y licencia del SaaS.

Debe funcionar bajo un modelo multi-tenant, donde cada empresa tenga su propio espacio de trabajo y sus propios datos.

El diseño debe transmitir:

* Profesionalismo.
* Confianza.
* Simplicidad.
* Modernidad.
* Eficiencia.
* Escalabilidad.

Evita un diseño excesivamente complejo. La prioridad es que una persona pueda aprender a utilizar el sistema rápidamente.

---

# 2. ESTILO VISUAL

Crear una interfaz SaaS moderna inspirada en productos profesionales de gestión empresarial.

Características visuales:

* Diseño limpio y minimalista.
* Mucho espacio en blanco.
* Jerarquía visual clara.
* Bordes ligeramente redondeados.
* Sombras muy sutiles.
* Tipografía moderna y altamente legible.
* Iconografía consistente.
* Componentes visualmente uniformes.
* Diseño profesional pero amigable.
* Evitar exceso de colores.
* Utilizar un color primario configurable por tenant.
* Utilizar colores semánticos para estados: éxito, advertencia, error e información.
* Contraste suficiente para accesibilidad.

Utilizar una escala tipográfica consistente para:

* Títulos.
* Subtítulos.
* Texto normal.
* Texto secundario.
* Labels.
* Texto de ayuda.
* Badges.

---

# 3. ARQUITECTURA GENERAL

Crear una aplicación de escritorio responsive con la siguiente estructura:

SIDEBAR IZQUIERDA

* Logo de la empresa.
* Nombre de la empresa.
* Dashboard.
* Agenda.
* Clientes.
* Profesionales.
* Servicios.
* Sucursales.
* Reportes.
* Configuración.

Separar visualmente las opciones principales de las opciones administrativas.

En la parte inferior del sidebar:

* Ayuda.
* Información de suscripción.
* Perfil del usuario.
* Cerrar sesión.

TOPBAR

Debe incluir:

* Breadcrumb o nombre de la sección.
* Selector de sucursal cuando corresponda.
* Buscador global.
* Notificaciones.
* Avatar del usuario.
* Menú del usuario.

El sidebar debe poder:

* Expandirse.
* Contraerse.
* Mostrar tooltips cuando esté contraído.

---

# 4. MULTI-TENANT

Diseñar el sistema teniendo presente que diferentes empresas utilizarán la misma plataforma.

Cada tenant debe poder personalizar:

* Nombre de empresa.
* Logo.
* Color principal.
* Información de contacto.
* Sucursales.
* Horarios.
* Servicios.
* Profesionales.

El diseño debe permitir que el branding cambie sin romper la estructura visual.

Mostrar claramente el nombre de la empresa actualmente seleccionada.

Si existen múltiples sucursales, incluir un selector de sucursal.

---

# 5. LOGIN

Crear una pantalla de inicio de sesión profesional.

Debe contener:

* Logo.
* Nombre de la plataforma.
* Título "Iniciar sesión".
* Campo correo electrónico.
* Campo contraseña.
* Mostrar/ocultar contraseña.
* Recordarme.
* Enlace "¿Olvidaste tu contraseña?"
* Botón "Iniciar sesión".
* Mensaje de error para credenciales incorrectas.

Diseñar también:

* Recuperación de contraseña.
* Confirmación de recuperación.
* Restablecimiento de contraseña.

---

# 6. DASHBOARD

Crear un dashboard administrativo completo.

Debe incluir:

### KPI CARDS

* Citas de hoy.
* Citas pendientes.
* Clientes nuevos.
* Ingresos del período.

Cada tarjeta debe mostrar:

* Icono.
* Valor.
* Etiqueta.
* Comparación respecto al período anterior.
* Indicador positivo o negativo.

### GRÁFICO DE CITAS

Mostrar evolución de citas por día/semana/mes.

Permitir seleccionar:

* Hoy.
* Esta semana.
* Este mes.
* Personalizado.

### PRÓXIMAS CITAS

Mostrar una lista o tabla con:

* Hora.
* Cliente.
* Servicio.
* Profesional.
* Estado.
* Acciones.

### DISTRIBUCIÓN DE CITAS

Mostrar estadísticas por estado:

* Confirmadas.
* Pendientes.
* Canceladas.
* Completadas.

### ACCIONES RÁPIDAS

Incluir botones:

* Nueva cita.
* Nuevo cliente.
* Nuevo servicio.
* Nuevo profesional.

---

# 7. AGENDA

La agenda debe ser uno de los módulos principales de la aplicación.

Crear una experiencia visual similar a calendarios profesionales.

Permitir cambiar entre:

* Vista diaria.
* Vista semanal.
* Vista mensual.

Mostrar:

* Horas.
* Profesionales.
* Citas.
* Duración de las citas.
* Estado de cada cita.

Cada cita debe mostrar:

* Hora.
* Cliente.
* Servicio.
* Profesional.
* Estado.

Utilizar colores suaves para diferenciar estados.

Agregar botón destacado:

"Crear cita"

También incluir filtros:

* Profesional.
* Servicio.
* Sucursal.
* Estado.
* Fecha.

Permitir acciones sobre una cita:

* Ver detalles.
* Editar.
* Confirmar.
* Reprogramar.
* Cancelar.
* Marcar como completada.

Diseñar también estados visuales para:

* Horario disponible.
* Horario ocupado.
* Horario bloqueado.
* Día no laborable.

---

# 8. CREAR CITA

Diseñar un formulario/modal completo para crear una cita.

Campos:

* Cliente.
* Servicio.
* Profesional.
* Sucursal.
* Fecha.
* Hora.
* Duración.
* Observaciones.

Mostrar un resumen antes de confirmar.

Botones:

* Cancelar.
* Crear cita.

Mostrar validaciones de formulario.

Diseñar estados:

* Loading.
* Error.
* Éxito.

---

# 9. DETALLE DE CITA

Crear un panel lateral o modal con la información completa de una cita.

Mostrar:

* Cliente.
* Teléfono.
* Servicio.
* Profesional.
* Fecha.
* Hora.
* Duración.
* Estado.
* Observaciones.

Acciones:

* Editar.
* Reprogramar.
* Confirmar.
* Cancelar.
* Completar.

---

# 10. CLIENTES

Crear módulo de gestión de clientes.

Mostrar una tabla profesional con:

* Nombre.
* Teléfono.
* Correo.
* Número de citas.
* Última cita.
* Estado.
* Acciones.

Agregar:

* Buscador.
* Filtros.
* Ordenamiento.
* Paginación.
* Botón "Nuevo cliente".

Crear formulario de cliente:

* Nombre.
* Apellido.
* Teléfono.
* Correo.
* Documento.
* Fecha de nacimiento.
* Observaciones.

Crear también una página de detalle del cliente.

El detalle debe mostrar:

* Información personal.
* Historial de citas.
* Servicios utilizados.
* Última cita.
* Próxima cita.
* Estadísticas del cliente.

---

# 11. PROFESIONALES

Crear módulo para administrar profesionales o colaboradores.

Tabla:

* Nombre.
* Especialidad.
* Servicios.
* Sucursal.
* Horario.
* Estado.
* Acciones.

Crear perfil del profesional.

Mostrar:

* Información personal.
* Especialidad.
* Servicios asignados.
* Horarios.
* Citas próximas.
* Historial de citas.

Permitir configurar disponibilidad.

---

# 12. SERVICIOS

Crear módulo de servicios.

Cada servicio debe contener:

* Nombre.
* Descripción.
* Duración.
* Precio.
* Categoría.
* Profesional(es) asignado(s).
* Estado.

Crear tarjetas o tabla para visualizar servicios.

Acciones:

* Crear.
* Editar.
* Desactivar.
* Eliminar.

---

# 13. SUCURSALES

Crear módulo para empresas que tengan múltiples sucursales.

Mostrar:

* Nombre.
* Dirección.
* Teléfono.
* Horario.
* Número de profesionales.
* Estado.

Crear formulario de sucursal.

Permitir configurar:

* Información general.
* Dirección.
* Contacto.
* Horarios de atención.
* Días no laborables.

---

# 14. HORARIOS

Crear módulo para configurar horarios de atención.

Permitir configurar por:

* Sucursal.
* Profesional.
* Día de la semana.

Mostrar una interfaz visual sencilla para:

* Lunes.
* Martes.
* Miércoles.
* Jueves.
* Viernes.
* Sábado.
* Domingo.

Permitir agregar múltiples intervalos.

Ejemplo:

08:00 - 12:00
14:00 - 18:00

Incluir opción para marcar días como no disponibles.

---

# 15. REPORTES

Crear un módulo de reportes.

Incluir:

### Reporte de citas

Filtros:

* Fecha.
* Sucursal.
* Profesional.
* Servicio.
* Estado.

### Reporte de clientes

Mostrar:

* Clientes nuevos.
* Clientes recurrentes.
* Clientes inactivos.

### Reporte de ingresos

Mostrar:

* Ingresos por período.
* Ingresos por servicio.
* Ingresos por profesional.
* Ingresos por sucursal.

Utilizar gráficos modernos.

Incluir botones:

* Exportar.
* Descargar.

---

# 16. USUARIOS Y ROLES

Crear sección administrativa para gestionar usuarios.

Tabla:

* Nombre.
* Correo.
* Rol.
* Último acceso.
* Estado.
* Acciones.

Roles iniciales:

* Administrador.
* Gerente.
* Profesional.
* Recepción.

Diseñar una interfaz para asignar permisos.

Mostrar permisos agrupados por módulo:

* Dashboard.
* Agenda.
* Clientes.
* Profesionales.
* Servicios.
* Sucursales.
* Reportes.
* Configuración.

Utilizar checkboxes/toggles claros.

---

# 17. CONFIGURACIÓN

Crear sección de configuración con navegación interna.

Categorías:

### Empresa

* Nombre.
* Logo.
* Información de contacto.
* Identidad visual.

### Agenda

* Duración predeterminada.
* Anticipación mínima.
* Política de cancelación.
* Horarios.

### Notificaciones

* Correo.
* Recordatorios.
* Confirmaciones.

### Usuarios

* Usuarios.
* Roles.
* Permisos.

### Integraciones

Preparar visualmente la sección para futuras integraciones.

---

# 18. SUSCRIPCIÓN Y LICENCIA

Como el producto es un SaaS comercial, crear una sección específica de suscripción.

Mostrar:

* Plan actual.
* Precio.
* Próxima fecha de renovación.
* Estado de la licencia.
* Método de pago.

Estados:

* Activa.
* Próxima a vencer.
* Vencida.
* Suspendida.

Crear pantalla de planes:

* Mensual.
* Trimestral.
* Semestral.
* Anual.

Mostrar claramente:

* Precio.
* Características.
* Número de usuarios.
* Número de sucursales.
* Límites.
* Beneficios.

Agregar botones:

* Elegir plan.
* Cambiar plan.
* Renovar.
* Administrar suscripción.

---

# 19. PAGOS

Crear una pantalla de checkout profesional.

Mostrar:

* Plan seleccionado.
* Período de facturación.
* Resumen del precio.
* Descuentos si aplican.
* Total.

Formulario:

* Nombre.
* Correo.
* Información de facturación.
* Método de pago.

Crear estados:

* Procesando pago.
* Pago exitoso.
* Pago rechazado.
* Pago pendiente.

Crear pantalla de confirmación de pago exitoso.

---

# 20. NOTIFICACIONES

Diseñar sistema de notificaciones.

Tipos:

* Nueva cita.
* Cita cancelada.
* Cita reprogramada.
* Cliente nuevo.
* Pago exitoso.
* Suscripción próxima a vencer.
* Licencia vencida.

Utilizar:

* Toasts.
* Badges.
* Alertas.
* Centro de notificaciones.

---

# 21. ESTADOS DEL SISTEMA

Para todos los módulos diseñar estados consistentes:

### Loading

Utilizar skeleton loaders.

### Empty state

Mostrar:

* Ilustración o icono.
* Mensaje.
* Descripción.
* Acción principal.

Ejemplo:

"No tienes citas programadas"

Botón:

"Crear primera cita"

### Error

Mostrar:

* Icono.
* Mensaje.
* Explicación.
* Botón "Reintentar".

### Success

Mostrar confirmación visual después de operaciones exitosas.

---

# 22. COMPONENTES REUTILIZABLES

Crear un Design System con componentes reutilizables.

Incluir:

* Buttons.
* Inputs.
* Selects.
* Date pickers.
* Time pickers.
* Search inputs.
* Checkboxes.
* Radio buttons.
* Switches.
* Dropdowns.
* Tabs.
* Badges.
* Cards.
* Tables.
* Pagination.
* Modals.
* Drawers.
* Toasts.
* Alerts.
* Tooltips.
* Breadcrumbs.
* Avatars.
* Navigation.
* Sidebar.
* Topbar.
* Calendar components.
* Charts.

Cada componente debe tener variantes y estados.

Ejemplo de botón:

* Primary.
* Secondary.
* Outline.
* Ghost.
* Danger.
* Disabled.
* Loading.

---

# 23. RESPONSIVE DESIGN

Diseñar principalmente para desktop, pero garantizar adaptación a:

* Desktop.
* Laptop.
* Tablet.
* Mobile.

En mobile:

* Convertir sidebar en menú lateral desplegable.
* Adaptar tablas.
* Convertir formularios en layouts verticales.
* Adaptar calendario.
* Mantener acciones importantes accesibles.

---

# 24. ACCESIBILIDAD

Aplicar buenas prácticas de accesibilidad:

* Contraste adecuado.
* Estados de focus.
* Labels claros.
* Tamaños de botones apropiados.
* Iconos acompañados de texto cuando sea necesario.
* Estados visuales que no dependan únicamente del color.
* Jerarquía semántica clara.

---

# 25. EXPERIENCIA DE USUARIO

La aplicación debe sentirse rápida y sencilla.

Priorizar:

* Pocos clics para crear una cita.
* Acciones principales siempre visibles.
* Navegación consistente.
* Feedback inmediato.
* Confirmaciones antes de acciones destructivas.
* Búsqueda rápida.
* Filtros fáciles de utilizar.

La acción más importante del sistema es:

"Crear cita"

Por lo tanto, debe ser fácilmente accesible desde Dashboard y Agenda.

---

# 26. DATOS DE EJEMPLO

Utilizar datos ficticios realistas para mostrar el diseño.

Ejemplo de empresa:

"AgendaPro Demo"

Profesionales:

* Laura Martínez — Estilista
* Carlos Rodríguez — Barbero
* Andrea Gómez — Especialista

Servicios:

* Corte de cabello
* Manicure
* Consulta
* Masaje
* Tratamiento facial

Clientes:

Utilizar nombres ficticios realistas.

No utilizar datos reales.

---

# 27. ESTRUCTURA DEL ARCHIVO FIGMA

Organizar el archivo de diseño en páginas/secciones:

01 - Design System
02 - Authentication
03 - Dashboard
04 - Agenda
05 - Clientes
06 - Profesionales
07 - Servicios
08 - Sucursales
09 - Reportes
10 - Usuarios y Roles
11 - Configuración
12 - Suscripción
13 - Pagos
14 - Responsive
15 - Prototipo

Utilizar nombres claros y consistentes para frames y componentes.

Crear componentes reutilizables utilizando Auto Layout y variantes cuando corresponda.

---

# 28. REQUISITO PARA REACT

El diseño debe estar pensado para una futura implementación en React.

Evitar elementos visuales difíciles de implementar.

Priorizar:

* Componentes reutilizables.
* Variantes.
* Auto Layout.
* Diseño basado en tokens.
* Espaciado consistente.
* Componentes independientes.
* Estados claramente definidos.

La interfaz debe permitir que los componentes visuales puedan convertirse fácilmente en componentes React.

Ejemplo conceptual:

Button
Input
Modal
Table
Card
Sidebar
Topbar
Calendar
AppointmentCard
ClientCard
ProfessionalCard
ServiceCard

---

# 29. PROTOTIPO

Crear conexiones entre las principales pantallas para demostrar el flujo de usuario.

Flujo principal:

Login
→ Dashboard
→ Agenda
→ Crear cita
→ Seleccionar cliente
→ Seleccionar servicio
→ Seleccionar profesional
→ Seleccionar fecha/hora
→ Confirmar cita
→ Cita creada
→ Regresar a Agenda

Flujo secundario:

Dashboard
→ Clientes
→ Cliente
→ Historial de citas

Flujo comercial:

Configuración
→ Suscripción
→ Planes
→ Seleccionar plan
→ Checkout
→ Pago exitoso

---

# 30. RESULTADO ESPERADO

Generar un diseño de SaaS completo, coherente y profesional.

No generar únicamente una landing page.

El resultado debe parecer un producto SaaS real listo para ser presentado a clientes.

Debe ser:

* Moderno.
* Profesional.
* Escalable.
* Comercial.
* Intuitivo.
* Responsive.
* Multi-tenant.
* Preparado para React.

Priorizar consistencia visual entre todas las pantallas.

Utilizar componentes reutilizables y un Design System sólido.

El resultado final debe poder utilizarse como referencia visual para comenzar posteriormente el desarrollo frontend en React.
