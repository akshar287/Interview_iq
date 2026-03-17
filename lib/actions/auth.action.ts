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
      tokens: 0,
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

export async function collegeSignUp({
  uid,
  name,
  email,
}: {
  uid: string;
  name: string;
  email: string;
}) {
  try {
    const collegeRecord = await db.collection("college").doc(uid).get();

    if (collegeRecord.exists) {
      return {
        success: false,
        message: "College already exists. Please sign in.",
      };
    }

    await db.collection("college").doc(uid).set({
      name,
      email,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: "College account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("College sign up error:", error);
    return {
      success: false,
      message: `College sign up error: ${error.message || "Failed to create college account."}`,
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
      // Check if this account belongs to a college — if so, reject user login
      const dbCollegeRecord = await db.collection("college").doc(userRecord.uid).get();
      if (dbCollegeRecord.exists) {
        return {
          success: false,
          message: "This account is a college account. Please sign in at the College portal.",
        };
      }
      return {
        success: false,
        message: "User does not exist.",
      };
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

export async function collegeSignIn({
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
        message: "College does not exist.",
      };
    }

    const dbCollegeRecord = await db.collection("college").doc(userRecord.uid).get();

    if (!dbCollegeRecord.exists) {
      return {
        success: false,
        message: "College profile not found.",
      };
    }

    await setSessionCookie(idToken);
  } catch (error: any) {
    console.error("College sign in error:", error);
    return {
      success: false,
      message: `College sign in error: ${error.message || "Failed to log in."}`,
    };
  }

  return { success: true };
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/");
}

export async function isAuthenticated() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (sessionCookie?.value) {
      const decodedToken = await auth.verifySessionCookie(
        sessionCookie.value,
        true
      );

      const userRecord = await db.collection("users").doc(decodedToken.uid).get();
      if (userRecord.exists) return true;

      const collegeRecord = await db.collection("college").doc(decodedToken.uid).get();
      if (collegeRecord.exists) return true;
    }

    // Fallback to student session
    const student = await getStudentFromSession();
    return !!student;
  } catch (error) {
    // If Firebase check fails, still try student fallback
    const student = await getStudentFromSession();
    return !!student;
  }
}

// ─── Student Session via Cookie ────────────────────────────────────────────

export async function signInAsStudent({
  studentId,
  password,
}: {
  studentId: string;
  password: string;
}) {
  try {
    const snapshot = await db
      .collection("students")
      .where("studentId", "==", studentId)
      .get();

    if (snapshot.empty) {
      return { success: false, message: "Student ID not found." };
    }

    const studentDoc = snapshot.docs[0];
    const studentData = studentDoc.data();

    if (studentData.password !== password) {
      return { success: false, message: "Incorrect password." };
    }

    const student = {
      firestoreId: studentDoc.id,
      studentId: studentData.studentId,
      name: studentData.name,
      year: studentData.year,
      branch: studentData.branch,
      collegeId: studentData.collegeId,
      collegeName: studentData.collegeName,
      tokens: studentData.tokens || 0,
    };

    // Store session in an HTTP-only cookie so server components can read it
    const cookieStore = await cookies();
    cookieStore.set("studentSession", JSON.stringify(student), {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return { success: true, student };
  } catch (error: any) {
    return { success: false, message: `Login failed: ${error.message}` };
  }
}

export async function getStudentFromSession() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("studentSession")?.value;
    if (!raw) return null;
    
    const sessionData = JSON.parse(raw) as {
      firestoreId: string;
      studentId: string;
      name: string;
      year: string;
      branch: string;
      collegeId: string;
      collegeName: string;
      tokens: number;
    };

    // Fetch real-time tokens from Firestore to avoid stale display
    const studentDoc = await db.collection("students").doc(sessionData.firestoreId).get();
    if (studentDoc.exists) {
      sessionData.tokens = studentDoc.data()?.tokens || 0;
    }

    return sessionData;
  } catch {
    return null;
  }
}

export async function clearStudentSession() {
  const cookieStore = await cookies();
  cookieStore.delete("studentSession");
}

// ─── End Student Session ────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    if (sessionCookie?.value) {
      const decodedToken = await auth.verifySessionCookie(
        sessionCookie.value,
        true
      );

      let userRecord = await db.collection("users").doc(decodedToken.uid).get();
      let type: "user" | "college" = "user";

      if (!userRecord.exists) {
        userRecord = await db.collection("college").doc(decodedToken.uid).get();
        type = "college";
      }

      if (userRecord.exists) {
        return {
          id: decodedToken.uid,
          name: userRecord.data()?.name || "",
          email: userRecord.data()?.email || "",
          type,
          tokens: userRecord.data()?.tokens || 0,
          isIntern: userRecord.data()?.isIntern || false,
          companyId: userRecord.data()?.companyId || "",
          role: userRecord.data()?.role || "",
        };
      }
    }

    // Fallback to student session
    const student = await getStudentFromSession();
    if (student) {
      return {
        id: student.firestoreId,
        name: student.name,
        email: "",
        type: "student" as any,
        tokens: student.tokens,
      };
    }

    return null;
  } catch (error) {
    // If Firebase session fails, check for student session
    const student = await getStudentFromSession();
    if (student) {
        return {
            id: student.firestoreId,
            name: student.name,
            email: "", // Students might not have email in session
            type: "student" as any,
            tokens: student.tokens,
        };
    }
    console.error("GetCurrentUser error:", error);
    return null;
  }
}