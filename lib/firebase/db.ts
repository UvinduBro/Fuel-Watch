import { collection, doc, getDocs, getDoc, updateDoc, addDoc, query, writeBatch, setDoc } from "firebase/firestore";
import { db } from "./config";
import { StationData } from "@/components/blocks/StationCard";
import { FuelStatus } from "@/components/blocks/FuelStatusBadge";

export const clearAllStationData = async () => {
  try {
    const q = query(collection(db, "stations"));
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    // Also clear updates log for a truly fresh start
    const updatesQ = query(collection(db, "updates"));
    const updatesSnapshot = await getDocs(updatesQ);
    const updatesBatch = writeBatch(db);
    updatesSnapshot.docs.forEach((doc) => {
      updatesBatch.delete(doc.ref);
    });
    await updatesBatch.commit();
    
    return true;
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
};

export const getStations = async (): Promise<StationData[]> => {
  try {
    const q = query(collection(db, "stations"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StationData[];
  } catch (error) {
    console.error("Error fetching stations:", error);
    return []; // Return empty gracefully if not configured yet
  }
};

export const getStationById = async (id: string): Promise<StationData | null> => {
  try {
    const cleanId = id.replace(/\//g, "-");
    const docRef = doc(db, "stations", cleanId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as StationData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching station:", error);
    return null;
  }
};

export const updateFuelStatus = async (
  stationId: string, 
  fuelType: keyof StationData["fuels"], 
  status: FuelStatus, 
  userId: string = "anonymous",
  stationName?: string
) => {
  try {
    const cleanId = stationId.replace(/\//g, "-");
    const stationRef = doc(db, "stations", cleanId);
    
    const now = new Date();
    // Use ISO string so frontend can calculate 'timeAgo' accurately
    const timeString = now.toISOString();

    const stationDoc = await getDoc(stationRef);
    const currentUpdatedCount = stationDoc.exists() ? (stationDoc.data()?.updatedCount || 0) : 0;
    const newUpdatedCount = currentUpdatedCount + 1;

    // Use setDoc with merge: true to support updating/creating hybrid records
    await setDoc(stationRef, {
      ...(stationName && { name: stationName }),
      fuels: {
        [fuelType]: {
            status,
            lastUpdatedAt: timeString
        }
      },
      updatedCount: newUpdatedCount
    }, { merge: true });

    await addDoc(collection(db, "updates"), {
      stationId,
      fuelType,
      status,
      userId,
      createdAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Error updating fuel status:", error);
    throw error;
  }
};

export const updateQueueStatus = async (
  stationId: string,
  queueStatus: "none" | "medium" | "long",
  userId: string = "anonymous"
) => {
  try {
    const cleanId = stationId.replace(/\//g, "-");
    const stationRef = doc(db, "stations", cleanId);
    const now = new Date();
    const timeString = now.toISOString();

    const stationDoc = await getDoc(stationRef);
    const currentUpdatedCount = stationDoc.exists() ? (stationDoc.data()?.updatedCount || 0) : 0;
    const newUpdatedCount = currentUpdatedCount + 1;

    await setDoc(stationRef, {
      queue: queueStatus,
      queueUpdatedAt: timeString,
      updatedCount: newUpdatedCount
    }, { merge: true });

    await addDoc(collection(db, "updates"), {
      stationId,
      queueStatus,
      userId,
      createdAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Error updating queue status:", error);
    throw error;
  }
};

export const toggleStationStatus = async (stationId: string, isOpen: boolean) => {
  try {
    const cleanId = stationId.replace(/\//g, "-");
    const stationRef = doc(db, "stations", cleanId);
    await updateDoc(stationRef, { isOpen });
  } catch (error) {
    console.error("Error toggling status:", error);
    throw error;
  }
};
