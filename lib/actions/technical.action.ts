"use server";

import { db } from "@/firebase/admin";
import { revalidatePath } from "next/cache";

export interface TechQuestion {
  title: string;
  description: string;
  exampleInput: string;
  exampleOutput: string;
  constraints: string;
}

export async function saveTechnicalExam({
  collegeId,
  collegeName,
  duration,
  questions,
  languagesAllowed,
}: {
  collegeId: string;
  collegeName: string;
  duration: number;
  questions: TechQuestion[];
  languagesAllowed: string[];
}) {
  try {
    const existing = await db
      .collection("technicalExams")
      .where("collegeId", "==", collegeId)
      .get();

    if (!existing.empty) {
      await db.collection("technicalExams").doc(existing.docs[0].id).update({
        duration,
        questions,
        languagesAllowed,
        updatedAt: new Date().toISOString(),
      });
      revalidatePath("/college/dashboard/technical-round");
      return { success: true };
    }

    await db.collection("technicalExams").add({
      collegeId,
      collegeName,
      duration,
      questions,
      languagesAllowed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/college/dashboard/technical-round");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getTechnicalExamByCollege(collegeId: string) {
  try {
    const snapshot = await db
      .collection("technicalExams")
      .where("collegeId", "==", collegeId)
      .get();
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
  } catch {
    return null;
  }
}

// ── Exam Session Management ──────────────────────────────────

export async function startTechSession({
  collegeId,
  collegeName,
  examId,
}: {
  collegeId: string;
  collegeName: string;
  examId: string;
}) {
  try {
    const existing = await db
      .collection("technicalExamSessions")
      .where("collegeId", "==", collegeId)
      .where("status", "==", "active")
      .get();
    if (!existing.empty) {
      return { success: false, message: "A technical exam session is already active." };
    }

    const allSessions = await db
      .collection("technicalExamSessions")
      .where("collegeId", "==", collegeId)
      .get();
    const sessionNumber = allSessions.size + 1;
    const sessionName = `Tech Exam ${sessionNumber}`;

    const ref = await db.collection("technicalExamSessions").add({
      collegeId,
      collegeName,
      examId,
      sessionName,
      status: "active",
      startedAt: new Date().toISOString(),
      endedAt: null,
    });

    revalidatePath("/college/dashboard/technical-round");
    return { success: true, sessionId: ref.id, sessionName };
  } catch (error: any) {
    return { success: false, message: `Failed to start exam: ${error.message}` };
  }
}

export async function endTechSession(sessionId: string) {
  try {
    await db.collection("technicalExamSessions").doc(sessionId).update({
      status: "ended",
      endedAt: new Date().toISOString(),
    });
    revalidatePath("/college/dashboard/technical-round");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: `Failed to end exam: ${error.message}` };
  }
}

export async function getActiveTechSession(collegeId: string) {
  try {
    const snapshot = await db
      .collection("technicalExamSessions")
      .where("collegeId", "==", collegeId)
      .where("status", "==", "active")
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as any;
  } catch {
    return null;
  }
}

export async function getAllTechSessions(collegeId: string) {
  try {
    const snapshot = await db
      .collection("technicalExamSessions")
      .where("collegeId", "==", collegeId)
      .get();
    const sessions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    sessions.sort((a, b) => (b.startedAt > a.startedAt ? 1 : -1));
    return sessions;
  } catch {
    return [];
  }
}

export async function getTechSubmissionsBySession(sessionId: string) {
  try {
    const snapshot = await db
      .collection("technicalSubmissions")
      .where("sessionId", "==", sessionId)
      .get();
    const submissions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    submissions.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return submissions;
  } catch {
    return [];
  }
}

export async function applyForTechExam({
  studentId,
  studentFirestoreId,
  sessionId,
  collegeId,
}: {
  studentId: string;
  studentFirestoreId: string;
  sessionId: string;
  collegeId: string;
}) {
  try {
    const existing = await db
      .collection("techExamApplications")
      .where("studentId", "==", studentId)
      .where("sessionId", "==", sessionId)
      .get();
    if (!existing.empty) {
      return { success: true, alreadyApplied: true };
    }

    await db.collection("techExamApplications").add({
      studentId,
      studentFirestoreId,
      sessionId,
      collegeId,
      appliedAt: new Date().toISOString(),
      status: "applied",
    });
    return { success: true, alreadyApplied: false };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getTechStudentApplication(studentId: string, sessionId: string) {
  try {
    const snapshot = await db
      .collection("techExamApplications")
      .where("studentId", "==", studentId)
      .where("sessionId", "==", sessionId)
      .get();
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
  } catch {
    return null;
  }
}

// AI Submission evaluation stub
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export async function submitTechnicalExam({
  examId,
  sessionId,
  studentId,
  collegeId,
  studentFirestoreId,
  studentName,
  studentYear,
  studentBranch,
  totalTimeUsed,
  autoSubmitted,
  codes,
  questions,
}: {
  examId: string;
  sessionId: string;
  studentId: string;
  collegeId: string;
  studentFirestoreId: string;
  studentName: string;
  studentYear: string;
  studentBranch: string;
  totalTimeUsed: number;
  autoSubmitted: boolean;
  codes: Record<number, { language: string; code: string }>;
  questions: TechQuestion[];
}) {
  try {
    // Generate AI evaluation of the submitted code
    let aiEvaluationText = "";
    let totalScore = 0;
    
    // We will build a prompt containing all the questions and the user's code.
    const prompt = `
You are an expert technical interviewer and code evaluator. You are evaluating a student's technical exam. 
Here are the questions and the student's submitted code:

${questions.map((q, idx) => `
Q${idx + 1}: ${q.title}
Description: ${q.description}
Student Code (${codes[idx]?.language || "None"}):
\`\`\`${codes[idx]?.language || "text"}
${codes[idx]?.code || "No code submitted."}
\`\`\`
`).join("\n")}

Respond with ONLY valid JSON strictly matching this Zod schema:
{
  "totalScore": number (out of 100),
  "overallSummary": string,
  "questionAnalysis": [
    {
      "questionNumber": number,
      "score": number (out of 10),
      "feedback": string,
      "timeComplexity": string,
      "spaceComplexity": string,
      "isCorrect": boolean
    }
  ],
  "strengths": string[],
  "weakAreas": string[],
  "improvementTips": string[]
}
    `;

    const model = google("gemini-flash-latest" as string, { structuredOutputs: false, useSearchGrounding: false });
    const { object } = await generateObject({
        model,
        schema: z.object({
            totalScore: z.number(),
            overallSummary: z.string(),
            questionAnalysis: z.array(z.object({
                questionNumber: z.number(),
                score: z.number(),
                feedback: z.string(),
                timeComplexity: z.string(),
                spaceComplexity: z.string(),
                isCorrect: z.boolean(),
            })),
            strengths: z.array(z.string()),
            weakAreas: z.array(z.string()),
            improvementTips: z.array(z.string()),
        }),
        prompt,
    });

    const aiFeedback = JSON.stringify(object, null, 2);

    await db.collection("technicalSubmissions").add({
      examId,
      sessionId,
      studentId,
      studentName,
      studentYear,
      studentBranch,
      collegeId,
      studentFirestoreId,
      codes,
      totalTimeUsed,
      score: object.totalScore,
      percentage: object.totalScore,
      autoSubmitted,
      aiFeedback,
      submittedAt: new Date().toISOString(),
    });

    return { success: true, score: object.totalScore, percentage: object.totalScore, aiFeedback };
  } catch (error: any) {
    console.error("Submit tech exam error:", error);
    return { success: false, message: error.message };
  }
}

export async function executeCode({
  language,
  version,
  content,
}: {
  language: string;
  version: string;
  content: string;
}) {
  const mirrors = [
    "https://emkc.org/api/v2/piston/execute",
    "https://piston.rs/api/v2/execute",
    "https://piston.engineering/api/v2/execute",
    "https://api.piston.rs/api/v2/execute",
  ];

  let googleStatus = "Checking...";
  try {
    const check = await fetch("https://www.google.com", { 
      method: "HEAD", 
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    googleStatus = `Connected (${check.status})`;
  } catch (e: any) {
    googleStatus = `Failed (${e.message})`;
  }

  let log = "";

  for (const mirror of mirrors) {
    try {
      console.log(`[Technical Action] Trying mirror: ${mirror}`);
      const res = await fetch(mirror, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          version,
          files: [{ content }],
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, data };
      }
      
      const errText = await res.text().catch(() => "No error body");
      log += `Mirror ${mirror} failed (${res.status}): ${errText.substring(0, 100)}. `;
      console.error(log);
    } catch (error: any) {
      log += `Mirror ${mirror} fetch error: ${error.message}. `;
      console.error(log);
    }
  }

  return { 
    success: false, 
    message: `${log} [System Diagnostic] Google Connectivity: ${googleStatus}. Your local ISP or Firewall might be blocking coding API domains (emkc.org, piston.rs).` 
  };
}






export async function generateTechnicalProblem(difficulty: 'Easy' | 'Medium' | 'Difficult') {
  try {
    const prompt = `
Generate a unique, creative, and highly specific technical coding problem for a student interview.
Difficulty Level: ${difficulty}
Random Seed/Time: ${new Date().toISOString()}

INSTRUCTIONS:
1. DO NOT generate standard/famous problems (like Two Sum, Reverse String, etc.).
2. Create a realistic real-world scenario (e.g., related to space exploration, financial tech, medical devices, etc.).
3. The problem should require logic and algorithmic thinking.
4. Provide a clear 'solution' field with a well-commented, optimal Python implementation.

Respond with ONLY valid JSON strictly matching this Zod schema:
{
  "title": string,
  "description": string,
  "exampleInput": string,
  "exampleOutput": string,
  "constraints": string,
  "baseCode": string (Starter function template in Python),
  "testCases": [{ "input": string, "expectedOutput": string }],
  "solution": string (Optimal Python solution)
}
    `;

    const model = google("gemini-flash-latest" as string, { structuredOutputs: false, useSearchGrounding: false });
    const { object } = await generateObject({
      model,
      schema: z.object({
        title: z.string(),
        description: z.string(),
        exampleInput: z.string(),
        exampleOutput: z.string(),
        constraints: z.string(),
        baseCode: z.string(),
        testCases: z.array(z.object({
            input: z.string(),
            expectedOutput: z.string()
        })),
        solution: z.string(),
      }),
      prompt,
    });

    return { success: true, problem: object };
  } catch (error: any) {
    console.error("Generate tech problem error:", error);
    return { success: false, message: error.message };
  }
}

export async function evaluateTechnicalSubmission({
  problem,
  code,
  language,
}: {
  problem: any;
  code: string;
  language: string;
}) {
  try {
    const prompt = `
You are an expert technical interviewer and code evaluator. 
Evaluate the following technical coding problem and the student's submitted code.

Problem Title: ${problem.title}
Problem Description: ${problem.description}
Constraints: ${problem.constraints}

Student Code (${language}):
\`\`\`${language}
${code || "No code submitted."}
\`\`\`

Respond with ONLY valid JSON strictly matching this Zod schema:
{
  "score": number (out of 100),
  "overallSummary": string,
  "feedback": string,
  "timeComplexity": string,
  "spaceComplexity": string,
  "isCorrect": boolean,
  "strengths": string[],
  "weakAreas": string[],
  "improvementTips": string[]
}
    `;

    const model = google("gemini-flash-latest" as string, { structuredOutputs: false, useSearchGrounding: false });
    const { object } = await generateObject({
      model,
      schema: z.object({
        score: z.number(),
        overallSummary: z.string(),
        feedback: z.string(),
        timeComplexity: z.string(),
        spaceComplexity: z.string(),
        isCorrect: z.boolean(),
        strengths: z.array(z.string()),
        weakAreas: z.array(z.string()),
        improvementTips: z.array(z.string()),
      }),
      prompt,
    });

    return { success: true, evaluation: object };
  } catch (error: any) {
    console.error("Evaluate tech submission error:", error);
    return { success: false, message: error.message };
  }
}

export async function savePracticeTechnicalResult({
  studentFirestoreId,
  problem,
  code,
  language,
  totalTimeUsed,
  evaluation,
}: {
  studentFirestoreId: string;
  problem: any;
  code: string;
  language: string;
  totalTimeUsed: number;
  evaluation: any;
}) {
  try {
    let studentData: any = {};
    const studentDoc = await db.collection("students").doc(studentFirestoreId).get();
    
    if (studentDoc.exists) {
      studentData = studentDoc.data()!;
    } else {
      const userDoc = await db.collection("users").doc(studentFirestoreId).get();
      if (!userDoc.exists) {
        return { success: false, message: "User/Student not found" };
      }
      studentData = userDoc.data()!;
    }

    await db.collection("technicalSubmissions").add({
      examId: "practice",
      sessionId: null,
      studentId: studentData.studentId || null,
      studentName: studentData.name || null,
      studentYear: studentData.year || null,
      studentBranch: studentData.branch || null,
      collegeId: studentData.collegeId || null,
      studentFirestoreId,
      codes: { 0: { language, code } },
      totalTimeUsed,
      score: evaluation.score || 0,
      percentage: evaluation.score || 0,
      autoSubmitted: false,
      aiFeedback: JSON.stringify(evaluation),
      submittedAt: new Date().toISOString(),
      isPractice: true,
    });
    return { success: true };
  } catch (error: any) {
    console.error("Save practice tech error:", error);
    return { success: false, message: error.message };
  }
}

// ── Student History ───────────────────────────────────────────────────────────

export async function getStudentTechnicalHistory(studentFirestoreId: string) {
  try {
    const snapshot = await db
      .collection("technicalSubmissions")
      .where("studentFirestoreId", "==", studentFirestoreId)
      .get();

    const submissions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    submissions.sort((a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return submissions;
  } catch (error: any) {
    console.error("getStudentTechnicalHistory error:", error);
    return [];
  }
}

