"use server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";

/**
 * Fetches the user's current token balance from Firestore.
 */
export async function getUserTokens(userId: string, collection: "users" | "students" = "users"): Promise<number> {
  try {
    const userDoc = await db.collection(collection).doc(userId).get();
    if (!userDoc.exists) return 0;
    
    // Default to 0 if tokens field hasn't been set yet
    const data = userDoc.data();
    return data?.tokens || 0;
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return 0;
  }
}

/**
 * Deducts the specified amount of tokens from the user's balance.
 */
export async function deductTokens(userId: string, amount: number, reason: string, collection: "users" | "students" = "users") {
  try {
    const userRef = db.collection(collection).doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return { success: false, message: "User/Student not found" };
    }
    
    const currentTokens = userDoc.data()?.tokens || 0;
    
    if (currentTokens < amount) {
      return { success: false, message: "Insufficient tokens" };
    }
    
    await userRef.update({
      tokens: currentTokens - amount
    });
    
    // Log transaction
    await db.collection("token_transactions").add({
      userId,
      collection,
      amount: -amount,
      reason,
      createdAt: new Date()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deducting tokens:", error);
    return { success: false, message: error.message || "Failed to deduct tokens" };
  }
}

/**
 * Adds the specified amount of tokens to the user's balance (e.g. after a purchase).
 */
export async function addTokens(amount: number, reason: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "Unauthorized" };
    }
    
    const userId = user.id;
    const collection = user.type === "student" ? "students" : "users";
    const userRef = db.collection(collection).doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return { success: false, message: "User/Student not found" };
    }
    
    const currentTokens = userDoc.data()?.tokens || 0;
    
    await userRef.update({
      tokens: currentTokens + amount
    });
    
    // Log transaction
    await db.collection("token_transactions").add({
      userId,
      collection,
      amount,
      reason,
      createdAt: new Date()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error adding tokens:", error);
    return { success: false, message: error.message || "Failed to add tokens" };
  }
}
