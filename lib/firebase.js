import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAfvo89yGBwLP33jEs6L0zTEIC-RRquu4k",
  authDomain: "pizza-depot-leander.firebaseapp.com",
  projectId: "pizza-depot-leander",
  storageBucket: "pizza-depot-leander.firebasestorage.app",
  messagingSenderId: "777402986809",
  appId: "1:777402986809:web:a9b1d802e161972a1cb8e8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
