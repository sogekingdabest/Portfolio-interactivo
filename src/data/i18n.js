/* ============================================================
   TEXTOS DE INTERFAZ, NOMBRES Y DIÁLOGOS (ES / EN)
   ============================================================ */

const es = {
  meta: { island: 'Isla de Brigantia' },
  title: {
    kicker: 'Un currículum jugable',
    role: 'Software Engineer',
    game: 'Portfolio RPG',
    play: 'Comenzar aventura',
    quick: 'Ver el CV sin jugar',
    hintDesktop: 'WASD o flechas para moverte · E para hablar · arrastra para girar la cámara',
    hintTouch: 'Joystick para moverte · toca para caminar · arrastra para girar la cámara',
    loading: 'Levantando la isla…'
  },
  hud: {
    level: 'Nv.',
    explored: 'Isla explorada',
    quest: 'Misión principal',
    questTitle: 'La leyenda de Dani',
    relics: 'Reliquias',
    travel: 'Viajar',
    menu: 'Menú',
    sound: 'Efectos de sonido',
    music: 'Música',
    night: 'Día / noche',
    lang: 'Idioma: español. Cambiar a inglés',
    talk: 'Hablar con',
    open: 'Abrir cofre',
    pet: 'Acariciar a',
    read: 'Leer el poste',
    next: 'Continuar',
    help: 'WASD / flechas: moverse · E: interactuar · M: menú · Arrastrar: cámara · Rueda: zoom',
    helpTouch: 'Joystick: moverse · A: interactuar · Arrastrar: cámara · Pellizcar: zoom'
  },
  zones: {
    hero: ['Plaza de Brigantia', 'Sobre mí'],
    quests: ['Gremio de Ingenieros', 'Experiencia'],
    skills: ['Faro Arcano', 'Habilidades'],
    education: ['Academia de Brigantia', 'Formación'],
    forge: ['La Forja', 'Proyectos personales'],
    contact: ['Taberna del Token', 'Contacto']
  },
  questSteps: {
    hero: 'Habla con Breogán en la plaza',
    quests: 'Consulta el registro del Gremio',
    skills: 'Sube al Faro Arcano',
    education: 'Visita la Academia',
    forge: 'Inspecciona la Forja',
    contact: 'Pide el contacto en la Taberna'
  },
  npcs: {
    guide: 'Breogán',
    guildmaster: 'Maestre Roi',
    mage: 'Archimaga Uxía',
    scholar: 'Erudito Xoán',
    smith: 'Antía la Forjadora',
    innkeeper: 'Brais el Tabernero',
    cat: 'Null',
    relic: 'Reliquia encontrada',
    narrator: 'Crónica',
    signpost: 'Poste indicador'
  },
  tabs: {
    hero: 'Personaje',
    quests: 'Misiones',
    skills: 'Habilidades',
    education: 'Formación',
    forge: 'Forja',
    contact: 'Contacto',
    log: 'Logros'
  },
  panel: {
    heroTitle: 'Ficha de personaje',
    questsTitle: 'Registro de misiones',
    skillsTitle: 'Grimorio de habilidades',
    educationTitle: 'Pergaminos de formación',
    forgeTitle: 'Expositor de la Forja',
    contactTitle: 'Pergamino de contacto',
    logTitle: 'Logros y reliquias',
    background: 'Trasfondo',
    abilities: 'Atributos',
    passives: 'Rasgos pasivos',
    experience: (y, m) => `${y} ${y === 1 ? 'año' : 'años'}${m ? ` y ${m} ${m === 1 ? 'mes' : 'meses'}` : ''} de aventura profesional`,
    current: 'En curso',
    completed: 'Completada',
    client: 'Cliente',
    questsIntro: 'Misiones principales: mi experiencia profesional, de la más reciente a la primera.',
    skillsIntro: 'Sin barras de nivel: el grimorio está ordenado por dónde he usado cada tecnología.',
    forgeIntro: 'Proyectos personales forjados fuera del horario de gremio. El código está en GitHub.',
    educationIntro: 'Los pergaminos que acreditan la formación del héroe.',
    contactIntro: '¿Tienes una misión para Dani? Elige canal.',
    highlights: 'Lo destacable',
    email: 'Correo',
    phone: 'Teléfono',
    copy: 'Copiar',
    copied: '¡Copiado!',
    write: 'Escribir',
    call: 'Llamar',
    openLink: 'Abrir',
    downloadCv: 'Descargar CV en PDF',
    achievements: 'Logros',
    relicsTitle: 'Reliquias: proyectos de otra época',
    relicLocked: 'Sin descubrir',
    progress: 'Progreso de la aventura',
    visited: 'Guardianes visitados',
    found: 'Reliquias encontradas',
    reset: 'Reiniciar progreso',
    resetConfirm: '¿Borrar el progreso guardado y empezar de cero?',
    viewCode: 'Ver código',
    close: 'Cerrar',
    locked: 'Bloqueado'
  },
  ranks: { legendary: 'Legendaria', epic: 'Épica', rare: 'Rara', common: 'Común', secret: 'Secreta' },
  achievements: {
    first_steps: ['Primeros pasos', 'Has desembarcado en la Isla de Brigantia.'],
    talk_all: ['Cronista', 'Has hablado con los seis guardianes de la isla.'],
    chests_all: ['Arqueólogo de repositorios', 'Has encontrado las seis reliquias.'],
    night: ['Deploy nocturno', 'Has hecho de noche. En producción no, ¿verdad?'],
    cat: ['NullPointerException evitada', 'Has acariciado a Null y nada ha explotado.'],
    polyglot: ['Políglota', 'Has cambiado de idioma.'],
    fast: ['Atajo de teclado', 'Has usado el viaje rápido.'],
    contact: ['Misión aceptada', 'Has abierto un canal de contacto con Dani.']
  },
  toast: {
    achievement: 'Logro desbloqueado',
    discovered: 'Capítulo descubierto',
    questDone: 'Misión principal completada'
  },
  dialogs: {
    guide: [
      '¡Bienvenido a la Isla de Brigantia, viajero! Soy Breogán. Dicen que levanté aquel faro… pero hoy solo hago de guía.',
      'Esta isla guarda la historia de DANI OLAÑETA, ingeniero de software. Cada edificio custodia un capítulo de su currículum.',
      'El Gremio guarda su experiencia; el Faro, sus habilidades; la Academia, su formación; la Forja, sus proyectos; y la Taberna… la forma de dar con él.',
      'Empieza por su ficha de personaje. Y si tienes prisa, pulsa M: el menú lo enseña todo sin dar un solo paso.'
    ],
    guideAgain: ['¿Otra vez por aquí? Toma, la ficha de personaje de Dani.'],
    guildmaster: [
      '¡Alto ahí! …Ah, vienes a consultar el registro. Soy el Maestre Roi, del Gremio de Ingenieros.',
      'Aquí anotamos cada misión de Dani en NTT DATA. Entró de becario y hoy es Software Engineer.',
      'Ahora lleva la parte técnica de una plataforma CRM de sanidad pública. Y antes completó una misión de rango LEGENDARIO: identidad digital para el sector público. Pasa y lee.'
    ],
    guildmasterAgain: ['El registro de misiones sigue abierto para ti.'],
    mage: [
      'Shhh… ¿lo oyes? Es el zumbido de la JVM. Soy la Archimaga Uxía, guardiana del Faro.',
      'Aquí arriba catalogamos los conjuros de Dani. Java y Spring son su magia mayor, pero últimamente estudia artes más arcanas: OAuth, OpenID4VC, criptografía…',
      'Abre el grimorio: está ordenado por dónde ha usado cada conjuro.'
    ],
    mageAgain: ['El grimorio no muerde. Casi nunca.'],
    scholar: [
      'Ah, un visitante con sed de conocimiento. Erudito Xoán, para servirte.',
      'Dani pasó por las aulas tres veces: un ciclo superior de sistemas, el grado en Ingeniería Informática y el máster.',
      'El máster lo sacó mientras trabajaba. No me preguntes cuándo dormía. Aquí tienes sus pergaminos.'
    ],
    scholarAgain: ['Los pergaminos siguen en su sitio. Y yo también.'],
    smith: [
      '¡Cuidado con las chispas! Soy Antía. Aquí no forjamos espadas: forjamos proyectos.',
      'Todo lo que hay en el expositor lo hizo Dani en su tiempo libre: un archivo para campañas de rol con IA local, una app Android, modelos de machine learning…',
      'Échale un ojo. El código está en GitHub, por si quieres comprobar el filo.'
    ],
    smithAgain: ['¿Vienes a por más? El expositor está donde lo dejaste.'],
    innkeeper: [
      '¡Bienvenido a la Taberna del Token! Aquí solo se entra con credenciales válidas. Soy Brais.',
      '¿Buscas a Dani? Suele sentarse al fondo, con un café y el portátil.',
      'Si quieres proponerle una misión, aquí tienes su pergamino de contacto.'
    ],
    innkeeperAgain: ['¿Otra ronda? Aquí tienes otra vez el contacto de Dani.'],
    cat: ['Miau.', 'Null te mira fijamente. No lanza ninguna excepción.'],
    signpost: ['Norte: Gremio (experiencia). Este: Faro (habilidades). Oeste: Academia (formación). Sureste: Forja (proyectos). Suroeste: Taberna (contacto). Sur: muelle.'],
    ending: [
      'Has recorrido toda la isla y conoces la historia completa de Dani.',
      'Solo queda una misión por aceptar: escribirle. La recompensa es un buen ingeniero en tu equipo.'
    ],
    relicFound: (name) => `Has encontrado una reliquia: «${name}».`
  }
};

const en = {
  meta: { island: 'Isle of Brigantia' },
  title: {
    kicker: 'A playable résumé',
    role: 'Software Engineer',
    game: 'Portfolio RPG',
    play: 'Start adventure',
    quick: 'View the CV without playing',
    hintDesktop: 'WASD or arrows to move · E to talk · drag to rotate the camera',
    hintTouch: 'Joystick to move · tap to walk · drag to rotate the camera',
    loading: 'Raising the island…'
  },
  hud: {
    level: 'Lv.',
    explored: 'Island explored',
    quest: 'Main quest',
    questTitle: 'The legend of Dani',
    relics: 'Relics',
    travel: 'Travel',
    menu: 'Menu',
    sound: 'Sound effects',
    music: 'Music',
    night: 'Day / night',
    lang: 'Language: English. Switch to Spanish',
    talk: 'Talk to',
    open: 'Open chest',
    pet: 'Pet',
    read: 'Read the signpost',
    next: 'Continue',
    help: 'WASD / arrows: move · E: interact · M: menu · Drag: camera · Wheel: zoom',
    helpTouch: 'Joystick: move · A: interact · Drag: camera · Pinch: zoom'
  },
  zones: {
    hero: ['Brigantia Square', 'About me'],
    quests: ["Engineers' Guild", 'Experience'],
    skills: ['Arcane Lighthouse', 'Skills'],
    education: ['Brigantia Academy', 'Education'],
    forge: ['The Forge', 'Personal projects'],
    contact: ['The Token Tavern', 'Contact']
  },
  questSteps: {
    hero: 'Talk to Breogán in the square',
    quests: "Check the Guild's quest log",
    skills: 'Climb to the Arcane Lighthouse',
    education: 'Visit the Academy',
    forge: 'Inspect the Forge',
    contact: 'Ask for the contact at the Tavern'
  },
  npcs: {
    guide: 'Breogán',
    guildmaster: 'Master Roi',
    mage: 'Archmage Uxía',
    scholar: 'Scholar Xoán',
    smith: 'Antía the Smith',
    innkeeper: 'Brais the Innkeeper',
    cat: 'Null',
    relic: 'Relic found',
    narrator: 'Chronicle',
    signpost: 'Signpost'
  },
  tabs: {
    hero: 'Character',
    quests: 'Quests',
    skills: 'Skills',
    education: 'Education',
    forge: 'Forge',
    contact: 'Contact',
    log: 'Achievements'
  },
  panel: {
    heroTitle: 'Character sheet',
    questsTitle: 'Quest log',
    skillsTitle: 'Grimoire of skills',
    educationTitle: 'Scrolls of learning',
    forgeTitle: "The Forge's display",
    contactTitle: 'Contact scroll',
    logTitle: 'Achievements & relics',
    background: 'Background',
    abilities: 'Attributes',
    passives: 'Passive traits',
    experience: (y, m) => `${y} ${y === 1 ? 'year' : 'years'}${m ? ` and ${m} ${m === 1 ? 'month' : 'months'}` : ''} of professional adventuring`,
    current: 'In progress',
    completed: 'Completed',
    client: 'Client',
    questsIntro: 'Main quests: my professional experience, most recent first.',
    skillsIntro: 'No level bars: the grimoire is sorted by where I have used each technology.',
    forgeIntro: 'Personal projects forged outside guild hours. The code is on GitHub.',
    educationIntro: "The scrolls that certify the hero's training.",
    contactIntro: 'Got a quest for Dani? Pick a channel.',
    highlights: 'Highlights',
    email: 'Email',
    phone: 'Phone',
    copy: 'Copy',
    copied: 'Copied!',
    write: 'Write',
    call: 'Call',
    openLink: 'Open',
    downloadCv: 'Download CV as PDF',
    achievements: 'Achievements',
    relicsTitle: 'Relics: projects from another age',
    relicLocked: 'Undiscovered',
    progress: 'Adventure progress',
    visited: 'Guardians visited',
    found: 'Relics found',
    reset: 'Reset progress',
    resetConfirm: 'Delete saved progress and start over?',
    viewCode: 'View code',
    close: 'Close',
    locked: 'Locked'
  },
  ranks: { legendary: 'Legendary', epic: 'Epic', rare: 'Rare', common: 'Common', secret: 'Secret' },
  achievements: {
    first_steps: ['First steps', 'You landed on the Isle of Brigantia.'],
    talk_all: ['Chronicler', "You talked to the island's six guardians."],
    chests_all: ['Repo archaeologist', 'You found all six relics.'],
    night: ['Night deploy', 'You made it night-time. Not in production, right?'],
    cat: ['NullPointerException avoided', 'You petted Null and nothing blew up.'],
    polyglot: ['Polyglot', 'You switched language.'],
    fast: ['Keyboard shortcut', 'You used fast travel.'],
    contact: ['Quest accepted', 'You opened a contact channel with Dani.']
  },
  toast: {
    achievement: 'Achievement unlocked',
    discovered: 'Chapter discovered',
    questDone: 'Main quest complete'
  },
  dialogs: {
    guide: [
      "Welcome to the Isle of Brigantia, traveller! I'm Breogán. They say I raised that lighthouse… these days I'm just the guide.",
      'This island holds the story of DANI OLAÑETA, software engineer. Each building guards a chapter of his résumé.',
      'The Guild keeps his experience; the Lighthouse, his skills; the Academy, his education; the Forge, his projects; and the Tavern… the way to reach him.',
      'Start with his character sheet. And if you are in a hurry, press M: the menu shows everything without taking a single step.'
    ],
    guideAgain: ["Back again? Here, Dani's character sheet."],
    guildmaster: [
      "Halt! …Ah, you're here for the quest log. I'm Master Roi, of the Engineers' Guild.",
      "We record every quest Dani has taken at NTT DATA. He joined as an intern and he's a Software Engineer today.",
      'He now runs the technical side of a public-health CRM platform. Before that he completed a LEGENDARY quest: digital identity for the public sector. Come in and read.'
    ],
    guildmasterAgain: ['The quest log is still open for you.'],
    mage: [
      "Shhh… hear that? It's the hum of the JVM. I'm Archmage Uxía, keeper of the Lighthouse.",
      "Up here we catalogue Dani's spells. Java and Spring are his high magic, but lately he studies more arcane arts: OAuth, OpenID4VC, cryptography…",
      "Open the grimoire: it's sorted by where he has cast each spell."
    ],
    mageAgain: ["The grimoire doesn't bite. Almost never."],
    scholar: [
      'Ah, a visitor with a thirst for knowledge. Scholar Xoán, at your service.',
      "Dani passed through these halls three times: a vocational degree in systems, a bachelor's in Computer Engineering and a master's.",
      "He did the master's while working. Don't ask me when he slept. Here are his scrolls."
    ],
    scholarAgain: ['The scrolls are still in place. So am I.'],
    smith: [
      "Mind the sparks! I'm Antía. We don't forge swords here: we forge projects.",
      'Everything on display was made by Dani in his spare time: an archive for RPG campaigns with local AI, an Android app, machine learning models…',
      'Take a look. The code is on GitHub, in case you want to test the edge.'
    ],
    smithAgain: ['Back for more? The display is where you left it.'],
    innkeeper: [
      "Welcome to the Token Tavern! Valid credentials only. I'm Brais.",
      'Looking for Dani? He usually sits at the back, with a coffee and his laptop.',
      "If you've got a quest for him, here's his contact scroll."
    ],
    innkeeperAgain: ["Another round? Here's Dani's contact again."],
    cat: ['Meow.', 'Null stares at you. No exception is thrown.'],
    signpost: ['North: Guild (experience). East: Lighthouse (skills). West: Academy (education). South-east: Forge (projects). South-west: Tavern (contact). South: pier.'],
    ending: [
      "You've walked the whole island and you know Dani's full story.",
      'Only one quest remains: write to him. The reward is a good engineer on your team.'
    ],
    relicFound: (name) => `You found a relic: "${name}".`
  }
};

export const I18N = { es, en };
