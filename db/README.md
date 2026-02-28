# Sistema Híbrido SQL + MongoDB

## Modelado, Justificación y Diseño de Arquitectura

------------------------------------------------------------------------

## 1. Introducción

El presente documento describe el diseño y modelado de una arquitectura
híbrida compuesta por:

-   Base de datos relacional (SQL)
-   Base de datos documental (MongoDB)

El objetivo de la actividad es demostrar la correcta separación de
responsabilidades entre ambos motores, aplicando criterios técnicos
sólidos para decidir qué información debe almacenarse en cada uno,
evitando redundancia innecesaria y garantizando coherencia estructural.

El sistema está orientado a la gestión de usuarios, campañas, citas y
tickets de soporte.

------------------------------------------------------------------------

# 2. Modelado en SQL

La base de datos relacional está diseñada para almacenar entidades
estructuradas, con relaciones definidas y necesidad de integridad
referencial.

## Tablas diseñadas

-   users\
-   donors\
-   campaigns\
-   appointments\
-   notifications\
-   roles

## Criterios utilizados

La información almacenada en SQL cumple con al menos uno de los
siguientes puntos:

-   Requiere integridad referencial
-   Necesita relaciones fuertes (FK)
-   Es información estructurada y estable
-   No tiene crecimiento dinámico impredecible
-   Requiere consistencia transaccional

Ejemplo:

-   Un usuario tiene un rol → relación clara
-   Una cita pertenece a un usuario → relación clara
-   Una campaña tiene múltiples donantes → relación clara

Este tipo de estructura es naturalmente relacional.

------------------------------------------------------------------------

# 3. Modelado en MongoDB

MongoDB se utiliza exclusivamente para el manejo de tickets.

La razón es que un ticket:

-   Contiene información dinámica
-   Tiene historial de eventos
-   Posee múltiples mensajes
-   Puede crecer sin límite definido
-   No requiere joins complejos internos

------------------------------------------------------------------------

## 3.1 Estructura del Documento Ticket

``` json
{
  "_id": "ObjectId",
  "user_id": 15,
  "subject": "Problema con cita programada",
  "category": "APPOINTMENT",
  "priority": 2,
  "status": "OPEN",
  "tags": ["urgent", "medical", "schedule"],

  "related_type": "appointment",
  "related_ref": 103,

  "history": [
    {
      "event": "CREATED",
      "date": "2025-01-10T10:00:00Z"
    },
    {
      "event": "STATUS_CHANGED_TO_IN_PROGRESS",
      "date": "2025-01-10T11:00:00Z"
    }
  ],

  "messages": [
    {
      "author_type": "USER",
      "author_name": "Juan Pérez",
      "body": "No puedo asistir a la cita.",
      "attachment_url": null,
      "created_at": "2025-01-10T10:05:00Z"
    },
    {
      "author_type": "AGENT",
      "author_name": "Soporte",
      "body": "Estamos revisando tu caso.",
      "attachment_url": null,
      "created_at": "2025-01-10T10:20:00Z"
    }
  ],

  "created_at": "2025-01-10T10:00:00Z",
  "updated_at": "2025-01-10T11:00:00Z"
}
```

------------------------------------------------------------------------

# 4. Distribución de Responsabilidades

## SQL contiene:

-   Usuarios
-   Citas
-   Campañas
-   Donantes
-   Notificaciones
-   Roles

## MongoDB contiene:

-   Tickets
-   Historial de eventos
-   Mensajes embebidos
-   Tags dinámicos

------------------------------------------------------------------------

# 5. Justificación Técnica de la Separación

## ¿Por qué tickets en MongoDB?

1.  Un ticket tiene múltiples mensajes.
2.  Un ticket tiene múltiples eventos de estado.
3.  El crecimiento es dinámico e impredecible.
4.  Embedding evita joins innecesarios.
5.  Permite escalabilidad horizontal.

Si se modelara completamente en SQL, implicaría:

-   Tabla tickets
-   Tabla ticket_messages
-   Tabla ticket_history
-   Relaciones múltiples
-   Mayor complejidad de consultas

Mongo simplifica este escenario al permitir documentos autocontenidos.

------------------------------------------------------------------------

## ¿Por qué no duplicar datos de usuario en Mongo?

Porque el usuario ya existe en SQL.

Duplicarlo generaría:

-   Problemas de consistencia
-   Actualizaciones redundantes
-   Violación del principio de única fuente de verdad

Se usa únicamente:

-   user_id
-   related_type
-   related_ref

Como referencia híbrida.

------------------------------------------------------------------------

# 6. Flujo de Creación de un Ticket

1.  Se valida que el user_id exista en SQL.
2.  Se valida que related_ref exista en SQL según related_type.
3.  Se crea el documento en MongoDB.
4.  Se registra evento inicial en history.
5.  Se registra primer mensaje si aplica.

------------------------------------------------------------------------

# 7. Flujo de Consulta Híbrida

Ejemplo conceptual:

GET /tickets/{id}

Proceso:

1.  Buscar documento en MongoDB.
2.  Extraer user_id.
3.  Consultar usuario en SQL.
4.  Si related_type = appointment → consultar cita en SQL.
5.  Construir respuesta unificada.

Respuesta final:

``` json
{
  "ticket": { ... },
  "user": { ...datos SQL... },
  "related_entity": { ...datos SQL... }
}
```

------------------------------------------------------------------------

# 8. Posibles Operaciones sobre el Modelo

-   Filtrar tickets por estado
-   Filtrar por prioridad
-   Buscar por tag
-   Agregar mensaje nuevo
-   Agregar evento al historial
-   Cambiar estado

Todas estas operaciones son naturales en MongoDB.

------------------------------------------------------------------------

# 9. Análisis Personal (Punto Evaluativo Principal)

En esta actividad el punto clave no era únicamente modelar tablas o
crear un documento JSON, sino comprender el criterio detrás de una
arquitectura híbrida.

La decisión de separar SQL y MongoDB no fue arbitraria. Se aplicaron los
siguientes principios:

1.  Datos estructurados y relacionales → SQL\
2.  Datos dinámicos, crecientes y dependientes → MongoDB\
3.  Evitar duplicidad de información\
4.  Mantener una única fuente de verdad\
5.  Diseñar pensando en escalabilidad futura

El análisis permitió identificar que:

-   Users, appointments y campaigns requieren integridad referencial
    fuerte.
-   Tickets requieren flexibilidad estructural.
-   Historial y mensajes son entidades dependientes que no justifican
    modelado relacional complejo.
-   La arquitectura híbrida reduce complejidad y mejora mantenibilidad.

Adicionalmente, se consideró que en un entorno real:

-   MongoDB podría escalar horizontalmente.
-   SQL mantendría consistencia transaccional.
-   El backend sería responsable de la unión lógica de ambos mundos.

La separación no solo cumple con la actividad, sino que responde a un
criterio de diseño realista y aplicable en producción.

------------------------------------------------------------------------

# 10. Conclusión

El sistema fue modelado aplicando principios de diseño de bases de datos
híbridas, separando correctamente:

-   Información estructurada y relacional (SQL)
-   Información dinámica y de crecimiento variable (MongoDB)

Se justificó técnicamente cada decisión, se diseñó el flujo de
integración y se planteó la arquitectura de consulta híbrida.

El resultado es un modelo coherente, escalable y técnicamente
defendible.
