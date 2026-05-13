import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GithubAuthProvider, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

/** Repli factice : définir les NEXT_PUBLIC_FIREBASE_* dans `.env.local` (vraies valeurs = console Firebase). */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSy_FAKE_REPLACE_ME_00000000000000',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'your-app.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'your-firebase-project-id',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'your-firebase-project-id.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '1:000000000000:web:aaaaaaaaaaaaaaaa',
};

function getOrInitApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }
  return initializeApp(firebaseConfig);
}

export const app = getOrInitApp();
export const auth = getAuth(app);

export const Redirection_Url =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_HANDLER_URL ??
  'https://your-app.firebaseapp.com/__/auth/handler';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const githubProvider = new GithubAuthProvider();

export async function getFirebaseIdTokenWithGoogle(): Promise<string> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user.getIdToken();
}

export async function getFirebaseIdTokenWithGithub(): Promise<string> {
  const result = await signInWithPopup(auth, githubProvider);
  return result.user.getIdToken();
}
