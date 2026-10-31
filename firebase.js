import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyDLao6M9simzWB8PaW43nOHaxJnW0Ovlas',
  authDomain: 'wand-duel-3f1c4.firebaseapp.com',
  databaseURL: 'https://wand-duel-3f1c4-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'wand-duel-3f1c4',
  storageBucket: 'wand-duel-3f1c4.firebasestorage.app',
  messagingSenderId: '61247378229',
  appId: '1:61247378229:web:25b9fdf9d1ddcd4aed327c',
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
