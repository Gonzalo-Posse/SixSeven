import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Animated,
  Vibration,
} from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import HandTracker from './src/components/HandTracker';

const GAME_DURATION = 60; // segundos

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'running' | 'finished'
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [debugInfo, setDebugInfo] = useState('');

  const timerRef = useRef(null);
  const countRef = useRef(0);
  const gameStateRef = useRef('idle');

  // Animaciones
  const countScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulso del contador durante el juego
  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  // Animación de bounce al sumar rep
  const bounceCount = () => {
    Animated.sequence([
      Animated.timing(countScale, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(countScale, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  };

  const handleRepetition = useCallback(() => {
    if (gameStateRef.current !== 'running') return;
    countRef.current += 1;
    setCount(countRef.current);
    bounceCount();
    Vibration.vibrate(60);
  }, []);

  const startGame = () => {
    countRef.current = 0;
    gameStateRef.current = 'running';
    setCount(0);
    setTimeLeft(GAME_DURATION);
    setGameState('running');
    startPulse();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    gameStateRef.current = 'finished';
    setGameState('finished');
    stopPulse();
    Vibration.vibrate([0, 100, 100, 200]);
  };

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    gameStateRef.current = 'idle';
    setGameState('idle');
    setCount(0);
    setTimeLeft(GAME_DURATION);
    countRef.current = 0;
    stopPulse();
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // --- Permisos ---
  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Solicitando permisos...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permTitle}>📷 Permiso de cámara requerido</Text>
        <Text style={styles.permSubtitle}>
          SixSeven necesita la cámara para detectar el movimiento de tus manos.
        </Text>
        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

      {/* ── CÁMARA y TRACKER (fondo) ── */}
      <HandTracker
        active={gameState === 'running'}
        onRepetition={handleRepetition}
        onDebug={setDebugInfo}
      />

      {/* ── HUD OVERLAY ── */}
      <View style={styles.hud} pointerEvents="box-none">

        {/* Título */}
        <View style={styles.titleBar}>
          <Text style={styles.titleText}>SIX<Text style={styles.titleAccent}>SEVEN</Text></Text>
          {gameState === 'running' && (
            <Text style={styles.debugText}>{debugInfo}</Text>
          )}
        </View>

        {/* Timer */}
        <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={[
            styles.timerText,
            gameState === 'finished' && styles.timerFinished,
            timeLeft <= 10 && gameState === 'running' && styles.timerUrgent,
          ]}>
            {formatTime(timeLeft)}
          </Text>
          <Text style={styles.timerLabel}>
            {gameState === 'idle' ? 'Listo cuando quieras' :
             gameState === 'running' ? 'Tiempo restante' : '¡Tiempo!'}
          </Text>
        </Animated.View>

        {/* Contador de reps */}
        <View style={styles.countSection}>
          <Animated.Text style={[styles.countNumber, { transform: [{ scale: countScale }] }]}>
            {count}
          </Animated.Text>
          <Text style={styles.countLabel}>repeticiones</Text>
        </View>

        {/* Umbrales visuales (solo durante el juego) */}
        {gameState === 'running' && (
          <>
            {/* Las líneas fijas fueron eliminadas porque ahora la detección es de movimiento relativo (40cm aprox) */}
          </>
        )}

        {/* Botones */}
        <View style={styles.buttonArea}>
          {gameState === 'idle' && (
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={startGame}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>▶  EMPEZAR</Text>
            </TouchableOpacity>
          )}

          {gameState === 'running' && (
            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={endGame}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>⏹  DETENER</Text>
            </TouchableOpacity>
          )}

          {gameState === 'finished' && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>🏆 Resultado final</Text>
              <Text style={styles.resultScore}>{count} reps</Text>
              <Text style={styles.resultSub}>en {GAME_DURATION} segundos</Text>
              <TouchableOpacity
                style={[styles.button, styles.startButton]}
                onPress={resetGame}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>🔄  JUGAR DE NUEVO</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </View>
    </View>
  );
}

const COLORS = {
  bg: '#0a0a0f',
  surface: 'rgba(255,255,255,0.07)',
  accent: '#7c3aed',
  accentLight: '#a78bfa',
  danger: '#ef4444',
  text: '#f1f5f9',
  muted: '#64748b',
  upper: 'rgba(124,58,237,0.7)',
  lower: 'rgba(239,68,68,0.7)',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: {
    flex: 1, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  loadingText: { color: COLORS.text, fontSize: 18 },

  // Permiso
  permTitle: { color: COLORS.text, fontSize: 24, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  permSubtitle: { color: COLORS.muted, fontSize: 16, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  permButton: {
    backgroundColor: COLORS.accent, paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 14,
  },
  permButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // HUD
  hud: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingTop: 52, paddingBottom: 48, paddingHorizontal: 24,
  },

  // Título
  titleBar: { alignItems: 'center' },
  titleText: {
    fontSize: 28, fontWeight: '900', letterSpacing: 6, color: COLORS.text,
  },
  titleAccent: { color: COLORS.accentLight },
  debugText: { color: COLORS.muted, fontSize: 11, marginTop: 4 },

  // Timer
  timerContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 24, paddingVertical: 20, paddingHorizontal: 40,
    alignSelf: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  timerText: {
    fontSize: 72, fontWeight: '800', color: COLORS.text, letterSpacing: 2,
  },
  timerUrgent: { color: COLORS.danger },
  timerFinished: { color: COLORS.accentLight },
  timerLabel: { color: COLORS.muted, fontSize: 13, marginTop: 4, letterSpacing: 1 },

  // Contador
  countSection: { alignItems: 'center' },
  countNumber: {
    fontSize: 96, fontWeight: '900', color: COLORS.accentLight, lineHeight: 100,
  },
  countLabel: { color: COLORS.muted, fontSize: 16, letterSpacing: 2, textTransform: 'uppercase' },


  // Botones
  buttonArea: { alignItems: 'center' },
  button: {
    paddingHorizontal: 48, paddingVertical: 18, borderRadius: 18,
    minWidth: 220, alignItems: 'center',
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 12,
  },
  startButton: { backgroundColor: COLORS.accent },
  stopButton: { backgroundColor: '#374151' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 1 },

  // Resultado
  resultContainer: { alignItems: 'center', gap: 8 },
  resultTitle: { color: COLORS.text, fontSize: 22, fontWeight: '700' },
  resultScore: { color: COLORS.accentLight, fontSize: 64, fontWeight: '900', lineHeight: 70 },
  resultSub: { color: COLORS.muted, fontSize: 16, marginBottom: 24 },
});
