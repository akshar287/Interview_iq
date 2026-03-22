"use server";

import { db } from "@/firebase/admin";
import { revalidatePath } from "next/cache";

export async function sendBroadcast(
  message: string, 
  target: "users" | "colleges" | "both" | "individual", 
  targetId?: string
) {
  try {
    if (!message || message.trim() === "") {
      return { success: false, message: "Message cannot be empty" };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours from now

    await db.collection("announcements").add({
      message,
      target,
      targetId: targetId || null,
      createdAt: new Date(),
      expiresAt: expiresAt,
    });
    
    revalidatePath("/admin/dashboard");
    revalidatePath("/"); // revalidate all generic paths
    
    return { success: true };
  } catch (error: any) {
    console.error("Error sending broadcast:", error);
    return { success: false, message: error.message };
  }
}

export async function getAllAnnouncements() {
  try {
    const snapshot = await db.collection("announcements").orderBy("createdAt", "desc").get();
    const now = new Date();
    
    const announcements = snapshot.docs.map(doc => {
      const data = doc.data();
      const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      
      return {
        id: doc.id,
        message: data.message || "",
        target: data.target || "both",
        targetId: data.targetId || null,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isExpired: expiresAt < now
      };
    });

    return { success: true, announcements };
  } catch (error: any) {
    console.error("Error fetching announcements:", error);
    return { success: false, message: error.message };
  }
}

export async function getActiveAnnouncements(targetType: "users" | "colleges", userId?: string) {
  try {
    const snapshot = await db.collection("announcements").orderBy("createdAt", "desc").get();
    const now = new Date();
    
    const announcements = snapshot.docs
      .map(doc => {
        const data = doc.data();
        const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
        return {
          id: doc.id,
          message: data.message,
          target: data.target,
          targetId: data.targetId || null,
          expiresAt: expiresAt
        };
      })
      .filter(a => a.expiresAt > now) // Only active
      .filter(a => {
        // Targeted at this specific individual
        if (a.target === "individual" && a.targetId === userId) return true;
        
        // Targeted globally or by segment
        if (!a.targetId && (a.target === "both" || a.target === targetType)) return true;
        
        return false;
      });

    return { success: true, announcements: announcements.map(a => ({...a, expiresAt: a.expiresAt.toISOString()})) };
  } catch (error: any) {
    console.error("Error fetching active announcements:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteBroadcast(id: string) {
  try {
    await db.collection("announcements").doc(id).delete();
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting broadcast:", error);
    return { success: false, message: error.message };
  }
}
