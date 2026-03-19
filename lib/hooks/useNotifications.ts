import { useState, useEffect, useCallback } from "react";
import { getToken } from "firebase/messaging";
import { messaging as getMessaging, db, auth } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [token, setToken] = useState<string | null>(null);

  const registerToken = useCallback(async () => {
    try {
      const m = await getMessaging();
      if (!m) return;

      const currentToken = await getToken(m, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY // User needs to provide this
      });

      if (currentToken) {
        setToken(currentToken);
        // Store in Firestore
        const user = auth.currentUser;
        const tokenRef = doc(db, "fcm_tokens", currentToken);
        await setDoc(tokenRef, {
          token: currentToken,
          userId: user?.uid || "anonymous",
          updatedAt: new Date().toISOString(),
          platform: "web"
        });
      }
    } catch (err) {
      console.error("Error getting token:", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
      if (Notification.permission === "granted") {
        registerToken();
      }
    }
  }, [registerToken]);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    
    const status = await Notification.requestPermission();
    setPermission(status);
    
    if (status === "granted") {
      await registerToken();
    }
  }, [registerToken]);

  return { permission, token, requestPermission };
}
