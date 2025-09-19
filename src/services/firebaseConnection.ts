import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDmjLu9s13JIJ-VMiVSpWyzvCOSC5iRzAo",
  authDomain: "webcarros-48a56.firebaseapp.com",
  projectId: "webcarros-48a56",
  storageBucket: "webcarros-48a56.firebasestorage.app",
  messagingSenderId: "537392106955",
  appId: "1:537392106955:web:ea519693235be3de9c7a4e"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };