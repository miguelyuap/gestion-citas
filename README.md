# 🚀 SmartAppoint - Gestor de Citas Inteligente con IA

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini_1.5_Flash-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)

Un sistema moderno de agendamiento y gestión de citas impulsado por Inteligencia Artificial. Diseñado con una interfaz de estética SaaS premium, y equipado con un asistente de triaje impulsado por **Google Gemini 1.5 Flash**.

## 🎯 ¿Qué problema resuelve?

En la gestión tradicional de servicios y atenciones (médicas, consultorías, etc.), los usuarios suelen agendar citas sin conocer los requisitos previos, generando demoras o cancelaciones en las salas de espera. 

**SmartAppoint** soluciona esto introduciendo un **Triaje Inteligente de Citas**. Antes de confirmar un horario, el paciente interactúa con un agente preventivo de Google Gemini que:
- Analiza la intención del usuario.
- Advierte sobre requisitos obligatorios (ej. ayuno, llevar el DNI, presentar órdenes médicas).
- Decide si la cita es "*Apta para agendarse*" basado en políticas personalizables impuestas por los proveedores.

## 🛠️ Tecnologías Principales

- **Frontend:**
  - React (Vite)
  - Tailwind CSS (Arquitectura de estilos moderna y minimalista)
  - Zustand (Gestión global de estado)
  - Recharts (Panel analítico y KPIs)
- **Backend:**
  - Node.js & Express.js
  - `@google/genai` (Google Generative AI SDK)
  - TypeORM (Mapeo objeto-relacional)
  - JSON Web Tokens (JWT Autenticación)

---

## ⚙️ Instalación y Configuración Local

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina local.

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/gestion-citas.git
cd gestion-citas
```

### 2. Instalar dependencias del Backend
```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend
```bash
cd ../frontend
npm install
```

---

## 🔐 Variables de Entorno (.env)

El proyecto requiere variables de configuración para inicializar de forma segura tanto la autenticación como la Inteligencia Artificial.

Crea un archivo `.env` en el directorio `/backend` con la siguiente estructura:

```env
# Configuración del Servidor
PORT=8000
NODE_ENV=development

# Configuración de Base de Datos (Ejemplo relacional/SQLite/Postgres)
DB_HOST=...
DB_PORT=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...

# Seguridad y Autenticación JWT
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=24h

# Configuración Google Generative AI (Gemini)
GEMINI_API_KEY=tu_api_key_de_google_ai_studio
```

> **Nota:** Nunca hagas commit de tus llaves o contraseñas reales. Manten tu `.env` dentro del archivo `.gitignore`.

---

## 🚀 Scripts de Ejecución

Una vez completadas las dependencias y el `.env`, puedes levantar ambos servidores:

### Iniciar el Backend (Modo Desarrollo)
Abre una terminal y ejecuta:
```bash
cd backend
npm run dev
```
> El servicio se ejecutará típicamente en `http://localhost:8000`

### Iniciar el Frontend (Modo Desarrollo)
Abre otra ventana de terminal paralela y ejecuta:
```bash
cd frontend
npm run dev
```
> La interfaz del cliente estará disponible en `http://localhost:5173`

---

## 💡 Flujos y Características Especiales

- **Roles Asignados:** Sistema con perfiles diferenciados (`Ciente`, `Proveedor`, `Admin`).
- **Dashboard Analítico:** Componentes interactivos mostrando KPIs (Citas Próximas, Completadas y Estadísticas Mensuales).
- **Control de IA Descentralizado:** Los pacientes pueden ajustar directrices médicas persistentes (Instrucciones Especiales) y prender o apagar la validación inteligente directamente desde la nueva pestaña de Configuración.

---

Desarrollado con ❤️ y potenciado por la velocidad de **Google Gemini Flash**.
