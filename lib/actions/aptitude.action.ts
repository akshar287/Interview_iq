"use server";

import { db } from "@/firebase/admin";
import { revalidatePath } from "next/cache";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export interface Question {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
}

export async function saveAptitudeExam({
  collegeId,
  collegeName,
  duration,
  questions,
}: {
  collegeId: string;
  collegeName: string;
  duration: number;
  questions: Question[];
}) {
  try {
    const existing = await db
      .collection("aptitudeExams")
      .where("collegeId", "==", collegeId)
      .get();

    if (!existing.empty) {
      await existing.docs[0].ref.update({
        duration,
        questions,
        updatedAt: new Date().toISOString(),
        status: "active",
      });
    } else {
      await db.collection("aptitudeExams").add({
        collegeId,
        collegeName,
        duration,
        questions,
        createdAt: new Date().toISOString(),
        status: "active",
      });
    }

    revalidatePath("/college/dashboard/aptitude-round");
    return { success: true, message: "Exam paper saved successfully!" };
  } catch (error: any) {
    return { success: false, message: `Failed to save: ${error.message}` };
  }
}

export async function getAptitudeExamByCollege(collegeId: string) {
  try {
    const snapshot = await db
      .collection("aptitudeExams")
      .where("collegeId", "==", collegeId)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as any;
  } catch (error: any) {
    return null;
  }
}

export async function getSubmissionsByCollege(collegeId: string) {
  try {
    const snapshot = await db
      .collection("aptitudeSubmissions")
      .where("collegeId", "==", collegeId)
      .get();

    const submissions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // Sort by percentage descending
    submissions.sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0));
    return submissions;
  } catch (error: any) {
    return [];
  }
}

async function generateAIFeedback(
  questions: Question[],
  answers: Record<number, string>,
  answerTimes: Record<number, number>,
  totalTimeUsed: number
): Promise<string> {
  const questionsText = questions
    .map((q, idx) => {
      const studentAns = answers[idx] || "Not answered";
      const timeTaken = answerTimes[idx] ?? 0;
      const isCorrect = answers[idx] === q.correctAnswer;
      const optionMap: Record<string, string> = {
        A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD,
      };

      return `
Q${idx + 1}: ${q.question}
Options: A) ${q.optionA}  B) ${q.optionB}  C) ${q.optionC}  D) ${q.optionD}
Student's Answer: ${studentAns} (${optionMap[studentAns] || "—"})
Correct Answer: ${q.correctAnswer} (${optionMap[q.correctAnswer]})
Result: ${isCorrect ? "✓ CORRECT" : "✗ WRONG"}
Time Taken: ${timeTaken} seconds`;
    })
    .join("\n\n");

  const totalCorrect = questions.filter((q, i) => answers[i] === q.correctAnswer).length;
  const totalMinutes = Math.floor(totalTimeUsed / 60);
  const totalSeconds = totalTimeUsed % 60;

  const prompt = `You are an expert aptitude exam analyser and educator. A student just completed an aptitude exam.

EXAM STATISTICS:
- Total Questions: ${questions.length}
- Correct Answers: ${totalCorrect}/${questions.length}
- Score: ${Math.round((totalCorrect / questions.length) * 100)}%
- Total time used: ${totalMinutes} min ${totalSeconds} sec

DETAILED QUESTION-WISE PERFORMANCE:
${questionsText}

Return ONLY a raw JSON object (no markdown, no backticks, no extra text) with this exact structure:
{
  "overallSummary": "2-3 sentence honest overall performance summary",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weakAreas": ["weak area 1", "weak area 2"],
  "questionAnalysis": [
    {
      "questionNumber": 1,
      "isCorrect": true,
      "timeTaken": 45,
      "yourAnswer": "A",
      "correctAnswer": "A",
      "explanation": "Step-by-step correct approach or why the answer is correct",
      "tip": "Faster shortcut or method especially for math questions, or empty string if not applicable"
    }
  ],
  "timeManagement": "Paragraph about time management: which questions took too long, ideal strategy",
  "improvementTips": ["actionable tip 1", "tip 2", "tip 3", "tip 4"],
  "studyPlan": [
    { "week": "Week 1", "focus": "Main topic", "tasks": ["task 1", "task 2", "task 3"] },
    { "week": "Week 2", "focus": "Main topic", "tasks": ["task 1", "task 2", "task 3"] }
  ]
}`;


  try {
    const { text } = await generateText({
      model: google("gemini-flash-latest"),
      prompt,
      maxTokens: 4000,
    });
    return text;
  } catch (error: any) {
    console.error("Gemini feedback error:", error);
    return "We could not generate AI feedback at this time. Your score has been recorded successfully.";
  }
}

export async function submitAptitudeExam({
  examId,
  sessionId,
  studentId,
  collegeId,
  studentFirestoreId,
  studentName,
  studentYear,
  studentBranch,
  answers,
  answerTimes,
  totalTimeUsed,
  autoSubmitted,
  questions,
}: {
  examId: string;
  sessionId?: string;
  studentId: string;
  collegeId: string;
  studentFirestoreId: string;
  studentName: string;
  studentYear: string;
  studentBranch: string;
  answers: Record<number, string>;
  answerTimes: Record<number, number>;
  totalTimeUsed: number;
  autoSubmitted: boolean;
  questions: Question[];
}) {
  try {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) score++;
    });

    const percentage = Math.round((score / questions.length) * 100);

    const [aiFeedback] = await Promise.all([
      generateAIFeedback(questions, answers, answerTimes, totalTimeUsed),
    ]);

    await db.collection("aptitudeSubmissions").add({
      examId,
      sessionId: sessionId || null,
      studentId,
      studentName,
      studentYear,
      studentBranch,
      collegeId,
      studentFirestoreId,
      answers,
      answerTimes,
      totalTimeUsed,
      score,
      totalQuestions: questions.length,
      percentage,
      autoSubmitted,
      aiFeedback,
      submittedAt: new Date().toISOString(),
    });

    return { success: true, score, percentage, aiFeedback };
  } catch (error: any) {
    console.error("Submit exam error:", error);
    return { success: false, message: error.message };
  }
}

// ── Exam Session Management ──────────────────────────────────

export async function startExamSession({
  collegeId,
  collegeName,
  examId,
}: {
  collegeId: string;
  collegeName: string;
  examId: string;
}) {
  try {
    // Check no active session already
    const existing = await db
      .collection("aptitudeExamSessions")
      .where("collegeId", "==", collegeId)
      .where("status", "==", "active")
      .get();
    if (!existing.empty) {
      return { success: false, message: "An exam session is already active. End it before starting a new one." };
    }

    // Count total past sessions to generate name
    const allSessions = await db
      .collection("aptitudeExamSessions")
      .where("collegeId", "==", collegeId)
      .get();
    const sessionNumber = allSessions.size + 1;
    const sessionName = `Exam ${sessionNumber}`;

    const ref = await db.collection("aptitudeExamSessions").add({
      collegeId,
      collegeName,
      examId,
      sessionName,
      status: "active",
      startedAt: new Date().toISOString(),
      endedAt: null,
    });

    revalidatePath("/college/dashboard/aptitude-round");
    return { success: true, sessionId: ref.id, sessionName };
  } catch (error: any) {
    return { success: false, message: `Failed to start exam: ${error.message}` };
  }
}

export async function endExamSession(sessionId: string) {
  try {
    await db.collection("aptitudeExamSessions").doc(sessionId).update({
      status: "ended",
      endedAt: new Date().toISOString(),
    });
    revalidatePath("/college/dashboard/aptitude-round");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: `Failed to end exam: ${error.message}` };
  }
}

export async function getActiveSession(collegeId: string) {
  try {
    const snapshot = await db
      .collection("aptitudeExamSessions")
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

export async function getAllSessions(collegeId: string) {
  try {
    const snapshot = await db
      .collection("aptitudeExamSessions")
      .where("collegeId", "==", collegeId)
      .get();
    const sessions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    sessions.sort((a, b) => (b.startedAt > a.startedAt ? 1 : -1));
    return sessions;
  } catch {
    return [];
  }
}

export async function getSubmissionsBySession(sessionId: string) {
  try {
    const snapshot = await db
      .collection("aptitudeSubmissions")
      .where("sessionId", "==", sessionId)
      .get();
    const submissions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    submissions.sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0));
    return submissions;
  } catch {
    return [];
  }
}

export async function applyForExam({
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
    // Prevent duplicate applications
    const existing = await db
      .collection("examApplications")
      .where("studentId", "==", studentId)
      .where("sessionId", "==", sessionId)
      .get();
    if (!existing.empty) {
      return { success: true, alreadyApplied: true };
    }

    await db.collection("examApplications").add({
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

export async function getStudentApplication(studentId: string, sessionId: string) {
  try {
    const snapshot = await db
      .collection("examApplications")
      .where("studentId", "==", studentId)
      .where("sessionId", "==", sessionId)
      .get();
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
  } catch {
    return null;
  }
}

export async function studentLogin({
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

    return {
      success: true,
      student: {
        firestoreId: studentDoc.id,
        studentId: studentData.studentId,
        name: studentData.name,
        year: studentData.year,
        branch: studentData.branch,
        collegeId: studentData.collegeId,
        collegeName: studentData.collegeName,
      },
    };
  } catch (error: any) {
    return { success: false, message: `Login failed: ${error.message}` };
  }
}
