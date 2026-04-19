import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const RELATIVE_THRESHOLD = 0.35; // 35% de la pantalla ~ 40cm

export default function HandTracker({ active, onRepetition, onDebug }) {
  const gestureStateRef = useRef('down');
  const peakYRef = useRef(1); // punto más alto (menor Y)
  const troughYRef = useRef(0); // punto más bajo (mayor Y)
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
    if (!active) {
      gestureStateRef.current = 'down';
      peakYRef.current = 1;
      troughYRef.current = 0;
    }
  }, [active]);

  const updateGestureState = (normalizedY) => {
    if (!activeRef.current) return;
    const state = gestureStateRef.current;

    if (state === 'down') {
      if (normalizedY > troughYRef.current) troughYRef.current = normalizedY;
      
      if (troughYRef.current - normalizedY > RELATIVE_THRESHOLD) {
        gestureStateRef.current = 'up';
        peakYRef.current = normalizedY;
      }
    } else if (state === 'up') {
      if (normalizedY < peakYRef.current) peakYRef.current = normalizedY;

      if (normalizedY - peakYRef.current > RELATIVE_THRESHOLD) {
        gestureStateRef.current = 'down';
        troughYRef.current = normalizedY;
        onRepetition && onRepetition();
      }
    }
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'log') {
        onDebug && onDebug(data.msg);
        return;
      }
      if (data.y !== undefined) {
        updateGestureState(data.y);
        onDebug && onDebug(`Mano Y: ${(data.y * 100).toFixed(0)}% | Estado: ${gestureStateRef.current}`);
      }
    } catch (e) {
      // ignore JSON errors
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
      <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
      <style>
        body, html { margin: 0; padding: 0; background-color: #0a0a0f; overflow: hidden; width: 100%; height: 100%; }
        video { width: 100vw; height: 100vh; object-fit: cover; transform: scaleX(-1); }
      </style>
    </head>
    <body>
      <video id="video" autoplay playsinline></video>
      <script>
        const log = (msg) => window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'log', msg }));
        
        log('Cargando MediaPipe...');
        const videoElement = document.getElementById('video');

        function onResults(results) {
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const hand = results.multiHandLandmarks[0];
            const wrist = hand[0];
            const palm = hand[9];
            if (wrist && palm) {
              const y = (wrist.y + palm.y) / 2;
              window.ReactNativeWebView.postMessage(JSON.stringify({ y: y }));
            }
          }
        }

        const hands = new Hands({locateFile: (file) => {
          return \`https://cdn.jsdelivr.net/npm/@mediapipe/hands/\${file}\`;
        }});
        
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0, /* 0 is faster for mobile */
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        hands.onResults(onResults);

        const camera = new Camera(videoElement, {
          onFrame: async () => {
            await hands.send({image: videoElement});
          },
          width: 480,
          height: 640,
          facingMode: "user"
        });
        
        camera.start().then(() => log('Detector listo ✓')).catch(e => log('Error: ' + e.message));
      </script>
    </body>
    </html>
  `;

  return (
    <WebView
      style={styles.webview}
      source={{ html: htmlContent, baseUrl: 'https://localhost' }}
      originWhitelist={['*']}
      onMessage={handleMessage}
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled={true}
      bounces={false}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a0f',
  }
});
