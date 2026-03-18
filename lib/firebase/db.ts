import { collection, doc, getDocs, getDoc, setDoc, updateDoc, addDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "./config";
import { StationData } from "@/components/blocks/StationCard";
import { FuelStatus } from "@/components/blocks/FuelStatusBadge";

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
    const docRef = doc(db, "stations", id);
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
  userId: string = "anonymous"
) => {
  try {
    const stationRef = doc(db, "stations", stationId);
    
    const now = new Date();
    // 12-hour format for last updated e.g. "2:30 PM"
    const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    await updateDoc(stationRef, {
      [`fuels.${fuelType}.status`]: status,
      [`fuels.${fuelType}.lastUpdatedAt`]: timeString,
    });

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

export const toggleStationStatus = async (stationId: string, isOpen: boolean) => {
  try {
    const stationRef = doc(db, "stations", stationId);
    await updateDoc(stationRef, { isOpen });
  } catch (error) {
    console.error("Error toggling status:", error);
    throw error;
  }
};
