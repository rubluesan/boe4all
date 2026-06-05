# Sistema de diseño UI - WIP

<p align="right"><a href="../README.md">Volver al README general</a></p>

<a id="readme-top"></a>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Tabla de Contenidos</summary>
  <ol>
    <li><a href="#mockups">Bocetos / Mockups</a></li>
    <li><a href="#philosophy">Filosofía de Diseño</a></li>
    <li><a href="#core-elements">Elementos Principales de la UI</a></li>
    <li><a href="#ux">Consistencia y Experiencia de usuario</a></li>
    <li><a href="#responsiveness">Responsividad</a></li>
</details>

<!-- Bocetos -->

<a id="mockups"></a>

## 1. Bocetos / Mockups

El diseño UI del proyecto parte de estos bocetos:

![Boceto Página principal](./img/home-mockup.png)

![Boceto Landing Page](./img/landing-mockup.png)

![Boceto Página Registro](./img/register-mockup.png)

![Boceto Página Login](./img/login-mockup.png)

![Boceto Apartado Sumario](./img/sumario-mockup.png)

![Boceto Apartado Disposicion](./img/disposition-mockup.png)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Filosofía -->

<a id="philosophy"></a>

## 2. Filosofía de Diseño: "Menos es más"

<p align="justify">
Para diseñar la interfaz de usuario he seguido la filosofía de "Menos es más". La idea es hacer una aplicación simple que muestre datos de manera limpia, así que he intentado crear un diseño consistente, intuitivo, limpio, suave y con bordes redondeados, que no distraiga al usuario de la lectura de información. Para conseguirlo, definí una serie de variables CSS en los estilos globales de aplicación, en el documento "styles.css".

En este apartado resumo algunos detalles como la paleta de colores o sistema de espaciado.
En otros apartados veremos que también definí algunas clases para establecer el layout general, y asegurar la consistencia del diseño visual y la responsividad.

</p>

Puedes ver los estilos globales de la app al completo [aquí](../src/styles.css)

Justo abajo muestro algunas variables que definí a nivel de raíz del proyecto `:root` en `styles.css`:

### Resumen Paleta de Colores

| Rol        | Valor (hex) | Variable CSS   |
| ---------- | ----------- | -------------- |
| Primario   | `#33786e`   | `--primary`    |
| Secundario | `#ffd54f`   | `--secondary`  |
| Background | `#f8fafc`   | `--background` |
| Superficie | `#ffffff`   | `--surface`    |
| Texto      | `#1e293b`   | `--text-main`  |
| Borde      | `#e2e8f0`   | `--border`     |

### Variables de espaciado (padding, margin, gap, etc.)

| Variable        | Valor             | Uso                 |
| --------------- | ----------------- | ------------------- |
| `--spacing-xs`  | `4px` / `0.25rem` | Gaps pequeños       |
| `--spacing-sm`  | `8px` / `0.5rem`  | Gaps iconos, inline |
| `--spacing-md`  | `16px` / `1rem`   | Padding estándar    |
| `--spacing-lg`  | `24px` / `1.5rem` | Padding de sección  |
| `--spacing-xl`  | `32px` / `2rem`   | Gaps grandes        |
| `--spacing-xxl` | `48px` / `3rem`   | Margenes de sección |

### Sombras suaves y bordes redondeados

Aquí muestro un ejemplo de una sombra y un border-radius definidos:

| Variable      | Valor                           | Uso                    |
| ------------- | ------------------------------- | ---------------------- |
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Sombras pequeñas       |
| `--radius-md` | `12px`                          | Border-radius estándar |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Elementos UI core -->

<a id="core-elements"></a>

## 3. Elementos Principales de la UI

<p align="justify">
La UI consiste en que cuando abres por la página primero te lleva a la landing page la cual explica un poco la funcionalidad de la página y te permite tanto inciar sesión como registrarte para poder usar la página web.

Al iniciar sesión nos lleva al componente home el cual consiste en una página como de inicio en la cual puedes observar los distintos apartados de la página: como un input de tipo fecha la cual podrás seleccionar una para poder visualizar el BOE de una fecha en concreto, ver las distintas carpetas del usuario, etc..

Al buscar una fecha en el input te aparecerá el sumario del BOE de ese día,con toda la información que este conlleva separandote en tarjetas cada dato que contiene datos relevantes los cuales son clicables y te llevan a otra página con el pdf embebido y un asistente de IA para cualquier duda sobre esa normativa, cabe recalcar que en esa página también puedes descargarte los pdfs en el enlace que pone descargar pdf,Si le damos al enlace ver oficial nos llevará a la página oficial del boe de ese apartado, algo que no he mencionado es la existencia de los breadcrums los cuales están en toda la página web y nos permiten saber en donde estamos y volver atrás en cualquier momento.

En la página de sumario del BOE con la fecha tendremos 2 o 3 enlaces los cuales són descargar oficial, Anterior y Siguiente, descargar oficial te descarga el BOE al completo mientras que anterior te lleva al boe del día anterior o el primero que halla antes que el de la fecha otorgada debido a que los BOE no se realizan todos los dias mientras que siguiente hace lo mismo pero al reves y es por ello que digo que pueden haber 2 o 3 enlaces debido a que si estamos en el ultimo BOE publicado ese enlace no aparecerá.
</p>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- UX -->

<a id="ux"></a>

## 4. Consistencia y Experiencia de usuario

<p align="justify">
Para mantener consistencia en la página hemos decidido usar una paleta de colores para toda la página con colores claros y agradables más el añadido de sombras si quieres versus valores dirijase al apartado 2 Resumen de la paleta de colores.

### Fuente y Comportamiento del scroll

```CSS
html {
  font-size: 16px;
}

body {
  font-family: verdana, sans-serif;
  background-color: var(--background);
  color: var(--text-main);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
```

### Consistencia de clicables
```CSS
button,
select,
a {
  cursor: pointer;
}

a {
  text-decoration: none;
}
```
### Consistencia de botones
```CSS
.btn {
  appearance: none;
  border: 2px solid transparent;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9375rem;
  min-height: 48px;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  user-select: none;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #e01616;
}

.btn-outline {
  background: transparent;
  border-color: var(--border);
  color: var(--text-main);
}

.btn-outline:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}
```
### Consistencia de los iconos 
```CSS
.icon-primary {
  color: var(--primary);
}

.icon-sm {
  width: 16px;
  height: 16px;
}

.icon-md {
  width: 24px;
  height: 24px;
}

.icon-lg {
  width: 32px;
  height: 32px;
}

.icon-xl {
  width: 48px;
  height: 48px;
} 
```
### Consistencia iconos lucide 
```CSS
lucide-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.smooth-transition {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.validation-error {
  color: #ef4444;
}
.validation-error-list {
  list-style: none;
}
```
### Consistencia Avatares
```CSS
.avatar-container {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
  background: var(--primary-light);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.avatar-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-lg {
  width: clamp(80px, 20vw, 110px);
  height: clamp(80px, 20vw, 110px);
  font-size: 3rem;
  border: 4px solid var(--surface);
  outline: 1px solid var(--border);
} 
```
### Animación para cargas
```CSS
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
```
</p>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- UX -->

<a id="responsiveness"></a>

## 5. Responsividad

<p align="justify">
Para la responsividad de la página hemos utilizado estas estructuras CSS:

### Tipografía fluida
``` CSS
h1 {
  /* Móvil: 1.75rem (28px) -> Escala -> Escritorio: 2.75rem (44px) */
  font-size: clamp(1.75rem, 5vw, 2.75rem);
  /* Bajamos de 900 a 700 (Bold). Sigue siendo un título fuerte pero elegante */
  font-weight: 700;
  /* Suavizamos el tracking negativo para que no se peguen las letras */
  letter-spacing: -0.02em;
  line-height: 1.15; /* Importante para que los títulos de varias líneas no se encabalguen */
}

h2 {
  /* Móvil: 1.4rem (22.4px) -> Escala -> Escritorio: 2rem (32px) */
  font-size: clamp(1.4rem, 4vw, 2rem);
  /* Bajamos de 800 a 600 (Semi Bold) */
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

h3 {
  /* Móvil: 1.15rem (18.4px) -> Escala -> Escritorio: 1.5rem (24px) */
  font-size: clamp(1.15rem, 3vw, 1.5rem);
  /* Peso normal/medio tirando a bold, suficiente para un H3 */
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.25;
} 
```
### Containers responsivos
```CSS
.container {
  width: 100%;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-md);
}

@media (min-width: 768px) {
  .container {
    max-width: 720px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1140px;
  }
}

.container-fluid {
  width: 100%;
  margin: 0 auto;
  padding: clamp(var(--spacing-sm), 2vw, var(--spacing-md))
    clamp(var(--spacing-md), 4vw, var(--spacing-xxl));
} 
```
### Grids responsive 
```CSS
.responsive-grid {
  display: grid;
  gap: var(--spacing-lg);
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .responsive-grid {
    grid-template-columns: repeat(4, 1fr);
  }
} 
```
</p>

<p align="right">(<a href="#readme-top">back to top</a>)</p>
