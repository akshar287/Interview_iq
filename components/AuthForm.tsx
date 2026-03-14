"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
} from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: "sign-in" | "sign-up") => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type, module = "user" }: { type: "sign-in" | "sign-up"; module?: "user" | "college" }) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
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
        // Firebase specific errors
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

      toast.error(errorMessage, {
        duration: 10000, // Show for 10 seconds to give user time to read
      });
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">VoxIntel</h2>
        </div>

        <h3>{module === "college" ? "College Portal" : "Practice job interviews with AI"}</h3>

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
                placeholder={
                  module === "user" ? "Your Name" : "College Name"
                }
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
      </div>
    </div>
  );
};

export default AuthForm;