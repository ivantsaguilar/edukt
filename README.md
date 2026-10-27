Configuración y ejecución

Este archivo debe contener únicamente la información necesaria para instalar, ejecutar y
revisar técnicamente el proyecto.
Incluye:
- Requisitos e instrucciones de instalación y ejecución.
- Instrucciones para utilizar Docker Compose, si corresponde.
- Configuración de variables de entorno, incluyendo .env.example cuando sea necesario.
- Inicialización de datos.
- Comandos para ejecutar las pruebas.
- Información técnica indispensable para poner en funcionamiento la aplicación.

Arquitectura

edukt/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── config/          # Conexión a PostgreSQL
│   │   ├── db/              # Migraciones y Seeder[cite: 6]
│   │   ├── models/          # Interfaces y entidades de DB
│   │   ├── services/        # Máquina de estados y lógica de negocio
│   │   ├── controllers/     # Controladores HTTP[cite: 3]
│   │   ├── routes/          # Rutas API express
│   │   └── app.ts           # Punto de entrada de la API
│   └── tests/               # Pruebas integradas con Jest/Supertest[cite: 6]
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── components/      # Router, QuestionCard, TheoryCard, ProgressBar
        ├── services/        # Cliente API (fetch/axios)
        └── App.tsx

## Instalacion

# Desplegar aplicación completa
docker compose up --build -d

# Ejecutar pruebas automatizadas en el contenedor de backend
docker compose exec backend npm test