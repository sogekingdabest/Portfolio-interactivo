# Portfolio RPG 3D — Dani Olañeta

Mi currículum como un pequeño RPG en 3D: una isla low-poly donde cada edificio guarda un capítulo del CV.

**Jugar:** https://sogekingdabest.github.io/Portfolio-interactivo/

| Lugar | Contenido |
| --- | --- |
| Plaza de Brigantia | Sobre mí (ficha de personaje) |
| Gremio de Ingenieros | Experiencia profesional |
| Faro Arcano | Habilidades |
| Academia de Brigantia | Formación |
| La Forja | Proyectos personales |
| Taberna del Token | Contacto |

Además hay seis cofres escondidos con proyectos antiguos, logros, ciclo día/noche y versión en inglés. Quien tenga prisa puede pulsar **M** (o «Ver el CV sin jugar») y leerlo todo desde el menú.

## Controles

| Acción | Teclado y ratón | Táctil |
| --- | --- | --- |
| Moverse | WASD / flechas, o clic en el suelo | Joystick, o tocar el suelo |
| Interactuar | E / Espacio / Enter, o clic en el personaje | Botón A |
| Cámara | Arrastrar · rueda para zoom | Arrastrar · pellizcar |
| Menú | M / Tab (1–7 cambia de pestaña) | Botón Menú |
| Día / noche | N | Botón ☀ |

## Ejecutar en local

No hay paso de build ni dependencias: son módulos ES servidos tal cual. Solo hace falta un servidor estático (los módulos no cargan desde `file://`).

```bash
npm start
```

Abre http://localhost:5173. Cualquier otro servidor estático sirve igual.

## Actualizar el CV

Todo el contenido está en `src/data/`:

- `cv.es.js` y `cv.en.js`: experiencia, habilidades, formación, proyectos, reliquias y contacto.
- `i18n.js`: textos de interfaz, nombres y diálogos de los personajes.

El nivel del personaje se calcula solo a partir de `hero.startDate`.

## Estructura

```
index.html          página y HUD
css/style.css       interfaz
src/main.js         arranque
src/engine/         kit low-poly, cámara, entrada, audio, partículas
src/world/          terreno, edificios, personajes, iluminación y layout de la isla
src/game/           bucle de juego, HUD, diálogos y ventana del CV
src/data/           contenido del CV y textos (ES / EN)
vendor/three/       Three.js (MIT)
assets/og.jpg       imagen de vista previa al compartir el enlace
```

Todo el mundo se genera por código: no hay modelos, texturas ni ficheros de audio. La distribución de la isla (edificios, caminos, cofres) está en `src/world/layout.js`.

## Despliegue

GitHub Pages publica la rama `main` directamente, sin build.

## Créditos

Hecho con [Three.js](https://threejs.org/) (licencia MIT, incluida en `vendor/three/`).
