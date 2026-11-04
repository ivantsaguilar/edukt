### Opción A: 10 Desafíos de Live Coding (Modificaciones de Código)

1. **COMPLETADO** Segundo ejercicio de Refuerzo: Si el estudiante falla el ejercicio de refuerzo R1, en lugar de presentarle la misma pregunta, el sistema debe presentar un segundo refuerzo alternativo (R1\_ALT) tras volver a consultar la teoría.

2. Límite de intentos y bloqueo: Si un estudiante acumula 3 intentos fallidos consecutivos en la fase de refuerzo de un mismo tema, la máquina de estados debe cambiar su status a 'BLOQUEADO'.

3. Retroalimentación por opción elegida: Modificar la base de datos y la API para que cada opción (a, b, c) contenga una explicación de por qué es correcta o incorrecta, la cual debe mostrarse en el frontend tras responder.u

4. Reinicio de tema individual: Implementar un endpoint POST /api/restart-current-topic que limpie únicamente los intentos del tema actual y regrese al estudiante a la ACTIVIDAD_PRINCIPAL de ese tema, sin afectar los temas anteriores ya completados.

5. Historial de intentos en el Payload: Modificar GET /api/progress para que incluya la cantidad total de intentos fallidos acumulados en el tema actual.

6. Registro de timestamp de actividad: Agregar una columna last_active_at en student_progress que se actualice con la fecha y hora exacta cada vez que el estudiante responda una pregunta o avance en la teoría.

7. Porcentaje global de precisión: Agregar un campo calculado en la API que devuelva el porcentaje de precisión del estudiante (respuestas correctas / intentos totales * 100).

8. Revisión libre de temas completados: Permitir que el estudiante pueda enviar una petición para consultar la teoría de temas que ya marcó como 'COMPLETADO', sin alterar su estado actual en el temario.

9. Omisión de Teoría bajo opción explícita: Permitir que, tras responder incorrectamente una actividad principal, la API acepte un parámetro skipTheory: true para ir directamente al refuerzo si el estudiante así lo elige.

10. Expiración de sesión por inactividad: Si el campo created_at del último intento tiene más de 24 horas, la API debe devolver un flag requires_review: true para sugerirle al estudiante repasar la teoría.


----
----


### Opción B: 10 Preguntas de Arquitectura y DECISIONS.md

1. ¿Por qué decidiste separar la lógica de transiciones en una función pura (stateMachine.ts) en lugar de escribir la lógica dentro de consultas SQL o controladores de Express?
**Porque la funcion de la maquina de estados solo debe de encargarse de decidir que paso sigue, no tendria porque depender de la base de datos o de que algun dato la pueda modificar, simplemente se espera el mismo resultado con la misma entrada**

2. Si la plataforma escala de 1 estudiante a 100,000 usuarios concurrentes, ¿qué partes de tu arquitectura colapsarían primero y cómo las rediseñarías?
**Lo primero que podria colapsar es la base de datos, asi que usaria redis, usando una capa para dar las consultas que otros ya han hecho y si no estan ahi ir a la base de datos a traerlas y ponerlas en redis, la otra es poner esas peticiones de escritura en una cola asincrona que desapache mientras la maquina de estados ni se inmuta ya que no depende de la base de datos**

3. En DECISIONS.md afirmas que el frontend no tiene la verdad absoluta sobre las reglas. ¿Qué pasaría si un usuario modifica el estado local en React usando React DevTools o envía peticiones HTTP manipuladas con Postman?
**No pasaria nada, la logica vive en el backend, la base de datos es el isumo que usa la maquina de estados para validar que paso sigue, siempre se busca la respuesta en base de datos y si no existe se le responde con un mensaje de retroalimentacion**

4. ¿Por qué elegiste un Seeder en TypeScript con cláusulas ON CONFLICT DO NOTHING en lugar de usar una herramienta de migraciones y ORM como Prisma, TypeORM o Knex?
**No iba a configurar un orm solo para unas cuantas consulta y 4 tablas en base de datos, creo que para esta solucion usar consultas puras soluciona el problema, ademas eso seria sobre ingenieria y el documento decia que no sobre ingenieria, elegi ahi no hacerlo ya que me tarde un poco configurando docker y configurar prisma me llevaria mas tiempo**

5. ¿Qué ventajas y desventajas representa haber orquestado el proyecto con Docker Compose utilizando imágenes de Node Alpine frente a ejecutar los procesos nativamente en el sistema operativo?
**La ventaja por la que lo elegi es porque es reproducible en cualquier maquina o servidor, aunque toma tiempo de configurar pero entrega confianza de que funcionara. Pero hacerlo asi agrega un ligero overhead de memoria/disco que como si fuera de forma nativa**

6. ¿Cómo garantizas la idempotencia en los endpoints de escritura (POST /api/submit y POST /api/advance-theory)?
**La maquina de estados garantiza que no te puedas mover ya que se controla con el estado actual, no podrias pasar de teoria a teoria aunque des 2click, ademas en base de datos se usaria un indice de restricion que rechace duplicados en base de datos**

7. ¿Por qué la propiedad correct_option jamás se devuelve en la respuesta del endpoint GET /api/progress y qué riesgo de seguridad previene esta omisión?
**Se omitio desde la consulta a base de datos porque al analizar la peticion se podrian ver las respuestas, previene manipular evaluaciones por diseno**

8. Si tuvieras que agregar autenticación de usuarios mediante JSON Web Tokens (JWT), ¿cómo modificarías el esquema de PostgreSQL y el contrato de las rutas API?
**Agregaria una tabla de usuarios junto a sus tokens, asi dejaria de usar el user_id y pasaria a usarlo pasandolo por el middleware de auth**

9. En la máquina de estados utilizaste tipos literales de TypeScript ('ACTIVIDAD_PRINCIPAL' | 'TEORIA' | 'REFUERZO'). ¿Por qué elegiste esta estructura en lugar de un patrón de diseño State orientada a objetos o una librería como XState?
**Lo elegi asi porque para una regla con 4 estados no seberian meterse clases innecesarias ni librerias subutlizadas que ademas suman peso y complejidad, ademas de tener 0 dependencias**

10. Si el contenedor del backend se apaga repentinamente a mitad de la ejecución de POST /api/submit, ¿cómo aseguras que la base de datos no quede en un estado inconsistente (ejemplo: intento registrado pero estado no actualizado)?
**Usaria transacciones de bases de datos**


----
----


### Opción C: 10 Preguntas de Fundamentos Tecnológicos

1. TypeScript: ¿Cuál es la diferencia conceptual entre type e interface en TypeScript y por qué usamos interface para definir las estructuras de respuesta de la API?

2. React: Explica qué es el arreglo de dependencias en useEffect (useEffect(() => {}, [])) y qué sucedería en tu componente App.tsx si lo omitieras por completo.

3. React: Explica el principio de inmutabilidad en el estado de React y por qué es un error hacer la asignación directa data.progress.currentStep = 'TEORIA'.

4. PostgreSQL: ¿Qué función cumplen una PRIMARY KEY y una FOREIGN KEY, y qué ventajas tiene haber definido la columna options como tipo JSONB en la tabla contents?

5. Express / Node.js: ¿Qué es un middleware en Express y cómo se utilizaría para implementar un manejador centralizado de errores o una validación de esquemas?

6. Jest / Supertest: En tu suite de pruebas utilizaste beforeEach para borrar la tabla attempts y reiniciar el estado. ¿Por qué es fundamental el aislamiento de datos (test isolation) entre ejecuciones de pruebas?

7. Docker: ¿Cuál es la diferencia técnica entre la instrucción EXPOSE dentro de un Dockerfile y la sección ports: en un archivo docker-compose.yml?

8. TypeScript: ¿Cómo funcionan el operador de encadenamiento opcional (?.) y el operador de coalescencia nula (??) en expresiones como data?.currentContent ?? null?

9. Express / Node.js: ¿Qué diferencias existen entre req.params, req.query y req.body en una petición HTTP en Express?

10. PostgreSQL / SQL: ¿Qué es una transacción SQL (BEGIN, COMMIT, ROLLBACK) y por qué es crítica cuando registras un intento en la tabla attempts y actualizas la tabla student_progress simultáneamente?