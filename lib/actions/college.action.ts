"use server";

import { db } from "@/firebase/admin";
import { revalidatePath } from "next/cache";

function generatePassword(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateStudentId(name: string, branch: string, year: string): string {
  const prefix = branch.substring(0, 2).toUpperCase();
  const nameCode = name.replace(/\s+/g, "").substring(0, 3).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${year}${nameCode}${random}`;
}

export async function addStudent({
  collegeName,
  collegeId,
  name,
  year,
  branch,
}: {
  collegeName: string;
  collegeId: string;
  name: string;
  year: string;
  branch: string;
}) {
  try {
    // Check college plan and student limits
    const collegeDoc = await db.collection("college").doc(collegeId).get();
    if (!collegeDoc.exists) {
        return { success: false, message: "College not found." };
    }

    const collegeData = collegeDoc.data();
    if (!collegeData?.plan) {
        return { success: false, message: "No active plan found. Please select a plan first." };
    }

    const currentStudentSnapshot = await db.collection("students").where("collegeId", "==", collegeId).get();
    if (currentStudentSnapshot.size >= (collegeData.studentLimit || 0)) {
        return { success: false, message: "Student limit reached for your current plan." };
    }

    const studentId = generateStudentId(name, branch, year);
    const password = generatePassword();

    // Assign tokens based on college plan
    const tokens = collegeData.plan === "pro" ? 4200 : 1800;

    const docRef = await db.collection("students").add({
      name,
      year,
      branch,
      collegeId,
      collegeName,
      studentId,
      password,
      tokens,
      createdAt: new Date().toISOString(),
    });

    revalidatePath("/college/dashboard/add-students");

    return {
      success: true,
      message: "Student added successfully!",
      student: {
        id: docRef.id,
        studentId,
        password,
        name,
        year,
        branch,
      },
    };
  } catch (error: any) {
    console.error("Add student error:", error);
    return { success: false, message: `Failed to add student: ${error.message}` };
  }
}

export async function getCollegeDetails(collegeId: string) {
    try {
        const doc = await db.collection("college").doc(collegeId).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error("Error fetching college details:", error);
        return null;
    }
}

export async function activateCollegePlan(collegeId: string, { plan, studentLimit, amount }: { plan: string, studentLimit: number, amount: number }) {
    try {
        await db.collection("college").doc(collegeId).update({
            plan,
            studentLimit,
            planAmount: amount,
            planActivatedAt: new Date().toISOString(),
        });

        // Log transaction
        await db.collection("college_transactions").add({
            collegeId,
            plan,
            studentLimit,
            amount,
            createdAt: new Date().toISOString()
        });

        revalidatePath("/college/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Error activating college plan:", error);
        return { success: false, message: error.message };
    }
}

export async function getStudentsByCollege(collegeId: string) {
  try {
    // Simple single-field query — no composite index needed
    const snapshot = await db
      .collection("students")
      .where("collegeId", "==", collegeId)
      .get();

    const students = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // Sort by createdAt descending in memory (no Firestore index required)
    students.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return students;
  } catch (error: any) {
    console.error("Get students error:", error);
    return [];
  }
}
export async function getStudentDetails(studentFirestoreId: string) {
    try {
        const doc = await db.collection("students").doc(studentFirestoreId).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as any;
    } catch (error) {
        console.error("Error fetching student details:", error);
        return null;
    }
}

export async function getStudentPerformance(studentFirestoreId: string) {
    try {
        // 1. Fetch Aptitude Submissions
        const aptitudeSnapshot = await db
            .collection("aptitudeSubmissions")
            .where("studentFirestoreId", "==", studentFirestoreId)
            .get();
        const aptitudeSubmissions = aptitudeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 2. Fetch Technical Submissions
        const technicalSnapshot = await db
            .collection("technicalSubmissions")
            .where("studentFirestoreId", "==", studentFirestoreId)
            .get();
        const technicalSubmissions = technicalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 3. Fetch AI Interview Results
        // We use userId here since studentFirestoreId is used as userId in interview collection
        const interviewSnapshot = await db
            .collection("interviews")
            .where("userId", "==", studentFirestoreId)
            .where("finalized", "==", true)
            .get();
        
        const interviewResults = await Promise.all(interviewSnapshot.docs.map(async (doc) => {
            const interviewData = doc.data();
            // Fetch feedback for this interview
            const feedbackSnapshot = await db
                .collection("feedback")
                .where("interviewId", "==", doc.id)
                .limit(1)
                .get();
            
            const feedback = feedbackSnapshot.empty ? null : feedbackSnapshot.docs[0].data();
            
            return {
                id: doc.id,
                ...interviewData,
                feedback
            };
        }));

        return {
            aptitude: aptitudeSubmissions,
            technical: technicalSubmissions,
            interviews: interviewResults,
        };
    } catch (error) {
        console.error("Error fetching student performance:", error);
        return {
            aptitude: [],
            technical: [],
            interviews: [],
        };
    }
}
