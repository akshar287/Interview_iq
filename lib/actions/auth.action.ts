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
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      message: "Failed to create account.",
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

    await setSessionCookie(idToken);
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      success: false,
      message: "Failed to log in.",
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

    return !!decodedToken?.uid;
  } catch (error) {
    console.error("Auth check error:", error);
    return false;
  }
}