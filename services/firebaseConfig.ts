import firebase from '@react-native-firebase/app';
// Note: Firestore is not yet used with native SDK in this plan, 
// but we leave a placeholder if needed.
// import '@react-native-firebase/firestore';

// Configuration is automatically picked up from google-services.json / GoogleService-Info.plist
// in native builds. For managed Expo, the config is handles via plugins.

export const auth = firebase.auth;
// export const db = firebase.firestore();

export default firebase;
