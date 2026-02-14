// MINIMAL PROBE: Only import app, no logic.
// If this file causes a 500 error when imported in App.tsx, 
// then the entire native library bundle is incompatible with this Metro/RN version.
import firebase from '@react-native-firebase/app';

export const probeFirebase = () => {
    console.log("Firebase App Module Loaded:", !!firebase);
};
