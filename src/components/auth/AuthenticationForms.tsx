"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { MdOutlineMail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { FormItem, FormMessage } from "@/components/ui/form";
import SimpleSubmitButton from "@/components/auth/SimpleSubmitButton";
import PasswordToggle from "@/components/auth/PasswordToggle";
import SocialAuth from "@/components/auth/SocialAuth";
import UsernameField from "@/components/auth/UsernameField";
import { signUpAction } from "@/actions/signUpActions";
import { sendVerificationEmailAction } from "@/actions/verificationActions";
import { signInSchema } from "@/schemas/signInSchema";
import { signUpSchema } from "@/schemas/signUpSchema";
import type { AuthData } from "@/types/api.types";
import { signIn } from "next-auth/react";
import { resolveSignInError, mapIssuesToErrors } from "@/lib/authErrors";

export default function AuthenticationForms() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignInLoading, setIsSignInLoading] = useState(false);
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);
  const [signInErrors, setSignInErrors] = useState<Record<string, string>>({});
  const [signUpErrors, setSignUpErrors] = useState<Record<string, string>>({});

  const isValidSignupResponse = (user?: AuthData["user"], code?: string) => {
    return Boolean(user?.email && user?.star_name && code);
  };

  const sendSignupVerificationEmail = async (
    email: string,
    username: string,
    verificationCode: string
  ) => {
    toast.loading("Sending verification email...", { id: "email" });
    try {
      const emailResponse = await sendVerificationEmailAction({
        email,
        username,
        verificationCode,
        type: "verification",
      });
      if (emailResponse?.success) {
        toast.success("Verification email sent! Check your inbox", {
          id: "email",
        });
      } else {
        toast.warning(
          emailResponse?.message ||
            "Account created but email failed to send. You can request a new code later.",
          {
            id: "email",
            duration: 5000,
          }
        );
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      toast.warning("Account created but email failed to send", {
        id: "email",
      });
    }
  };
  const handleSignIn = async (formData: FormData) => {
    setIsSignInLoading(true);
    setSignInErrors({});

    try {
      const formValues = {
        identifier: formData.get("identifier") as string,
        password: formData.get("password") as string,
      };

      const validation = signInSchema.safeParse(formValues);

      if (!validation.success) {
        setSignInErrors(mapIssuesToErrors(validation.error.issues));
        toast.error("Please fix the validation errors");
        return;
      }

      toast.loading("Checking your account...", { id: "signin" });
      const preflight = await fetch("/api/auth/credentials/preflight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: formValues.identifier,
          password: formValues.password,
        }),
      });
      const preflightData = await preflight.json().catch(() => null);

      if (!preflight.ok || !preflightData?.success) {
        const code = preflightData?.code as string | undefined;
        const message =
          (preflightData?.message as string | undefined) ||
          "Sign in failed. Please try again.";

        if (code === "VERIFICATION_REQUIRED") {
          toast.error(message, {
            id: "signin",
            action: {
              label: "Verify now",
              onClick: () =>
                router.push(
                  `/authentication/verify-email/${encodeURIComponent(
                    formValues.identifier
                  )}`
                ),
            },
            duration: 5000,
          });
          return;
        }

        toast.error(message, { id: "signin" });
        return;
      }

      toast.loading("Signing you in...", { id: "signin" });
      const response = await signIn("credentials", {
        redirect: false,
        identifier: formValues.identifier,
        password: formValues.password,
      });

      if (response?.ok) {
        toast.success("Welcome back!", { id: "signin" });
        router.push("/home");
      } else if (response?.error) {
        const { message } = resolveSignInError(response.error, searchParams);
        toast.error(message, { id: "signin" });
      } else {
        toast.error("An unexpected error occurred. Please try again.", {
          id: "signin",
        });
      }
    } catch (error) {
      console.error("Sign in error:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error(
          "Network error. Please check your connection and try again.",
          {
            id: "signin",
          }
        );
      } else if (error instanceof Error) {
        toast.error(
          error.message || "An unexpected error occurred. Please try again.",
          {
            id: "signin",
          }
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.", {
          id: "signin",
        });
      }
    } finally {
      setIsSignInLoading(false);
    }
  };

  const handleSignUp = async (formData: FormData) => {
    setIsSignUpLoading(true);
    setSignUpErrors({});

    try {
      const formValues = {
        starName: formData.get("starName") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      };

      const validation = signUpSchema.safeParse(formValues);

      if (!validation.success) {
        setSignUpErrors(mapIssuesToErrors(validation.error.issues));
        toast.error("Please fix the validation errors");
        return;
      }

      toast.loading("Creating your account...", { id: "signup" });
      const response = await signUpAction(formData);

      if (response.success) {
        const responseData = response.data as AuthData;
        const { verification_code, user } = responseData;
        if (!isValidSignupResponse(user, verification_code)) {
          toast.error("Account created but verification setup failed", {
            id: "signup",
          });
          return;
        }
        toast.success("Account created successfully!", { id: "signup" });
        await sendSignupVerificationEmail(
          user!.email,
          user!.star_name,
          verification_code!
        );
        router.push(`/authentication/verify-email/${user!.star_name}`);
      } else {
        toast.error(response.message || "Sign up failed", { id: "signup" });

        if (response.message?.includes("email")) {
          toast.info("Try signing in instead if you already have an account", {
            duration: 4000,
          });
        } else if (response.message?.includes("username")) {
          toast.info("Please try a different username", {
            duration: 4000,
          });
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("An unexpected error occurred. Please try again.", {
        id: "signup",
      });
    } finally {
      setIsSignUpLoading(false);
    }
  };

  return (
    <div className="signin-signup">
      {/* Sign In Form */}
      <form action={handleSignIn} className="sign-in-form" noValidate>
        <h2 className="title text-black dark:text-white">Sign in</h2>

        <FormItem>
          <div className="input-field bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
            <MdOutlineMail className="icon text-gray-600 dark:text-gray-300" />
            <input
              name="identifier"
              type="text"
              placeholder="Email or Username"
              required
              autoComplete="username"
              disabled={isSignInLoading}
              aria-invalid={Boolean(signInErrors.identifier)}
              aria-describedby={
                signInErrors.identifier ? "signin-identifier-error" : undefined
              }
              className={`${signInErrors.identifier ? "border-red-500" : ""} ${
                isSignInLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
          </div>
          {signInErrors.identifier && (
            <FormMessage
              id="signin-identifier-error"
              className="text-red-500 text-sm mt-1"
            >
              {signInErrors.identifier}
            </FormMessage>
          )}
        </FormItem>

        <FormItem>
          <PasswordToggle
            fieldName="password"
            placeholder="Password"
            icon={
              <RiLockPasswordLine className="icon text-gray-600 dark:text-gray-300" />
            }
          />
          {signInErrors.password && (
            <FormMessage className="text-red-500 text-sm mt-1">
              {signInErrors.password}
            </FormMessage>
          )}
        </FormItem>

        <SimpleSubmitButton>
          {isSignInLoading ? "Signing In..." : "Sign In"}
        </SimpleSubmitButton>

        <SocialAuth />
      </form>

      {/* Sign Up Form */}
      <form action={handleSignUp} className="sign-up-form" noValidate>
        <h2 className="title text-black dark:text-white">Sign up</h2>

        <FormItem>
          <UsernameField />
          {signUpErrors.starName && (
            <FormMessage className="text-red-500 text-sm mt-1">
              {signUpErrors.starName}
            </FormMessage>
          )}
        </FormItem>

        <FormItem>
          <div className="input-field bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
            <MdOutlineMail className="icon text-gray-600 dark:text-gray-300" />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              autoComplete="email"
              aria-invalid={Boolean(signUpErrors.email)}
              aria-describedby={
                signUpErrors.email ? "signup-email-error" : undefined
              }
              className={signUpErrors.email ? "border-red-500" : ""}
            />
          </div>
          {signUpErrors.email && (
            <FormMessage
              id="signup-email-error"
              className="text-red-500 text-sm mt-1"
            >
              {signUpErrors.email}
            </FormMessage>
          )}
        </FormItem>

        <FormItem>
          <PasswordToggle
            fieldName="password"
            placeholder="Password"
            icon={
              <RiLockPasswordLine className="icon text-gray-600 dark:text-gray-300" />
            }
          />
          {signUpErrors.password && (
            <FormMessage className="text-red-500 text-sm mt-1">
              {signUpErrors.password}
            </FormMessage>
          )}
        </FormItem>

        <SimpleSubmitButton>
          {isSignUpLoading ? "Creating Account..." : "Sign Up"}
        </SimpleSubmitButton>

        <SocialAuth />
      </form>
    </div>
  );
}
