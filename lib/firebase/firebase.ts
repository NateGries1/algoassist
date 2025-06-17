// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

let firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
console.log('Firebase Config: ');
console.log(firebaseConfig);

export default firebase_app;
