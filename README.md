# 🌍 Country Quiz

Una aplicación web interactiva de preguntas sobre países, desarrollada como parte del reto **Country Quiz** de [DevChallenges.io](https://devchallenges.io/).  
Permite al usuario poner a prueba sus conocimientos sobre banderas, capitales y otros datos de países, obtenidos en tiempo real desde la API **REST Countries**.

---

## 📸 Capturas de pantalla

### Pantalla principal (Intro)
![Intro Screenshot](./src/assets/screenshots/intro.png)

### Pantalla de preguntas
![Quiz Screenshot](./src/assets/screenshots/quiz.png)

### Resultados
![Results Screenshot](./src/assets/screenshots/results.png)

---

## 🏆 Características

- 🎯 Genera **10 preguntas** por defecto con 4 opciones cada una.  
- 🚩 Preguntas sobre **banderas, capitales, regiones y más** (rotación de modos).  
- ✅ Feedback inmediato: respuesta correcta/incorrecta al instante.  
- 🔢 Navegación libre entre preguntas mediante burbujas numeradas.  
- 📊 Barra de progreso y contador de aciertos.  
- 🎉 Pantalla final de felicitaciones con el resultado y opción de jugar otra vez.  
- 📱 Diseño **responsive** y accesible.  
- 🌐 Datos en vivo desde [REST Countries API](https://restcountries.com/).

---

## 🛠️ Stack Tecnológico

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)  
- HTML5 + CSS3 (con variables y archivos organizados en `/styles`)  
- Fetch API para consumo de datos  
- Arquitectura modular con separación en:
  - `/components` (UI reusable)  
  - `/pages` (pantallas: Intro, Quiz, Results)  
  - `/services` (integración con la API)  
  - `/utils` (helpers como modos y shuffle)  
  - `/styles` (tokens, base y componentes)

---

## 📂 Estructura de proyecto

```bash
src/
 ├─ assets/           # imágenes y recursos
 ├─ components/       # UI: Bubble, OptionItem, ProgressBar, etc.
 ├─ pages/            # Intro, Quiz, Results
 ├─ services/         # countriesApi.js (API REST Countries)
 ├─ utils/            # modos de preguntas, shuffle de opciones
 ├─ styles/           # tokens, base.css, components.css
 ├─ App.jsx           # rutas principales
 ├─ main.jsx          # punto de entrada de React
```

---

## ⚙️ Instalación y ejecución

Clonar este repositorio e instalar dependencias:

```bash
git clone https://github.com/tuusuario/paises-quiz.git
cd paises-quiz
npm install
```

Ejecutar en modo desarrollo:

```bash
npm run dev
```

Compilar para producción:

```bash
npm run build
```

Previsualizar compilado:

```bash
npm run preview
```

---

## 🌐 Demo en línea

👉 [Ver demo desplegada](https://country-quiz-pink.vercel.app/https://tu-demo.vercel.app/)  
👉 [Repositorio en GitHub](https://github.com/tuusuario/paises-quiz)

---

## ✅ Requisitos del reto cumplidos

- [x] Crear un cuestionario que coincida con el diseño dado.  
- [x] Generar 10 preguntas predeterminadas desde la API.  
- [x] Mostrar 4 opciones por pregunta.  
- [x] Feedback inmediato al seleccionar respuesta.  
- [x] Navegación libre entre preguntas.  
- [x] Página de felicitaciones con el resultado.  
- [x] Opción de jugar de nuevo.  
- [x] Deploy con URL pública y repositorio documentado.  

---

## ♿ Accesibilidad y Responsividad

- `role="radiogroup"` y `role="radio"` para opciones.  
- `aria-checked` dinámico para lectores de pantalla.  
- Imágenes de banderas con atributo `alt`.  
- Diseño responsive mobile-first, probado en pantallas pequeñas y grandes.  

---

## 📡 API utilizada

[REST Countries API](https://restcountries.com/)  

- Endpoint principal usado:  
  ```
  https://restcountries.com/v3.1/all?fields=name,flags
  ```
- Campos adicionales para otros modos:  
  ```
  https://restcountries.com/v3.1/all?fields=name,flags,capital,region,subregion,currencies,languages
  ```

---

## 🚀 Mejoras futuras

- Selector inicial de **modo de juego** (banderas, capitales, regiones).  
- Revisión de respuestas al terminar.  
- Timer por pregunta.  
- Ranking global (requiere backend).  
- Traducción multilenguaje (i18n).  

---

## 📖 Aprendizajes

Este proyecto me permitió reforzar:
- Manejo de **estados y hooks** en React.  
- Consumo y normalización de datos de una API REST pública.  
- Diseño con **tokens de estilo** (colores, tipografías, gradientes).  
- Patrones de separación de responsabilidades en frontend.  

---

## 👨‍💻 Autor

Proyecto desarrollado por **roberstxx** como parte del reto [DevChallenges.io](https://devchallenges.io/).  

