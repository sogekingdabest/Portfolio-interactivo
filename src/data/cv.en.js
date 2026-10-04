/* ============================================================
   CV DATA — ENGLISH
   Keep in sync with src/data/cv.es.js.
   ============================================================ */
const GH = 'https://github.com/sogekingdabest';

export default {
  hero: {
    name: 'Daniel Olañeta Fariña',
    shortName: 'Dani',
    title: 'Software Engineer',
    klass: 'Backend Artificer',
    tagline: 'Backend · Digital identity · Microservices',
    startDate: '2023-06-05',
    facts: [
      ['Class', 'Backend Artificer'],
      ['Guild', 'NTT DATA'],
      ['Background', 'Computer Engineer (UDC)'],
      ['Homeland', 'Galicia, Spain'],
      ['Alignment', 'Lawful good: writes the tests']
    ],
    bio: [
      'Computer engineer with over three years at NTT DATA, where I went from intern to Software Engineer. Backend is my home turf: Java, the Spring ecosystem, microservices and APIs.',
      'I currently run the technical side of a public-health CRM platform: technical analysis, incident resolution, development, and the configuration of its deployment on OKD with Helm.',
      'Before that I worked on digital identity and authentication (OAuth 2.0, OpenID4VC, verifiable credentials and a fair amount of cryptography) and was the technical lead on a social services platform.',
      'Outside work I keep building: an archive for tabletop RPG campaigns with local AI, an Android app with on-device AI and, well, this island.'
    ],
    abilities: [
      { abbr: 'STR', name: 'Backend', detail: 'Java · Spring' },
      { abbr: 'DEX', name: 'DevOps', detail: 'Docker · OKD · Helm' },
      { abbr: 'CON', name: 'Quality', detail: 'JUnit · Mockito' },
      { abbr: 'INT', name: 'Security', detail: 'OAuth · OpenID4VC · PKI' },
      { abbr: 'WIS', name: 'Analysis', detail: 'Technical analysis & design' },
      { abbr: 'CHA', name: 'Communication', detail: 'Mentoring & teamwork' }
    ],
    passives: [
      ['Technical lead', 'Analyses, designs and breaks down features for the team to build.'],
      ['Mentoring', 'Assigns and guides the work of junior engineers, and transfers knowledge.'],
      ['Clear communication', 'Translates between technical and business profiles.'],
      ['Problem solving', 'Debugs locally, reads the logs and gets to the root cause.'],
      ['Continuous learning', 'From interoperability to social services, digital identity and healthcare.'],
      ['Agile teamwork', 'Sprints, requirement refinement and technical prioritisation.']
    ]
  },

  quests: [
    {
      name: 'Public-health CRM platform',
      rank: 'epic',
      role: 'Software Engineer · Technical lead',
      company: 'NTT DATA',
      client: 'Public sector',
      period: 'Sep 2026 — present',
      current: true,
      summary:
        'The CRM platform of a public health service, built on SuiteCRM and ehCOS, with ActiveMQ messaging.',
      points: [
        'Technical analysis of the platform and of new requirements.',
        'Resolving the incidents that arrive through the support ticketing platform.',
        'Development in Java 8 and PHP.',
        "Configuration of the platform's deployment on OKD with Helm.",
        'Assigning and following up tasks for a junior engineer.'
      ],
      tech: ['SuiteCRM', 'ehCOS', 'Java 8', 'PHP', 'ActiveMQ', 'OKD (OpenShift)', 'Helm', 'Kubernetes']
    },
    {
      name: 'Digital identity & verifiable credentials',
      rank: 'legendary',
      role: 'Software Engineer',
      company: 'NTT DATA',
      client: 'Public sector',
      period: 'Feb 2026 — Aug 2026',
      summary:
        "A digital identity platform for a public administration: citizens' identity, credentials and official documents, with secure interoperability across public bodies and European standards.",
      points: [
        'Microservices and REST APIs in Java 17 and Python, with OpenAPI contracts.',
        'Authentication, and issuing and validating tokens and digital credentials, on OAuth 2.0 and OpenID4VC.',
        'Cryptographic validation of signatures and certificates: trust chains and revocation.',
        'Unit and integration testing on critical services.'
      ],
      tech: ['Java 17', 'Python 3', 'Spring Security', 'OAuth 2.0', 'OpenID4VC', 'DPoP', 'SD-JWT VC', 'mDoc', 'OpenAPI', 'JUnit']
    },
    {
      name: 'Social services platform',
      rank: 'epic',
      role: 'Software Engineer · Technical lead',
      company: 'NTT DATA',
      client: 'Public sector',
      period: 'Nov 2024 — Jan 2026',
      summary: 'Social-services management applications for a public administration.',
      levelUp: 'Level up: promoted to Software Engineer in March 2025.',
      points: [
        'Technical analysis, design and development of Java microservices and their APIs.',
        'Frontend in Angular and persistence in Oracle.',
        'Testing with JUnit and Mockito, and deployments with Jenkins on OpenShift (ROSA).',
        'Incident resolution.',
        'Technical lead for the application: analysis and design of features for the rest of the team.'
      ],
      tech: ['Java 8', 'Spring Boot', 'Spring Data JPA', 'Angular', 'Oracle', 'H2', 'Jenkins', 'OpenShift (ROSA)', 'JUnit', 'Mockito']
    },
    {
      name: 'Interoperability portal',
      rank: 'rare',
      role: 'Junior Software Engineer',
      company: 'NTT DATA',
      client: 'Public sector',
      period: 'Jun 2023 — Aug 2024',
      summary: "A portal to manage and configure a public administration's interoperability node.",
      points: [
        'Backend enhancements and maintenance in Java 8 and 11, with REST and SOAP APIs.',
        'Automated unit tests with JUnit and Mockito.',
        'Analysis and documentation of new features.',
        'Python scripts to automate processes.',
        'User support.'
      ],
      tech: ['Java 7 / 8 / 11', 'Spring', 'Hibernate', 'Oracle', 'SQL', 'Docker', 'Python 3', 'JUnit', 'Mockito']
    },
    {
      name: 'Internships',
      rank: 'common',
      role: 'Software Engineering Intern',
      company: 'NTT DATA · Denodo',
      client: '',
      period: '2021 — 2023',
      summary: 'Two internships before joining NTT DATA.',
      levelUp: 'Quest complete: hired as Junior Software Engineer in June 2023.',
      points: [
        'NTT DATA (Feb — May 2023): backend of the interoperability portal: APIs, tests and bug fixing in Java.',
        'Denodo (Sep — Dec 2021): internship during my degree at a data virtualisation company.'
      ],
      tech: ['Java', 'Spring', 'Hibernate', 'Oracle']
    }
  ],

  // No levels: skills are grouped by where I have used them.
  skills: [
    {
      group: 'In production',
      school: 'High magic',
      note: 'What I use or have used on professional projects.',
      sets: [
        ['Backend', ['Java (7 → 17)', 'Spring Boot', 'Spring Security', 'Spring Data JPA', 'Hibernate / JPA', 'REST & SOAP APIs', 'OpenAPI / Swagger', 'Microservices', 'Python', 'PHP · SuiteCRM', 'ActiveMQ']],
        ['Identity & security', ['OAuth 2.0', 'OpenID4VC', 'DPoP', 'JWT / JWS', 'COSE', 'X.509 · PKIX', 'SD-JWT VC', 'mDoc']],
        ['Data', ['Oracle', 'SQL', 'H2']],
        ['DevOps', ['Docker', 'Jenkins', 'OpenShift (OKD / ROSA)', 'Kubernetes', 'Helm', 'Git']],
        ['Frontend', ['Angular', 'TypeScript']],
        ['Quality & method', ['JUnit', 'Mockito', 'Agile / Scrum']]
      ]
    },
    {
      group: 'In personal projects',
      school: 'Arcane arts',
      note: 'What I have learned building on my own. The code is in the Forge.',
      sets: [
        ['Backend', ['Java 21', 'FastAPI', 'Keycloak']],
        ['Data', ['PostgreSQL', 'pgvector']],
        ['Frontend & mobile', ['React', 'Kotlin', 'Jetpack Compose']],
        ['AI & machine learning', ['RAG', 'Local LLMs (Ollama)', 'On-device AI (LiteRT, TFLite)', 'NLP (GLiNER, spaCy)', 'Computer vision (TensorFlow, Keras)']],
        ['DevOps', ['GitHub Actions', 'Docker Compose', 'Kustomize']],
        ['Quality', ['pytest', 'Playwright']]
      ]
    }
  ],

  education: [
    {
      degree: "Master's Degree in Computer Engineering",
      school: 'University of A Coruña',
      period: '2022 — 2026',
      note: 'Completed while working at NTT DATA.'
    },
    {
      degree: "Bachelor's Degree in Computer Engineering",
      school: 'University of A Coruña',
      period: '2018 — 2022',
      note: 'Specialisation in Computing.'
    },
    {
      degree: 'Higher Technician in Network Systems Administration',
      school: 'IES Chan do Monte',
      period: '2016 — 2018',
      note: 'Vocational degree: networks, systems and administration.'
    }
  ],

  projects: [
    {
      name: 'Codex of Realms',
      rank: 'legendary',
      status: 'v0.1.0-beta · Oct 2026',
      tagline: 'A shared archive for tabletop RPG campaigns: each player sees only what their character knows.',
      desc: 'Keeps session notes, characters and places together. The Game Master decides what each player can see, and questions are answered by citing the original passages. Everything runs locally, language models included.',
      highlights: [
        'Permission-aware RAG: the backend filters sources before ranking results.',
        'The server copies the original text into the answer, so citations are verifiable.',
        'Document processing with persistent jobs and retries.',
        'CI, backend and frontend tests, and architecture documentation.'
      ],
      tech: ['Java 21', 'Spring Boot', 'React', 'TypeScript', 'PostgreSQL', 'pgvector', 'Keycloak', 'Ollama', 'Docker Compose'],
      links: [['GitHub', `${GH}/codex-of-realms`]]
    },
    {
      name: 'Habitly',
      rank: 'epic',
      status: 'v1.0.4',
      tagline: 'Android household organiser with an AI assistant that works offline.',
      desc: 'An app to coordinate a household: real-time shopping list and pantry, shared routines with fair rotation, notes and an assistant that runs entirely on the device.',
      highlights: [
        '100% on-device inference with LiteRT-LM and downloadable Gemma models.',
        'Clean Architecture + MVI in feature modules.',
        'Multi-user sync with Firebase Auth and Firestore.',
        'Home-screen widget, launcher shortcuts and notifications.'
      ],
      tech: ['Kotlin', 'Jetpack Compose', 'Material 3', 'Hilt', 'Room', 'Firebase', 'Coroutines / Flow', 'LiteRT-LM'],
      links: [['GitHub', `${GH}/Habitly`]]
    },
    {
      name: 'SkinCare ML',
      rank: 'epic',
      status: 'Experimental · educational project',
      tagline: "The training and export pipeline behind SkinCare's skin-lesion classifier.",
      desc: 'Trains a multimodal binary classifier based on EfficientNetV2-B0 that combines the dermoscopic image with three metadata values (approximate age, sex and anatomical site) and exports it to TensorFlow Lite. Not a medical device.',
      highlights: [
        'Two-phase transfer learning: training with cosine decay, then fine-tuning the last 50 layers.',
        'Focal loss for a heavily imbalanced dataset; the threshold is chosen on validation and metrics come from a separate test split.',
        'Model card covering intended use, known limitations and ethical considerations.',
        'Training on Kaggle with fixed seeds, and a Keras / TFLite parity check before any model is released.'
      ],
      tech: ['Python', 'TensorFlow', 'Keras', 'EfficientNetV2', 'TensorFlow Lite', 'Kaggle', 'Jupyter'],
      links: [['GitHub', `${GH}/skincare-ml`]]
    },
    {
      name: 'SkinCare AI',
      rank: 'rare',
      status: 'Educational project',
      tagline: 'Mole analysis on your phone, combining an AI model with the ABCDE criteria.',
      desc: 'An Android app that analyses skin lesions on the device with an EfficientNetV2-B0 model and automated ABCDE criteria. Not a medical device.',
      highlights: [
        'Model trained on the SIIM-ISIC dataset and quantised for mobile.',
        '100% local analysis: images never leave the device.',
        'Real-time capture guides and a body map to locate each mole.',
        'History and evolution tracking for each mole.'
      ],
      tech: ['Kotlin', 'TensorFlow Lite', 'OpenCV', 'CameraX', 'Firebase', 'Material Design 3'],
      links: [['GitHub', `${GH}/SkinCareApp`]]
    },
    {
      name: 'LoreCrafter NER',
      rank: 'rare',
      status: 'Extraction engine',
      tagline: 'Automatic entity extraction for fantasy and mythology lore.',
      desc: 'Turns narrative text (fantasy novels, D&D wikis, tabletop material) into a structured database of characters, factions, places, artefacts and races.',
      highlights: [
        'Multi-model inference: BERT, DeBERTa-v3 and GLiNER.',
        'Dataset built with scraping and LLM pre-annotation (Groq / Llama 3).',
        'Fine-tuning with experiment tracking in MLflow.',
        'REST API with FastAPI and PostgreSQL persistence.'
      ],
      tech: ['Python', 'PyTorch', 'Hugging Face', 'GLiNER', 'spaCy', 'FastAPI', 'PostgreSQL', 'MLflow', 'Docker'],
      links: [['GitHub', `${GH}/lorecrafter-ner`]]
    },
    {
      name: 'Portfolio RPG 3D',
      rank: 'secret',
      status: "You're in it",
      tagline: 'This very world.',
      desc: 'A playable 3D CV: a low-poly island generated entirely in code, with no external models or textures and no build step.',
      highlights: [],
      tech: ['Three.js', 'JavaScript', 'WebGL / GLSL', 'WebAudio'],
      links: [['GitHub', `${GH}/Portfolio-interactivo`]]
    }
  ],

  relics: {
    uno: {
      name: 'UNO Validator',
      year: '2021',
      desc: 'A validator for UNO games written with Lex and Bison: it checks that a transcribed game follows the rules.',
      tech: ['Lex', 'Bison / Yacc', 'C'],
      link: `${GH}/ValidadorUNOPL`,
      hint: 'At the end of the pier.'
    },
    lambda: {
      name: 'Lambda Calculus Interpreter',
      year: '2021',
      desc: 'A lambda calculus interpreter implemented in OCaml.',
      tech: ['OCaml'],
      link: `${GH}/Interprete-de-Lambda-Calculo`,
      hint: 'On top of the windmill hill.'
    },
    lightsout: {
      name: 'The Lights Out Puzzle',
      year: '2021',
      desc: 'Encoder and solver for the Lights Out puzzle: a Java encoder states the problem and telingo (temporal logic programming) solves it while minimising toggles.',
      tech: ['Java', 'ASP / telingo', 'Python'],
      link: `${GH}/The-Lights-Out-Puzzle`,
      hint: 'Behind the Guild.'
    },
    lung: {
      name: 'Lung Nodule Detection',
      year: '2024',
      desc: 'Lung nodule detection with classic computer vision: histogram equalisation, lung segmentation and morphological operations.',
      tech: ['Python', 'Computer vision'],
      link: `${GH}/LungNoduleDetection`,
      hint: 'On the eastern beach, past the Forge.'
    },
    unreal: {
      name: 'Decal Building Collision',
      year: '2021',
      desc: 'A collision system for placing buildings in a video game: C++ for Unreal Engine, with "ghost" materials that show whether you can build.',
      tech: ['C++', 'Unreal Engine'],
      link: `${GH}/DecalBuildingCollision`,
      hint: 'Behind the Lighthouse, at the cliff edge.'
    },
    k8s: {
      name: 'k8s-portafolio',
      year: '2026',
      desc: 'Deploying a Spring Boot application to Kubernetes with Kustomize: a base plus overlays for development and production.',
      tech: ['Kubernetes', 'Kustomize', 'Spring Boot'],
      link: `${GH}/k8s-portafolio`,
      hint: 'In the western woods.'
    }
  },

  contact: {
    email: 'daniolanetafarina@gmail.com',
    linkedin: 'https://www.linkedin.com/in/dani-olañeta-fariña',
    linkedinLabel: 'linkedin.com/in/dani-olañeta-fariña',
    github: GH,
    githubLabel: 'github.com/sogekingdabest',
    phone: '',
    cvPdf: '',
    note: 'Reply guaranteed before the next daily stand-up.'
  }
};
