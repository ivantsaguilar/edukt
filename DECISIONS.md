Decisiones, criterio y reflexión

1. Decisiones técnicas
    - Uso de docker como fuente de verdad.
    - Separacion de frontend y backend por escalabilidad.
    - Uso de una version de node sin tantas vulnerabilidades.
    - Diseño de base de datos.
    - Orquestación y automatización del entorno para usar con docker.

    Uso de docker como fuente de verdad.
        - Qué problema necesitabas resolver.
            - Que se pudiera reproducir facilmente
        - Qué alternativas consideraste, si las hubo.
            - No las hubo
        - Por qué elegiste la solución implementada.
            - Facil de reproducir
        - Qué ventajas, limitaciones o compromisos identificas.
            - Mayor tiempo de configuracion

    - Separacion de frontend y backend por escalabilidad.
        - Qué problema necesitabas resolver.
            - Que el sistema fuera mantenible y escalable
        - Qué alternativas consideraste, si las hubo.
            - Hacer un monolito
        - Por qué elegiste la solución implementada.
            - Por escalabilidad y mantenibilidad
        - Qué ventajas, limitaciones o compromisos identificas.
            - La ventaja es que puede crecer el backend si fuera necesario y dejar el frontend en un solo servidor pequeno

    - Uso de una version de node sin tantas vulnerabilidades.
        - Qué problema necesitabas resolver.
            - Seguridad: Elegir una version sin tantas vulnerabilidades de nodejs
        - Qué alternativas consideraste, si las hubo.
            - Usar la version 22
        - Por qué elegiste la solución implementada.
            - Poruqe tenia menos vulverabilidades
        - Qué ventajas, limitaciones o compromisos identificas.
            - Tiene menos vulnerabilidades lo que significa menos puntos de entrada para atacantes

    - Diseño de base de datos.
        - Qué problema necesitabas resolver.
            - Entender como iban a persistir los datos
        - Qué alternativas consideraste, si las hubo.
            - Pedirle a la AI que lo hiciera
        - Por qué elegiste la solución implementada.
            - Para tener control de como funcionaria el sistema
        - Qué ventajas, limitaciones o compromisos identificas.
            - Tuve errores en hacer sobre ingenieria para un problema que no lo necesitaba

    - Orquestación y automatización del entorno para usar con docker.
        - Qué problema necesitabas resolver.
            - Que el evaluador no tuviera probemas al probar el proyecto
        - Qué alternativas consideraste, si las hubo.
            - No considere otra
        - Por qué elegiste la solución implementada.
            - Para que funcione en cualqueir maquina
        - Qué ventajas, limitaciones o compromisos identificas.
            - Cuaqluiera que baje el repositorio no tendra problemas de probar la app


Para cada una, explica:
- Qué problema necesitabas resolver.
    - Seguridad: Elegir una version sin tantas vulnerabilidades de nodejs
    - Flujo del estudiante para avanza y ser evaluado
- Qué alternativas consideraste, si las hubo.
- Por qué elegiste la solución implementada.
- Qué ventajas, limitaciones o compromisos identificas.


2. Reflexión de producto
Identifica al menos una limitación, supuesto cuestionable u oportunidad de mejora en las
reglas o la experiencia de aprendizaje propuestas.

- Se podria pedir el nombre del alumno al iniciar la app web 
- Agregar mensajes de refuerzo en que tiene intentos infinitos para avanzar al siguiente tema y no se salga de la app
- Un sistema simple de gamificacion para un contador de puntos y mantenerlo aprendiendo

Explica brevemente:
- Por qué consideras que es relevante.
- Qué alternativa o mejora propondrías.
- Cómo validarías su conveniencia antes de implementarla.

3. Uso de inteligencia artificial
Explica cómo utilizaste herramientas de IA durante el desarrollo.
Nos interesa conocer:
- Qué herramientas utilizaste.
    - Gemini

- En qué partes del proceso te apoyaste en ellas.
    - Planeacion del tiempo a ejecutar la prueba
    - Creacion del setup y estructura inicial para comenzar con el proyecto
    - Evaluacion del flujo que pide el documento de producto
    - Evaluacion de modelos para base de datos
    - .gitignore de la app
    - Creacion del seeder de temas, teoria, etc
    - Creacion del codigo base para hacer funcionar el api del flujo del estudiante
- Qué decisiones tomaste personalmente.
    - Version de node mas segura
    - Diseno de base de datos
    - Separacion de frontend y backend para mantenibilidad y escalabilidad
    - Boton para reiniciar el temario
    - no usar un .env para no complicar su reproduccion al evaluar
    - Pedirle a la Ai que escribiera el flujo de aplicacion
    - Pedirle las pruebas automatizadas validando los casos requeridos
- Cómo revisaste o validaste las soluciones obtenidas.
    - Probadolas
    - Validando reglas de la hoja de ruta
    - Verificando el flujo de la aplicacion mediante pruebas en el navegador
- Si identificaste alguna propuesta de la IA que decidiste corregir, modificar o descartar, y por qué.
    - propuestas sin sentido o exageradas para lo que se pide
    - Codigo generado que no correspondia al contexto que se necesita

4. Autoevaluación
Explica brevemente:
- Qué consideras que está bien resuelto.
- Qué limitaciones o riesgos reconoces.
- Qué mejorarías si dispusieras de más tiempo.
    - login
    - gamificacion
    - explicaciones con ejemplos paso a paso de como resolver problemas (con un LLM o un video)
    - agregar mas teoria de acuerdo al numero de reintentos fallidos para profundizar en la raiz de su aprendizaje
    - tendencias de temas mas faciles/dificiles
- Cuánto tiempo dedicaste aproximadamente al ejercicio.