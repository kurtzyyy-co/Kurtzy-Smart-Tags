import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

// Load Firebase configuration from firebase-applet-config.json if it exists
let firebaseDefines: Record<string, string> = {};
try {
  const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    process.env.VITE_FIREBASE_API_KEY = config.apiKey;
    process.env.VITE_FIREBASE_AUTH_DOMAIN = config.authDomain;
    process.env.VITE_FIREBASE_PROJECT_ID = config.projectId;
    process.env.VITE_FIREBASE_STORAGE_BUCKET = config.storageBucket;
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = config.messagingSenderId;
    process.env.VITE_FIREBASE_APP_ID = config.appId;
    process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID = config.firestoreDatabaseId || "";

    firebaseDefines = {
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(config.apiKey),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(config.authDomain),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(config.projectId),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(config.storageBucket),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(config.messagingSenderId),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(config.appId),
      'import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID': JSON.stringify(config.firestoreDatabaseId || ""),
    };
  }
} catch (e) {
  console.error("Error reading firebase-applet-config.json inside vite.config.ts:", e);
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    define: firebaseDefines,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
