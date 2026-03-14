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
    const studentId = generateStudentId(name, branch, year);
    const password = generatePassword();

    const docRef = await db.collection("students").add({
      name,
      year,
      branch,
      collegeId,
      collegeName,
      studentId,
      password,
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
