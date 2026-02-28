"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_DURATION = 60 * 60 * 24 * 7;

async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000,
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signUp({
  uid,
  name,
  email,
}: {
  uid: string;
  name: string;
  email: string;
}) {
  try {
    const userRecord = await db.collection("users").doc(uid).get();

    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };
    }

    await db.collection("users").doc(uid).set({
      name,
      email,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("Sign up error:", error);
    return {
      success: false,
      message: `Sign up error: ${error.message || "Failed to create account."}`,
    };
  }
}

export async function signIn({
  email,
  idToken,
}: {
  email: string;
  idToken: string;
}) {
  try {
    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist.",
      };
    }

    const dbUserRecord = await db.collection("users").doc(userRecord.uid).get();

    if (!dbUserRecord.exists) {
      await db.collection("users").doc(userRecord.uid).set({
        name: userRecord.displayName || email.split("@")[0],
        email,
        createdAt: new Date(),
      });
    }

    await setSessionCookie(idToken);
  } catch (error: any) {
    console.error("Sign in error:", error);
    return {
      success: false,
      message: `Sign in error: ${error.message || "Failed to log in."}`,
    };
  }

  return { success: true };
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/sign-in");
}

export async function isAuthenticated() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie?.value) {
      return false;
    }

    const decodedToken = await auth.verifySessionCookie(
      sessionCookie.value,
      true
    );

    const userRecord = await db.collection("users").doc(decodedToken.uid).get();

    return !!userRecord.exists;
  } catch (error) {
    console.error("Auth check error:", error);
    return false;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie?.value) {
      return null;
    }

    const decodedToken = await auth.verifySessionCookie(
      sessionCookie.value,
      true
    );

    const userRecord = await db.collection("users").doc(decodedToken.uid).get();

    if (!userRecord.exists) {
      return null;
    }

    return {
      id: decodedToken.uid,
      name: userRecord.data()?.name || "",
      email: userRecord.data()?.email || "",
    };
  } catch (error) {
    console.error("GetCurrentUser error:", error);
    return null;
  }
}