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

export async function companySignUp({
  uid,
  name,
  email,
}: {
  uid: string;
  name: string;
  email: string;
}) {
  try {
    const companyRecord = await db.collection("company").doc(uid).get();

    if (companyRecord.exists) {
      return {
        success: false,
        message: "Company already exists. Please sign in.",
      };
    }

    await db.collection("company").doc(uid).set({
      name,
      email,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: "Company account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("Company sign up error:", error);
    return {
      success: false,
      message: `Company sign up error: ${error.message || "Failed to create company account."}`,
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

export async function companySignIn({
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
        message: "Company does not exist.",
      };
    }

    const dbCompanyRecord = await db.collection("company").doc(userRecord.uid).get();

    if (!dbCompanyRecord.exists) {
      return {
        success: false,
        message: "Company profile not found.",
      };
    }

    await setSessionCookie(idToken);
  } catch (error: any) {
    console.error("Company sign in error:", error);
    return {
      success: false,
      message: `Company sign in error: ${error.message || "Failed to log in."}`,
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

    if (userRecord.exists) return true;

    const companyRecord = await db.collection("company").doc(decodedToken.uid).get();

    return !!companyRecord.exists;
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

    let userRecord = await db.collection("users").doc(decodedToken.uid).get();
    let type: "user" | "company" = "user";

    if (!userRecord.exists) {
      userRecord = await db.collection("company").doc(decodedToken.uid).get();
      type = "company";
    }

    if (!userRecord.exists) {
      return null;
    }

    return {
      id: decodedToken.uid,
      name: userRecord.data()?.name || "",
      email: userRecord.data()?.email || "",
      type,
      isIntern: userRecord.data()?.isIntern || false,
      companyId: userRecord.data()?.companyId || "",
      role: userRecord.data()?.role || "",
    };
  } catch (error) {
    console.error("GetCurrentUser error:", error);
    return null;
  }
}