# 📖 Guía del Proyecto: TaskFlow

Esta guía proporciona una visión detallada de la arquitectura, diseño y funcionamiento del proyecto **TaskFlow**, una plataforma de gestión de tareas basada en la metodología SCRUM.

---

## 📂 1. Estructura del Proyecto

El proyecto está dividido en dos grandes bloques (Frontend y Backend) y utiliza Docker para su despliegue.

### 🖥️ Backend (`backend/src/`)
*   **`config/`**: Contiene la configuración global, incluyendo la conexión a la base de datos (**Singleton**).
*   **`controllers/`**: Lógica de negocio de la aplicación. Aquí se procesan las peticiones y se coordinan los modelos y patrones.
*   **`middleware/`**: Funciones intermedias, principalmente para la autenticación JWT.
*   **`models/`**: Definición de los esquemas de MongoDB mediante Mongoose.
*   **`patterns/`**: Implementación de los patrones de diseño creacionales del lado del servidor.
*   **`routes/`**: Definición de los puntos de acceso (endpoints) de la API REST.

### 🎨 Frontend (`frontend/src/`)
*   **`components/`**: Componentes de React organizados por funcionalidad (auth, boards, tasks, etc.).
*   **`context/`**: Manejo de estados globales (Autenticación y Temas).
*   **`patterns/`**: Patrones de diseño creacionales del lado del cliente (**Abstract Factory**).
*   **`services/`**: Configuración de Axios para las llamadas a la API.

---

## 🗄️ 2. Diseño de la Base de Datos

Se utiliza **MongoDB** (base de datos NoSQL). Los modelos principales en `backend/src/models/` son:

1.  **User**: Almacena información de usuarios, roles (ADMIN, DEVELOPER, etc.) y contraseñas (hasheadas con bcrypt).
2.  **Project**: La entidad superior. Contiene miembros, etiquetas y configuración general.
3.  **Board**: Tableros dentro de un proyecto. Contienen una lista de **columnas** embebidas.
4.  **Task**: Tareas individuales. Incluyen:
    *   **Subtasks**: Arreglo embebido con estado de completitud.
    *   **Labels**: Etiquetas de color.
    *   **Comments**: Comentarios de usuarios.
    *   **Relaciones**: Referencias a `User` (asignado y creador), `Board` y `Project`.

---

## 🎨 3. Patrones de Diseño Creacionales (GoF)

El proyecto implementa los 5 patrones creacionales para asegurar escalabilidad y limpieza de código:

1.  **Singleton (`backend/src/config/database.js`)**: Garantiza que solo exista una instancia de conexión a la base de datos en toda la aplicación.
2.  **Factory Method (`backend/src/patterns/TaskFactory.js`)**: Crea automáticamente tareas con valores predeterminados (prioridad, etiquetas, iconos) según su tipo: `BUG`, `FEATURE`, `STORY` o `TASK`.
3.  **Builder (`backend/src/patterns/ProjectBuilder.js`)**: Permite la construcción paso a paso de proyectos complejos. Incluye un **Director** para crear plantillas rápidas (Scrum, Marketing, Personal).
4.  **Prototype (`backend/src/patterns/Prototype.js`)**: Permite clonar tableros (copiando su estructura de columnas) y tareas (copiando contenido pero reseteando el estado) de forma eficiente.
5.  **Abstract Factory (`frontend/src/patterns/ThemeFactory.js`)**: Provee una interfaz para crear familias de componentes visuales (colores, sombras, estilos) compatibles con los temas **Claro** y **Oscuro**.

---

## 🔌 4. Puertos y Ejecución

La aplicación está configurada para correr en los siguientes puertos:

| Servicio | Puerto (Docker/Prod) | Puerto (Local/Dev) |
| :--- | :--- | :--- |
| **Frontend (React)** | `80` | `5173` |
| **Backend (API)** | `3000` | `3000` |
| **MongoDB** | `27017` | `27017` |

*   **URL de acceso local:** `http://localhost` (vía Docker) o `http://localhost:5173` (vía Vite).

---

## 🛠️ 5. ¿Dónde agregar nuevas funcionalidades?

*   **Nuevas Entidades**: Crea un archivo en `backend/src/models/`, define su ruta en `backend/src/routes/index.js` y crea su controlador en `backend/src/controllers/`.
*   **Nuevos Tipos de Tareas**: Edita `backend/src/patterns/TaskFactory.js` añadiendo una nueva clase que extienda de `TaskCreator`.
*   **Nuevos Temas Visuales**: Añade una nueva fábrica en `frontend/src/patterns/ThemeFactory.js` que extienda de `ThemeFactory`.
*   **Configuraciones Globales**: Para variables de entorno (como el tiempo de expiración de JWT), edita el archivo `.env` o la sección `environment` en `docker-compose.yml`.

---

## ✅ 6. Cumplimiento de Requerimientos

El proyecto cumple con los siguientes puntos solicitados:
*   [x] **Stack MERN**: Implementado con MongoDB, Express, React y Node.js.
*   [x] **SCRUM**: Estructura basada en Proyectos, Tableros Kanban, Sprints (vía fechas) y Tipos de Tarea (Historias, Bugs).
*   [x] **5 Patrones GoF**: Singleton, Factory Method, Builder, Prototype y Abstract Factory están integrados en el núcleo de la lógica.
*   [x] **Arquitectura Limpia**: Separación clara entre modelos, controladores y patrones.
*   [x] **Dockerizado**: Configuración lista con Docker Compose.

---
*Documentación generada para el equipo de desarrollo de TaskFlow.*
