import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { FirebaseApp, initializeApp } from "firebase/app";
import * as firebaseAuth from "firebase/auth";
import { Auth, initializeAuth } from "firebase/auth";
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIM4BoFrQ2A9R1tBE0bENI0ikbQ6YV1nw",
  authDomain: "navygator-browser.firebaseapp.com",
  projectId: "navygator-browser",
  storageBucket: "navygator-browser.firebasestorage.app",
  messagingSenderId: "834593282010",
  appId: "1:834593282010:web:95cab6b2450ac5257752e3",
  measurementId: "G-EK7HWSNGFS",
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const getReactNativePersistence = (firebaseAuth as any)
  .getReactNativePersistence;
const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const db: Firestore = getFirestore();
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

export interface History {
  url: string;
  email: string;
  createdAt: Timestamp;
}

export interface ChatMessage {
  prompt: string;
  response: string;
  createdAt: Timestamp;
}

export interface ChatData {
  id?: string;
  email: string;
  messages: ChatMessage[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

async function createHistory(
  url: string,
  email: string
): Promise<History | null> {
  if (!email || !url || email.length === 0 || url.length === 0) {
    return null;
  }
  // Create a deterministic document ID (e.g., hash of email and url)
  const docId = `${email}_${url.replace(/[^a-zA-Z0-9]/g, "_")}`; // Sanitize URL for Firestore ID
  const historyRef = doc(db, "history", docId);

  // Use setDoc with merge: false to ensure no overwrite if it exists
  try {
    const history: History = { url, email, createdAt: Timestamp.now() };
    await setDoc(historyRef, history, { merge: false });
    return history;
  } catch (error: any) {
    if (error.code === "already-exists") {
      console.log("History already exists for this email and URL!");
      return null;
    }
    throw error;
  }
}

async function getHistory(
  email: string,
  url?: string
): Promise<History[] | null> {
  if (url) {
    const docId = `${email}_${url.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const docRef = doc(db, "history", docId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    return [docSnap.data() as History];
  } else {
    const q = query(collection(db, "history"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length === 0) {
      return null;
    }
    return querySnapshot.docs.map((doc) => doc.data() as History);
  }
}

async function deleteHistory(email: string, url: string) {
  const q = query(
    collection(db, "history"),
    where("email", "==", email),
    where("url", "==", url)
  );

  const querySnapshot = await getDocs(q);
  const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}
async function chatwithAI(
  prompt: string,
  email: string,
  chatID?: string
): Promise<ChatData | null> {
  const result = await model.generateContent(prompt);
  const message: ChatMessage = {
    prompt,
    response: result.response.text(),
    createdAt: Timestamp.now(),
  };

  let chatRef: DocumentReference<DocumentData>;
  let chatData: ChatData | null;

  if (chatID) {
    chatRef = doc(db, "chats", chatID);
    await updateDoc(chatRef, {
      messages: arrayUnion(message),
      updatedAt: Timestamp.now(),
    });
    const chatSnap = await getDoc(chatRef);
    chatData = chatSnap.exists()
      ? { id: chatSnap.id, ...(chatSnap.data() as ChatData) }
      : null;
  } else {
    chatRef = doc(collection(db, "chats"));
    chatData = {
      email,
      messages: [message],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await setDoc(chatRef, chatData);
    chatData = { id: chatRef.id, ...chatData };
  }

  return chatData;
}

async function getChatsByEmail(email: string): Promise<ChatData[]> {
  try {
    const q = query(collection(db, "chats"), where("email", "==", email));
    const snapshot = await getDocs(q);

    const chats: ChatData[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as ChatData),
    }));

    return chats;
  } catch (err) {
    console.error("Error fetching chats:", err);
    return [];
  }
}
async function getChats(chatID: string): Promise<ChatData | null> {
  try {
    const docRef = doc(db, "chats", chatID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as ChatData) };
    } else {
      console.warn("No chat found with ID:", chatID);
      return null;
    }
  } catch (err) {
    console.error("Error fetching chat:", err);
    return null;
  }
}
async function deleteChats(chatID: string) {
  try {
    const docRef = doc(db, "chats", chatID);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Error deleting chat: ", err);
  }
}
export {
  app,
  auth,
  chatwithAI,
  createHistory,
  db,
  deleteChats,
  deleteHistory,
  getChats,
  getChatsByEmail,
  getHistory,
};
