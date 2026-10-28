# edukt — Ruta Adaptativa de Aprendizaje de Matemáticas

Aplicación web Full Stack que permite a los estudiantes recorrer un temario de matemáticas con actividades evaluables, refuerzos y consulta de teória según su desempeño.

---

## 🛠️ Stack Tecnológico

- **Backend:** Node.js, Express, TypeScript, PostgreSQL, Jest, Supertest.
- **Frontend:** React, Vite, Tailwind CSS v4, TypeScript.
- **Infraestructura:** Docker, Docker Compose.

---

## 🚀 Requisitos e Instalación Rápida

Asegúrate de tener instalados **Docker** y **Docker Compose**.

### 1. Desplegar la aplicación completa

Ejecuta el siguiente comando en la raíz del repositorio:

```bash
docker compose up --build
```

### Este comando automatiza el arranque de todo el sistema:

- Levanta la base de datos PostgreSQL (edukt_db) en el puerto 5432.

- Espera el estado healthy del contenedor de base de datos.

- Ejecuta de forma automática el seeder **(npm run db:seed)** cargando los 3 temas, actividades y teoría provistos

- Inicia el servidor Backend en http://localhost:4000.

- Inicia el servidor Frontend en http://localhost:5173.


**Nota** para reiniciar datos: Para detener los contenedores y reiniciar la base de datos a su estado inicial, ejecuta:

```
docker compose down -v
```


## Ejecución de Pruebas Automatizadas

Las pruebas evalúan el cumplimiento de las reglas del motor de decisión y la API:

1. Respuesta correcta en Actividad Principal avanza al siguiente tema.
2. Respuesta incorrecta en Actividad Principal transiciona a TEORÍA'. 
3. Rechazar opción de respuesta inexistente (ejemplo: "z").
4. Bloqueo de envíos tras completar todo el temario.
5. Rechazar intento de responder una actividad fuera del paso actual.

Ejecucion con Docker (**Recomendada**)
```bash
docker compose exec backend npm test
```


### Ejecucion forma local

Asegúrate de tener la base de datos corriendo en Docker (docker compose up -d db) y ejecuta desde la carpeta raiz del proyecto:

```bash
cd backend
npm test
```


## Variables de Entorno

Las variables vienen preconfiguradas en docker-compose.yml para desarrollo local:

```
PORT=4000
DATABASE_URL=postgres://edukt_user:edukt_password@db:5432/edukt_db
```