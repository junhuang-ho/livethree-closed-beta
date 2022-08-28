import { FIREBASE_CONFIG } from "../configs/firebase"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"
import { getFirestore } from "firebase/firestore"
import { getFunctions } from "firebase/functions"
import { getAnalytics } from "firebase/analytics";
import { collection } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// const region = "us-central1"

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG)
export const auth = getAuth(app)
export const storage = getStorage(app)
export const db = getFirestore(app)
export const functions = getFunctions(app);
// export const db = initializeFirestore(app, { // https://github.com/firebase/firebase-js-sdk/issues/5302
//     experimentalForceLongPolling: true,
// })
export const analytics = getAnalytics(app);

export const COL_REF_USERS = collection(db, 'users')
export const COL_REF_ROOMS = collection(db, 'rooms')
export const COL_REF_HISTORY = collection(db, 'history')
export const COL_REF_CALLER_HAS_ROOM = collection(db, 'callerHasRoom')
export const COL_REF_HANDLES = collection(db, 'handle')
export const COL_REF_REFERRALS = collection(db, 'referrals')
export const COL_REF_PROMO1 = collection(db, 'promo1')

export const getColRefActive = (callee: string) => {
    return collection(COL_REF_ROOMS, callee, 'active')
}

export const getColRefHistoryKey = (participant: string) => {
    return collection(COL_REF_HISTORY, participant, 'historyKey')
}