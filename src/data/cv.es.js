/* ============================================================
   DATOS DEL CV — ESPAÑOL
   Edita este fichero para actualizar el contenido del portfolio
   (y src/data/cv.en.js para la versión en inglés).
   ============================================================ */
const GH = 'https://github.com/sogekingdabest';

export default {
  hero: {
    name: 'Daniel Olañeta Fariña',
    shortName: 'Dani',
    title: 'Software Engineer',
    klass: 'Artífice del Backend',
    tagline: 'Backend · Identidad digital · Microservicios',
    startDate: '2023-06-05', // inicio en IT: de aquí sale el NIVEL del personaje
    facts: [
      ['Clase', 'Artífice del Backend'],
      ['Gremio', 'NTT DATA'],
      ['Trasfondo', 'Ingeniero Informático (UDC)'],
      ['Territorio', 'Galicia, España'],
      ['Alineamiento', 'Legal bueno: escribe los tests']
    ],
    bio: [
      'Ingeniero Informático con más de tres años en NTT DATA, donde he pasado de becario a Engineer. Mi terreno es el backend: Java, el ecosistema Spring, microservicios y APIs.',
      'Ahora trabajo en identidad digital y autenticación para el sector público: OAuth 2.0, OpenID4VC, credenciales verificables y bastante criptografía.',
      'Antes fui referente técnico en una plataforma de servicios sociales: análisis, diseño y descomposición de funcionalidades para el resto del equipo.',
      'Fuera del trabajo sigo construyendo: un archivo para campañas de rol con IA local, una app Android con IA en el dispositivo y, bueno, esta isla.'
    ],
    // Atributos al estilo de una ficha de rol (puntuación sobre 20)
    abilities: [
      { abbr: 'FUE', name: 'Backend', detail: 'Java · Spring', score: 18 },
      { abbr: 'DES', name: 'DevOps', detail: 'Docker · CI/CD · OpenShift', score: 14 },
      { abbr: 'CON', name: 'Calidad', detail: 'JUnit · Mockito', score: 16 },
      { abbr: 'INT', name: 'Seguridad', detail: 'OAuth · OpenID4VC · PKI', score: 17 },
      { abbr: 'SAB', name: 'Análisis', detail: 'Diseño técnico', score: 16 },
      { abbr: 'CAR', name: 'Comunicación', detail: 'Mentoría y equipo', score: 15 }
    ],
    passives: [
      ['Referente técnico', 'Analiza, diseña y descompone funcionalidades para que el equipo las ejecute.'],
      ['Mentoría', 'Transferencia de conocimiento y apoyo a compañeros.'],
      ['Comunicación clara', 'Traduce entre perfiles técnicos y funcionales.'],
      ['Resolución de problemas', 'Depura en local, lee logs y llega a la causa raíz.'],
      ['Aprendizaje continuo', 'De la interoperabilidad a los servicios sociales y la identidad digital.'],
      ['Equipo ágil', 'Sprints, refinamiento de requisitos y priorización técnica.']
    ]
  },

  quests: [
    {
      name: 'Identidad digital y credenciales verificables',
      rank: 'legendary',
      role: 'Engineer',
      company: 'NTT DATA',
      client: 'Sector público',
      period: 'feb 2026 — actualidad',
      current: true,
      summary:
        'Plataforma de identidad digital para una administración pública: identidad, credenciales y documentación oficial del ciudadano, con interoperabilidad segura entre organismos y estándares europeos.',
      points: [
        'Diseño e implementación de microservicios y APIs REST en Java 17 y Python, con contratos OpenAPI e integración con servicios internos y externos.',
        'Componentes de autenticación e interoperabilidad sobre OAuth 2.0, OpenID4VC y DPoP: emisión, renovación, introspección y validación de tokens y credenciales.',
        'Seguridad criptográfica: validación de JWT/JWS, COSE, certificados X.509, cadenas de confianza PKIX, listas de confianza y revocación.',
        'Flujos de verificación para Wallet Instance Attestations, Key Attestations, SD-JWT VC, mDoc y Token Status Lists.',
        'Pruebas unitarias y de integración, compatibilidad hacia atrás y evolución de servicios críticos según especificaciones y cambios normativos.'
      ],
      tech: ['Java 17', 'Python 3', 'Spring Security', 'OAuth 2.0', 'OpenID4VC', 'DPoP', 'SD-JWT VC', 'mDoc', 'OpenAPI', 'JUnit']
    },
    {
      name: 'Plataforma de servicios sociales',
      rank: 'epic',
      role: 'Engineer · Referente técnico',
      company: 'NTT DATA',
      client: 'Sector público',
      period: 'nov 2024 — ene 2026',
      summary: 'Aplicaciones de gestión de servicios sociales para una administración pública.',
      levelUp: 'Subida de nivel: ascenso a Engineer en marzo de 2025.',
      points: [
        'Análisis técnico, diseño y desarrollo de microservicios Java con lógica de negocio compleja y comunicación entre múltiples servicios.',
        'Definición de APIs con Swagger y persistencia en Oracle: creación de tablas y scripts DDL y DML.',
        'Nuevas funcionalidades y componentes de frontend en Angular.',
        'Pruebas con JUnit y Mockito, y despliegues con Jenkins en ROSA (Red Hat OpenShift Service on AWS).',
        'Resolución de incidencias depurando en local y analizando logs en ROSA.',
        'Referente técnico de la aplicación: análisis y diseño de funcionalidades para el resto del equipo y transferencia de conocimiento.'
      ],
      tech: ['Java 8', 'Spring Boot', 'Spring Data JPA', 'Angular', 'Oracle', 'H2', 'Jenkins', 'OpenShift (ROSA)', 'JUnit', 'Mockito']
    },
    {
      name: 'Portal de interoperabilidad',
      rank: 'rare',
      role: 'Junior Engineer',
      company: 'NTT DATA',
      client: 'Sector público',
      period: 'jun 2023 — ago 2024',
      summary: 'Portal para gestionar y configurar el nodo de interoperabilidad de una administración pública.',
      points: [
        'Evolutivos y mantenimiento del backend en Java 8 y 11.',
        'Definición y desarrollo de APIs REST y SOAP.',
        'Pruebas unitarias automatizadas con JUnit, Mockito y H2.',
        'Análisis y documentación de nuevas funcionalidades, con sus diagramas.',
        'Scripts en Python para automatizar procesos.',
        'Soporte a usuarios por plataforma de tickets y correo.'
      ],
      tech: ['Java 7 / 8 / 11', 'Spring', 'Hibernate', 'Oracle', 'SQL', 'Docker', 'Python 3', 'JUnit', 'Mockito']
    },
    {
      name: 'Prácticas en NTT DATA',
      rank: 'common',
      role: 'Becario',
      company: 'NTT DATA',
      client: 'Sector público',
      period: 'feb 2023 — may 2023',
      summary: 'Primeros pasos en el backend del portal de interoperabilidad: APIs, pruebas y corrección de errores en Java.',
      levelUp: 'Misión superada: incorporación como Junior Engineer en junio de 2023.',
      points: [],
      tech: ['Java', 'Spring', 'Hibernate', 'Oracle']
    },
    {
      name: 'Prácticas en Denodo',
      rank: 'common',
      role: 'Becario',
      company: 'Denodo',
      client: '',
      period: 'sep 2021 — dic 2021',
      summary: 'Prácticas durante el grado en Denodo, empresa de virtualización de datos, en A Coruña.',
      points: [],
      tech: []
    }
  ],

  skills: [
    {
      category: 'Backend',
      school: 'Magia mayor',
      items: [
        ['Java (7 → 21)', 5],
        ['Spring Boot · Security · Data JPA', 5],
        ['APIs REST / SOAP · OpenAPI', 5],
        ['Microservicios', 4],
        ['Hibernate / JPA', 4],
        ['Python · FastAPI', 4]
      ]
    },
    {
      category: 'Identidad y seguridad',
      school: 'Artes arcanas',
      items: [
        ['OAuth 2.0 · OpenID4VC · DPoP', 4],
        ['JWT / JWS · COSE', 4],
        ['X.509 · PKIX · revocación', 4],
        ['SD-JWT VC · mDoc', 4],
        ['Keycloak', 3]
      ]
    },
    {
      category: 'Datos',
      school: 'Alquimia',
      items: [
        ['Oracle · SQL', 4],
        ['PostgreSQL · pgvector', 3],
        ['H2', 3]
      ]
    },
    {
      category: 'DevOps',
      school: 'Ingeniería de asedio',
      items: [
        ['Docker · Compose', 4],
        ['Git · GitHub Actions', 4],
        ['Jenkins · CI/CD', 3],
        ['OpenShift / ROSA (AWS)', 3],
        ['Kubernetes · Kustomize', 2]
      ]
    },
    {
      category: 'Frontend y móvil',
      school: 'Ilusionismo',
      items: [
        ['Angular', 3],
        ['React · TypeScript', 3],
        ['Kotlin · Jetpack Compose', 3]
      ]
    },
    {
      category: 'IA y machine learning',
      school: 'Adivinación',
      items: [
        ['RAG · LLM locales (Ollama)', 3],
        ['IA en el dispositivo (LiteRT, TFLite)', 3],
        ['NLP (GLiNER, spaCy, Transformers)', 3],
        ['Visión por computador', 2]
      ]
    },
    {
      category: 'Calidad y método',
      school: 'Disciplina',
      items: [
        ['JUnit · Mockito', 5],
        ['Agile / Scrum', 4],
        ['pytest · Playwright', 3]
      ]
    }
  ],
  skillRanks: ['', 'Novato', 'Aprendiz', 'Competente', 'Experto', 'Maestro'],

  education: [
    {
      degree: 'Máster en Ingeniería Informática',
      school: 'Universidade da Coruña',
      period: '2022 — 2026',
      note: 'Cursado mientras trabajaba en NTT DATA.'
    },
    {
      degree: 'Grado en Ingeniería Informática',
      school: 'Universidade da Coruña',
      period: '2018 — 2022',
      note: 'Mención en Computación.'
    },
    {
      degree: 'CFGS Administración de Sistemas Informáticos en Red',
      school: 'IES Chan do Monte',
      period: '2016 — 2018',
      note: 'Ciclo superior: redes, sistemas y administración.'
    }
  ],

  projects: [
    {
      name: 'Codex of Realms',
      rank: 'legendary',
      status: 'v0.1.0-beta · oct 2026',
      tagline: 'Archivo compartido para campañas de rol: cada jugador ve solo lo que su personaje sabe.',
      desc: 'Guarda las notas de sesión, personajes y lugares de una campaña. El máster decide qué ve cada jugador, y las preguntas se responden citando los pasajes originales. Todo se ejecuta en local, modelos de lenguaje incluidos.',
      highlights: [
        'RAG con permisos: el backend filtra las fuentes antes de ordenar los resultados.',
        'El servidor copia el texto original en la respuesta, así que las citas son verificables.',
        'Procesado de documentos con trabajos persistentes y reintentos.',
        'CI, tests de backend y frontend, y documentación de arquitectura.'
      ],
      tech: ['Java 21', 'Spring Boot', 'React', 'TypeScript', 'PostgreSQL', 'pgvector', 'Keycloak', 'Ollama', 'Docker Compose'],
      links: [['GitHub', `${GH}/codex-of-realms`]]
    },
    {
      name: 'Habitly',
      rank: 'epic',
      status: 'v1.0.4',
      tagline: 'Organizador del hogar para Android con un asistente de IA que funciona sin conexión.',
      desc: 'App para coordinar la casa: lista de la compra y despensa en tiempo real, rutinas compartidas con rotación justa, notas y un asistente que se ejecuta íntegramente en el dispositivo.',
      highlights: [
        'Inferencia 100 % en el dispositivo con LiteRT-LM y modelos Gemma descargables.',
        'Clean Architecture + MVI por módulos de funcionalidad.',
        'Sincronización multiusuario con Firebase Auth y Firestore.',
        'Widget, accesos directos y notificaciones.'
      ],
      tech: ['Kotlin', 'Jetpack Compose', 'Material 3', 'Hilt', 'Room', 'Firebase', 'Coroutines / Flow', 'LiteRT-LM'],
      links: [['GitHub', `${GH}/Habitly`]]
    },
    {
      name: 'SkinCare ML',
      rank: 'epic',
      status: 'Experimental · proyecto educativo',
      tagline: 'El pipeline de entrenamiento y exportación del clasificador de lesiones cutáneas de SkinCare.',
      desc: 'Entrena un clasificador binario multimodal basado en EfficientNetV2-B0 que combina la imagen dermatoscópica con tres metadatos (edad aproximada, sexo y zona anatómica) y lo exporta a TensorFlow Lite. No es un dispositivo médico.',
      highlights: [
        'Transfer learning en dos fases: entrenamiento con cosine decay y fine-tuning de las últimas 50 capas.',
        'Focal loss para un dataset muy desbalanceado; el umbral se elige en validación y las métricas salen de un test aparte.',
        'Model card con uso previsto, limitaciones conocidas y consideraciones éticas.',
        'Entrenamiento en Kaggle con semillas fijadas y comprobación de paridad Keras / TFLite antes de publicar un modelo.'
      ],
      tech: ['Python', 'TensorFlow', 'Keras', 'EfficientNetV2', 'TensorFlow Lite', 'Kaggle', 'Jupyter'],
      links: [['GitHub', `${GH}/skincare-ml`]]
    },
    {
      name: 'SkinCare AI',
      rank: 'rare',
      status: 'Proyecto educativo',
      tagline: 'Análisis de lunares en el móvil combinando un modelo de IA con los criterios ABCDE.',
      desc: 'App Android que analiza lesiones cutáneas en el propio dispositivo con un modelo EfficientNetV2-B0 y criterios ABCDE automatizados. No es un dispositivo médico.',
      highlights: [
        'Modelo entrenado con el dataset SIIM-ISIC y cuantizado para móviles.',
        'Análisis 100 % local: las imágenes no salen del dispositivo.',
        'Guías de captura en tiempo real y mapa corporal para localizar cada lunar.',
        'Historial y seguimiento de la evolución de cada lunar.'
      ],
      tech: ['Kotlin', 'TensorFlow Lite', 'OpenCV', 'CameraX', 'Firebase', 'Material Design 3'],
      links: [['GitHub', `${GH}/SkinCareApp`]]
    },
    {
      name: 'LoreCrafter NER',
      rank: 'rare',
      status: 'Motor de extracción',
      tagline: 'Extracción automática de entidades para lore de fantasía y mitología.',
      desc: 'Convierte texto narrativo (novelas de fantasía, wikis de D&D, material de rol) en una base de datos estructurada de personajes, facciones, lugares, artefactos y razas.',
      highlights: [
        'Inferencia multimodelo: BERT, DeBERTa-v3 y GLiNER.',
        'Dataset construido con scraping y preanotación con LLM (Groq / Llama 3).',
        'Fine-tuning con seguimiento de experimentos en MLflow.',
        'API REST con FastAPI y persistencia en PostgreSQL.'
      ],
      tech: ['Python', 'PyTorch', 'Hugging Face', 'GLiNER', 'spaCy', 'FastAPI', 'PostgreSQL', 'MLflow', 'Docker'],
      links: [['GitHub', `${GH}/lorecrafter-ner`]]
    },
    {
      name: 'Portfolio RPG 3D',
      rank: 'secret',
      status: 'Estás dentro',
      tagline: 'Este mismo mundo.',
      desc: 'Un CV jugable en 3D: una isla low-poly generada íntegramente por código, sin modelos ni texturas externas y sin paso de build.',
      highlights: [],
      tech: ['Three.js', 'JavaScript', 'WebGL / GLSL', 'WebAudio'],
      links: [['GitHub', `${GH}/Portfolio-interactivo`]]
    }
  ],

  // Reliquias: proyectos antiguos escondidos en cofres por la isla
  relics: {
    uno: {
      name: 'Validador de UNO',
      year: '2021',
      desc: 'Un validador de partidas de UNO escrito con Lex y Bison: comprueba que una partida transcrita cumple las reglas.',
      tech: ['Lex', 'Bison / Yacc', 'C'],
      link: `${GH}/ValidadorUNOPL`,
      hint: 'Al final del muelle.'
    },
    lambda: {
      name: 'Intérprete de Lambda Cálculo',
      year: '2021',
      desc: 'Un intérprete de lambda cálculo implementado en OCaml.',
      tech: ['OCaml'],
      link: `${GH}/Interprete-de-Lambda-Calculo`,
      hint: 'En lo alto de la colina del molino.'
    },
    lightsout: {
      name: 'The Lights Out Puzzle',
      year: '2021',
      desc: 'Codificador y solver del puzzle Lights Out: un encoder en Java plantea el problema y telingo (programación lógica temporal) lo resuelve minimizando pulsaciones.',
      tech: ['Java', 'ASP / telingo', 'Python'],
      link: `${GH}/The-Lights-Out-Puzzle`,
      hint: 'Detrás del Gremio.'
    },
    lung: {
      name: 'Lung Nodule Detection',
      year: '2024',
      desc: 'Detección de nódulos pulmonares con visión por computador clásica: ecualización de histograma, segmentación de los pulmones y operaciones morfológicas.',
      tech: ['Python', 'Visión por computador'],
      link: `${GH}/LungNoduleDetection`,
      hint: 'En la playa del este, pasada la Forja.'
    },
    unreal: {
      name: 'Decal Building Collision',
      year: '2021',
      desc: 'Sistema de colisiones para colocar construcciones en un videojuego: C++ para Unreal Engine, con materiales «fantasma» que indican si se puede construir.',
      tech: ['C++', 'Unreal Engine'],
      link: `${GH}/DecalBuildingCollision`,
      hint: 'Detrás del Faro, al borde del acantilado.'
    },
    k8s: {
      name: 'k8s-portafolio',
      year: '2026',
      desc: 'Despliegue de una aplicación Spring Boot en Kubernetes con Kustomize: una base y overlays para desarrollo y producción.',
      tech: ['Kubernetes', 'Kustomize', 'Spring Boot'],
      link: `${GH}/k8s-portafolio`,
      hint: 'En el bosque del oeste.'
    }
  },

  contact: {
    email: 'daniolanetafarina@gmail.com',
    linkedin: 'https://www.linkedin.com/in/dani-olañeta-fariña',
    linkedinLabel: 'linkedin.com/in/dani-olañeta-fariña',
    github: GH,
    githubLabel: 'github.com/sogekingdabest',
    phone: '666 219 440', // déjalo vacío ('') para no mostrarlo
    cvPdf: '', // ruta a un PDF público del CV; vacío = no se muestra el botón
    note: 'Respuesta garantizada antes del próximo daily.'
  }
};
