"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function adminSignIn({ email, password }: { email: string, password: string }) {
  if (email === "admin@careerly.com" && password === "admin1112") {
    // Correct credentials
    const cookieStore = await cookies();
    cookieStore.set("adminSession", "authenticated_admin", {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return { success: true };
  } else {
    return { success: false, message: "Invalid admin credentials." };
  }
}

export async function adminSignOut() {
  const cookieStore = await cookies();
  cookieStore.delete("adminSession");
  redirect("/sign-in");
}

function safeDateIso(val: any): string | null {
  if (!val) return null;
  try {
    if (typeof val === 'string' || typeof val === 'number') return new Date(val).toISOString();
    if (val.toDate && typeof val.toDate === 'function') return val.toDate().toISOString();
    return new Date(val).toISOString();
  } catch (e) {
    return null;
  }
}

function isFutureDate(val: any): boolean {
  if (!val) return false;
  try {
    let d: Date;
    if (typeof val === 'string' || typeof val === 'number') d = new Date(val);
    else if (val.toDate && typeof val.toDate === 'function') d = val.toDate();
    else d = new Date(val);
    return d > new Date();
  } catch (e) {
    return false;
  }
}

export async function getAdminDashboardData() {
  try {
    const usersSnapshot = await db.collection("users").get();
    const collegesSnapshot = await db.collection("college").get();

    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      let isPlanActive = false;
      
      if (data.planExpiry) {
        if (isFutureDate(data.planExpiry)) {
          isPlanActive = true;
        }
      } else if (data.planId) {
        isPlanActive = true;
      }

      return {
        id: doc.id,
        name: data.name || "Unknown",
        email: data.email || "No Email",
        plan: data.planId || data.plan || "None",
        planExpiry: safeDateIso(data.planExpiry),
        isPlanActive,
        tokens: data.tokens || 0,
        createdAt: safeDateIso(data.createdAt),
      };
    });

    const colleges = collegesSnapshot.docs.map(doc => {
      const data = doc.data();
      let isPlanActive = false;
      
      if (data.planExpiry) {
        if (isFutureDate(data.planExpiry)) {
          isPlanActive = true;
        }
      } else if (data.planId) {
        isPlanActive = true;
      }

      return {
        id: doc.id,
        name: data.name || "Unknown",
        email: data.email || "No Email",
        plan: data.planId || data.plan || "None",
        planExpiry: safeDateIso(data.planExpiry),
        isPlanActive,
        studentsCount: data.studentsCount || 0,
        createdAt: safeDateIso(data.createdAt),
      };
    });

    return { success: true, users, colleges };
  } catch (error: any) {
    console.error("Error fetching admin dashboard data:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteUserOrCollege(id: string, collectionType: "users" | "college") {
  try {
    // Delete from Firestore
    await db.collection(collectionType).doc(id).delete();
    
    // Attempt to delete from Firebase Auth
    try {
      await auth.deleteUser(id);
    } catch (authError: any) {
      if (authError.code !== 'auth/user-not-found') {
        console.warn(`Could not delete Auth user ${id}: ${authError.message}`);
      }
    }

    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error(`Error deleting ${collectionType}:`, error);
    return { success: false, message: error.message || "Failed to delete" };
  }
}
