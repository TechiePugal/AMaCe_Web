// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgncmLWuVleQ3H6FcnZHPCtrS_8zNutK0",
  authDomain: "supercrm-93cbc.firebaseapp.com",
  projectId: "supercrm-93cbc",
  storageBucket: "supercrm-93cbc.firebasestorage.app",
  messagingSenderId: "13066921720",
  appId: "1:13066921720:web:0f24d503c34e23315cfd0d",
  measurementId: "G-KSCFENDDZZ",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
