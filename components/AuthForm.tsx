"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import {
  signIn,
  signUp,
  collegeSignIn,
  collegeSignUp,
  signInAsStudent,
} from "@/lib/actions/auth.action";
import FormField from "./FormField";
import { GraduationCap, Mail, Loader2 } from "lucide-react";

const authFormSchema = (type: "sign-in" | "sign-up") => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const studentFormSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  password: z.string().min(1, "Password is required"),
});

const AuthForm = ({ type, module = "user" }: { type: "sign-in" | "sign-up"; module?: "user" | "college" }) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);

  // Tab state: "email" = normal login, "student" = student ID login
  // Only used when module === "user" and type === "sign-in"
  const [loginTab, setLoginTab] = useState<"email" | "student">("email");
  const [studentLoading, setStudentLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const studentForm = useForm<z.infer<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      studentId: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result =
          module === "user"
            ? await signUp({
              uid: userCredential.user.uid,
              name: name!,
              email,
            })
            : await collegeSignUp({
              uid: userCredential.user.uid,
              name: name!,
              email,
            });

        if (!result?.success) {
          toast.error(result?.message);
          return;
        }

        toast.success(
          `${module === "user" ? "Account" : "College account"
          } created successfully. Please sign in.`
        );
        router.push(module === "college" ? "/college/sign-in" : "/sign-in");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();

        if (!idToken) {
          toast.error("Sign in failed.");
          return;
        }

        const result =
          module === "user"
            ? await signIn({
              email,
              idToken,
            })
            : await collegeSignIn({
              email,
              idToken,
            });

        if (result && !result.success) {
          toast.error(result.message);
        } else {
          toast.success("Signed in successfully.");
          router.push(module === "college" ? "/college/dashboard" : "/");
        }
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      let errorMessage = "An unexpected error occurred.";

      if (error?.code) {
        switch (error.code) {
          case "auth/invalid-credential":
            errorMessage = "Invalid email or password.";
            break;
          case "auth/user-not-found":
            errorMessage = "No account found with this email.";
            break;
          case "auth/wrong-password":
            errorMessage = "Incorrect password.";
            break;
          case "auth/email-already-in-use":
            errorMessage = "This email is already registered.";
            break;
          case "auth/unauthorized-domain":
            errorMessage = "Unauthorized Domain: Please add your deployment domain to the Firebase Console -> Authentication -> Settings -> Authorized domains.";
            break;
          default:
            errorMessage = `Firebase Error: ${error.message}`;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { duration: 10000 });
    }
  };

  const onStudentSubmit = async (data: z.infer<typeof studentFormSchema>) => {
    setStudentLoading(true);
    try {
      const result = await signInAsStudent({
        studentId: data.studentId.trim(),
        password: data.password.trim(),
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      // Also store in localStorage so the student layout pages work correctly
      if (typeof window !== "undefined" && result.student) {
        localStorage.setItem("studentSession", JSON.stringify(result.student));
      }

      toast.success(`Welcome, ${result.student?.name}! Redirecting…`);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Login failed.");
    } finally {
      setStudentLoading(false);
    }
  };

  const isSignIn = type === "sign-in";
  const showStudentTab = module === "user" && isSignIn;

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/careely-logo.png" alt="logo" height={32} width={32} className="rounded-md" />
          <h2 className="text-primary-100">Careely</h2>
        </div>

        <h3>{module === "college" ? "College Portal" : "Practice job interviews with AI"}</h3>

        {/* Tab switcher — only shown on user sign-in */}
        {showStudentTab && (
          <div className="flex rounded-xl border border-white/10 overflow-hidden">
            <button
              type="button"
              onClick={() => setLoginTab("email")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${loginTab === "email"
                  ? "bg-primary-200/20 text-primary-200"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
            >
              <Mail size={14} />
              Email Login
            </button>
            <button
              type="button"
              onClick={() => setLoginTab("student")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${loginTab === "student"
                  ? "bg-primary-200/20 text-primary-200"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
            >
              <GraduationCap size={14} />
              Student ID Login
            </button>
          </div>
        )}

        {/* ── Email / College form ── */}
        {(!showStudentTab || loginTab === "email") && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6 mt-4 form"
            >
              {!isSignIn && (
                <FormField
                  control={form.control}
                  name="name"
                  label={module === "user" ? "Name" : "College Name"}
                  placeholder={module === "user" ? "Your Name" : "College Name"}
                  type="text"
                />
              )}

              <FormField
                control={form.control}
                name="email"
                label="Email"
                placeholder="Your email address"
                type="email"
              />

              <FormField
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                type="password"
              />

              <Button className="btn" type="submit">
                {isSignIn ? "Sign In" : "Create an Account"}
              </Button>
            </form>
          </Form>
        )}

        {/* ── Student ID form ── */}
        {showStudentTab && loginTab === "student" && (
          <form
            onSubmit={studentForm.handleSubmit(onStudentSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/70">Student ID</label>
              <input
                type="text"
                {...studentForm.register("studentId")}
                placeholder="e.g. CS3RAH4521"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono placeholder:text-white/25 focus:outline-none focus:border-primary-200/50 focus:bg-white/8 transition-all"
              />
              {studentForm.formState.errors.studentId && (
                <p className="text-red-400 text-xs">{studentForm.formState.errors.studentId.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/70">Password</label>
              <input
                type="password"
                {...studentForm.register("password")}
                placeholder="Enter your password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-primary-200/50 transition-all"
              />
              {studentForm.formState.errors.password && (
                <p className="text-red-400 text-xs">{studentForm.formState.errors.password.message}</p>
              )}
            </div>

            <Button type="submit" disabled={studentLoading} className="btn w-full">
              {studentLoading ? (
                <><Loader2 size={16} className="animate-spin mr-2" />Logging in…</>
              ) : (
                <><GraduationCap size={16} className="mr-2" />Login to Exam Portal</>
              )}
            </Button>

            <p className="text-center text-white/30 text-xs">
              Use your college-issued Student ID and password.
            </p>
          </form>
        )}

        {(!showStudentTab || loginTab === "email") && (
          <p className="text-center">
            {isSignIn ? "No account yet?" : "Have an account already?"}
            <Link
              href={!isSignIn
                ? (module === "college" ? "/college/sign-in" : "/sign-in")
                : (module === "college" ? "/college/sign-up" : "/sign-up")
              }
              className="font-bold text-user-primary ml-1"
            >
              {!isSignIn ? "Sign In" : "Sign Up"}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;