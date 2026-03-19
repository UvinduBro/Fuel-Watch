import { NextResponse } from "next/server";
import { adminMessaging, adminDb } from "@/lib/firebase/admin-config";

export async function POST(request: Request) {
  if (!adminMessaging || !adminDb) {
    return NextResponse.json(
      { error: "Firebase Admin not initialized" },
      { status: 500 }
    );
  }

  try {
    const { title, body } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: "Missing title or body" },
        { status: 400 }
      );
    }

    // Fetch all registered tokens from Firestore
    const tokensSnapshot = await adminDb.collection("fcm_tokens").get();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokens = tokensSnapshot.docs.map((doc: any) => doc.id);

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, sentCount: 0, message: "No tokens found" });
    }

    // Send to all tokens using multicast
    const response = await adminMessaging.sendEachForMulticast({
      tokens,
      notification: {
        title,
        body,
      },
      webpush: {
        fcmOptions: {
          link: "/",
        },
      },
    });

    return NextResponse.json({
      success: true,
      sentCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error: unknown) {
    console.error("Push Error:", error);
    const message = error instanceof Error ? error.message : "Failed to send notifications";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
