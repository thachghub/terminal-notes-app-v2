import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function loadPreferences(uid: string) {
  const ref = doc(db, 'users', uid, 'preferences');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function savePreferences(uid: string, prefs: any) {
  const ref = doc(db, 'users', uid, 'preferences');
  await setDoc(ref, prefs, { merge: true });
} 