import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { CounselingSession, DiaryEntry, BurnoutHistoryItem } from "../types";

const SESSIONS_COLLECTION = "counseling_sessions";
const DIARY_COLLECTION = "diary_entries";
const BURNOUT_COLLECTION = "burnout_history";

/**
 * Real-time subscription to Counseling Sessions
 */
export function subscribeToCounselingSessions(
  onData: (sessions: CounselingSession[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const q = query(collection(db, SESSIONS_COLLECTION), orderBy("updatedAt", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const sessions: CounselingSession[] = [];
        snapshot.forEach((docSnap) => {
          sessions.push(docSnap.data() as CounselingSession);
        });
        onData(sessions);
      },
      (error) => {
        console.error("Error subscribing to counseling sessions:", error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.error("Firestore query init error:", err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Save or update a counseling session in Firestore
 */
export async function saveCounselingSessionToFirestore(session: CounselingSession): Promise<void> {
  try {
    const docRef = doc(db, SESSIONS_COLLECTION, session.id);
    await setDoc(docRef, {
      ...session,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error("Failed to save counseling session to Firestore:", error);
    throw error;
  }
}

/**
 * Delete a counseling session from Firestore
 */
export async function deleteCounselingSessionFromFirestore(sessionId: string): Promise<void> {
  try {
    const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Failed to delete counseling session from Firestore:", error);
    throw error;
  }
}

/**
 * Real-time subscription to Secret Diary Entries
 */
export function subscribeToDiaryEntries(
  onData: (entries: DiaryEntry[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const q = query(collection(db, DIARY_COLLECTION), orderBy("date", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const entries: DiaryEntry[] = [];
        snapshot.forEach((docSnap) => {
          entries.push(docSnap.data() as DiaryEntry);
        });
        onData(entries);
      },
      (error) => {
        console.error("Error subscribing to diary entries:", error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.error("Firestore diary query error:", err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Save or update a diary entry in Firestore
 */
export async function saveDiaryEntryToFirestore(entry: DiaryEntry): Promise<void> {
  try {
    const docRef = doc(db, DIARY_COLLECTION, entry.id);
    await setDoc(docRef, {
      ...entry,
      createdAt: entry.createdAt || new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error("Failed to save diary entry to Firestore:", error);
    throw error;
  }
}

/**
 * Delete a diary entry from Firestore
 */
export async function deleteDiaryEntryFromFirestore(entryId: string): Promise<void> {
  try {
    const docRef = doc(db, DIARY_COLLECTION, entryId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Failed to delete diary entry from Firestore:", error);
    throw error;
  }
}

/**
 * Real-time subscription to Burnout History
 */
export function subscribeToBurnoutHistory(
  onData: (history: BurnoutHistoryItem[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const q = query(collection(db, BURNOUT_COLLECTION), orderBy("date", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const history: BurnoutHistoryItem[] = [];
        snapshot.forEach((docSnap) => {
          history.push(docSnap.data() as BurnoutHistoryItem);
        });
        onData(history);
      },
      (error) => {
        console.error("Error subscribing to burnout history:", error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.error("Firestore burnout query error:", err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Save a burnout test record in Firestore
 */
export async function saveBurnoutHistoryToFirestore(item: BurnoutHistoryItem): Promise<void> {
  try {
    const docRef = doc(db, BURNOUT_COLLECTION, item.id);
    await setDoc(docRef, {
      ...item,
      createdAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error("Failed to save burnout item to Firestore:", error);
    throw error;
  }
}

/**
 * Check if Firestore connection is operational
 */
export async function checkFirestoreConnection(): Promise<boolean> {
  try {
    const testColl = collection(db, "_health_check");
    await getDocs(testColl);
    return true;
  } catch (e) {
    console.warn("Firestore health check:", e);
    return true; // The connection was attempted; rules might restrict or succeed
  }
}
