# App Contador Gesto SixSeven 🖐️

Una aplicación nativa para Android y iOS construida con **React Native (Expo)** que utiliza inteligencia artificial para detectar el movimiento de tus manos y contar repeticiones del gesto "SixSeven" en 60 segundos.

El proyecto está inspirado en una prueba de concepto previa en Python (OpenCV), adaptado ahora para dispositivos móviles usando **Google MediaPipe Hands**.

---

## 🛠️ Arquitectura y Decisiones Técnicas

Para asegurar la máxima compatibilidad y evitar complejas compilaciones nativas (evitando el uso de `react-native-vision-camera` o `react-native-worklets`), la aplicación utiliza un **enfoque basado en WebView**.

1. **Interfaz y Lógica de Juego**: Desarrollados de forma nativa con React Native (UI, temporizador, contadores, animaciones).
2. **Visión Artificial (MediaPipe)**: Inyectamos un entorno de HTML5 dentro de un `WebView` de React Native. El WebView accede a la cámara nativa de forma transparente usando `getUserMedia` y procesa los frames usando el SDK de Javascript de MediaPipe Hands de Google.
3. **Comunicación**: El WebView analiza los frames a +30 FPS y le envía mensajes asíncronos (`postMessage`) a React Native únicamente con las coordenadas *Y* de las manos. 

### Algoritmo del Contador (Movimiento Relativo)
En lugar de depender de zonas estáticas en la pantalla, el algoritmo rastrea picos y valles (peaks and troughs) en la coordenada Y. Si el jugador levanta las manos una distancia relativa de aproximadamente 40cm (35% del alto de la pantalla) y luego las baja la misma distancia, se cuenta **1 repetición**. Esto permite jugar estando de pie, sentado, cerca o lejos del celular.

---

## 🚀 Guía de Instalación para Desarrollo Local

Para correr este proyecto en tu computadora y probarlo en un dispositivo físico sin necesidad de instalar Android Studio, seguí estos pasos:

### 1. Requisitos Previos
- Instalar **Node.js LTS** (v20 o superior): [https://nodejs.org](https://nodejs.org)
- Instalar la app **Expo Go** en tu celular Android o iOS desde la tienda oficial.
- Asegurate de que tu computadora y tu celular estén conectados a la **misma red Wi-Fi**.

### 2. Clonar e Instalar
Cloná el repositorio y navegá a la carpeta del proyecto:
```bash
git clone <url-del-repo>
cd sixseven
```

Instalá las dependencias de Node:
```bash
npm install
```

### 3. Ejecutar el Servidor
Iniciá el servidor de desarrollo de Expo. Recomendamos usar el flag `--clear` la primera vez para asegurar que el caché esté limpio.
```bash
npx expo start --clear
```
*(Si tenés problemas de red, podés probar con `npx expo start --tunnel` que crea un túnel seguro global).*

### 4. Probar en el Celular
1. Abrí la app **Expo Go** en tu dispositivo.
2. Escaneá el **código QR** que aparece en la terminal de tu computadora.
3. Otorgá los permisos de cámara y ¡listo para jugar!

---

## 📂 Estructura del Código
- `App.js`: Contiene la UI completa, el HUD transparente, el temporizador de 60 segundos y la lógica de inicio/fin del juego.
- `src/components/HandTracker.js`: Contiene el componente `WebView` que se encarga de inyectar MediaPipe, conectarse a la cámara e interpretar la matemática de picos y valles para avisarle a `App.js` cuando ocurre una repetición.
- `app.json` / `eas.json`: Archivos de configuración general de Expo y sus permisos.

---

## 📦 Compilación a APK (Producción)

Si necesitás crear un archivo `.apk` genuino para compartir con usuarios que no tienen Expo Go:
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```
