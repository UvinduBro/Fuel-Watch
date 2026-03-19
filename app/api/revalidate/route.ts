import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Revalidate the entire application or specific paths
    revalidatePath("/");
    revalidatePath("/stations");
    revalidatePath("/station/[id]", "page");
    
    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      message: "Cache cleared successfully" 
    });
  } catch (err) {
    console.error("Revalidation error:", err);
    return NextResponse.json({ 
      revalidated: false, 
      message: "Error revalidating" 
    }, { status: 500 });
  }
}
