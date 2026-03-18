export interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}

export interface Interview {
  id: string;
  role: string;
  level?: string;
  position?: string;
  experience?: string;
  questions?: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
  recordingUrl?: string;
}

export interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
  analysis?: {
    avgEyeContact: number;
    avgConfidence: number;
  };
}

export interface User {
  name: string;
  email: string;
  id: string;
  type?: "user" | "college" | "student";
  tokens?: number;
  isIntern?: boolean;
  companyId?: string;
  role?: string;
  experience?: string;
  lastRecordingUrl?: string;
  planId?: string;
  planExpiry?: any;
  isPlanActive?: boolean;
}

export interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
}

export interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
  interviewPosition?: string;
  interviewExperience?: string;
}

export interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

export interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

export interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

export interface SignInParams {
  email: string;
  idToken: string;
}

export interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

type FormType = "sign-in" | "sign-up";

export interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

export interface TechIconProps {
  techStack: string[];
}

export interface CreateFeedbackResponse {
  success: boolean;
  feedbackId?: string;
  error?: string;
}
