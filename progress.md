# Progress — App Contador Gesto SixSeven

> Archivo clave de seguimiento entre sesiones. Actualizar al finalizar cada sesión de trabajo.

---

## Estado Global

| Paso | Descripción | Estado |
|------|-------------|--------|
| 1 | Configuración del Entorno (Node.js + Expo CLI) | ✅ Completo |
| 2 | Inicialización del Proyecto Expo | ✅ Completo |
| 3 | Integración de Visión Artificial (MediaPipe JS vía WebView) | 🟢 Completo |
| 4 | Lógica de detección del gesto (Movimiento relativo) | 🟢 Completo |
| 5 | Mecánica del juego (temporizador + UI) | ✅ Completo |
| 6 | Compilación a APK con EAS Build | 🔴 Pendiente |

---

## Sesión 1 — 2026-04-18

### Lo que se hizo
- ✅ Se verificó que **Node.js NO estaba instalado**.
- ✅ Se descargó e instaló **Node.js v22.15.0 LTS** (silenciosamente vía msiexec).
- ✅ Se instalaron **expo-cli** y **eas-cli** globalmente.
- ✅ Se creó el proyecto `sixseven` con `create-expo-app` (template blank).
- ✅ Se instaló `expo-camera` (SDK 54 compatible).
- ✅ Se instalaron las dependencias de ML:
  - `@tensorflow/tfjs`
  - `@tensorflow/tfjs-react-native`
  - `@tensorflow-models/hand-pose-detection` (MediaPipe Hands)
  - `expo-gl`
  - `react-native-reanimated`
- ✅ Se configuró `app.json` con permisos de cámara (Android + iOS) y branding dark mode.
- ✅ Se escribió `App.js` completo con:
  - Cámara frontal con `CameraView`
  - Timer de 60 segundos
  - Contador de repeticiones con animación bounce
  - HUD oscuro con líneas de umbral visuales
  - Estados: idle → running → finished
  - Feedback de vibración
- ✅ Se escribió `src/components/HandTracker.js` con:
  - Inicialización del detector MediaPipe Hands via TF.js
  - Máquina de estados del gesto (rest → up → rest + rep++)
  - Umbrales: UPPER=30%, LOWER=62% de la altura del frame
- ✅ Se creó `eas.json` con profile `preview` para generar APK.
- ✅ Se creó este archivo `progress.md`.

### Sesión 2 — Frame Integration & Refactor (Misma fecha)

- ✅ **Cambio de paradigma a WebView**: Se descartó la integración nativa de TensorFlow.js/worklets debido a problemas de soporte en Expo Go 54 y conflictos de dependencias. En su lugar, se inyectó el SDK de MediaPipe nativo de HTML5/JS dentro de un componente `WebView`.
- ✅ **Performance**: El WebView accede a la cámara nativa via `getUserMedia` (configurando `baseUrl: 'https://localhost'` para engañar las políticas CORS/Seguridad de Android) logrando una detección robusta.
- ✅ **Lógica de movimiento relativo**: Se abandonaron los umbrales estáticos en la pantalla. Se desarrolló una máquina de estados de picos y valles: el jugador debe subir un tramo equivalente al 35% de la pantalla (~40cm) y bajar la misma distancia para sumar una repetición.
- ✅ **Documentación (README)**: Se generó el `README.md` oficial del proyecto para poder inicializarlo en cualquier computadora sin fricción.

---

## Cómo arrancar la app (para cualquier sesión)

```powershell
cd "d:\data\Proyectos\Personales\humai\sixseven"
npx expo start
```
> Escanear el QR con **Expo Go** en el Android (misma red Wi-Fi).

---

## Arquitectura del proyecto

```
sixseven/
├── App.js                          ← UI principal, timer, HUD, botones
├── app.json                        ← Config Expo + permisos de cámara
├── eas.json                        ← Config EAS Build (APK preview/production)
├── src/
│   └── components/
│       └── HandTracker.js          ← MediaPipe Hands + algoritmo SixSeven
├── assets/                         ← Íconos Expo
└── package.json
```

### Algoritmo de estados del gesto
```
Estado REPOSO
    mano.y < 30% altura  →  Estado ARRIBA

Estado ARRIBA
    mano.y > 62% altura  →  Estado REPOSO + contador++
```
- Y=0% es el borde superior de la pantalla.
- Y=100% es el borde inferior.

### Stack de dependencias instaladas
| Paquete | Versión | Uso |
|---------|---------|-----|
| expo | ~54.x | Framework base |
| expo-camera | ~17.0.10 | Acceso a cámara |
| @tensorflow/tfjs | latest | Runtime ML |
| @tensorflow/tfjs-react-native | latest | Backend TF para RN |
| @tensorflow-models/hand-pose-detection | latest | MediaPipe Hands |
| expo-gl | latest | Soporte WebGL para TF.js |
| react-native-reanimated | latest | Animaciones fluidas |

---

## Paso 6 — Compilar APK (cuando la app esté funcionando)

```powershell
# 1. Loguearse en Expo
eas login

# 2. Configurar el proyecto
eas build:configure

# 3. Compilar APK de preview (instala directamente en Android sin Play Store)
eas build --platform android --profile preview
```
> El APK se descarga desde el dashboard de expo.dev.

---

## Decisiones técnicas

| Decisión | Opción elegida | Razón |
|----------|---------------|-------|
| Framework | React Native + Expo | APK fácil + cámara sin Android Studio |
| Visión artificial | TF.js + MediaPipe Hands | Mismo modelo de Google, funciona en JS/RN |
| Runtime ML | `tfjs` (no mediapipe wasm) | Compatibilidad con Expo Go |
| Arranque del timer | Botón manual "Empezar" | Evita falsos positivos |
| Lenguaje | JavaScript | Sin overhead de TypeScript para este scope |
| Umbrales | 30% (arriba) / 62% (abajo) | Calibrables en `HandTracker.js` |

---

## Log de sesiones

| Sesión | Fecha | Responsable | Resumen |
|--------|-------|-------------|---------|
| 1 | 2026-04-18 | Antigravity + Usuario | Instalación Node.js, creación proyecto, UI de App.js. Luego, implementación final de cámara y modelo IA con arquitectura `WebView`. Cambio a detección de movimiento relativo. Creación de README.md. Primera iteración terminada y 100% funcional. |
