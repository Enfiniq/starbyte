import { z } from "zod";
import { starNameValidation } from "@/schemas/signUpSchema";
import { emailSchema } from "@/schemas/signInSchema";

const emailOrUsernameSchema = z.union([emailSchema, starNameValidation], {
  errorMap: () => ({ message: "Please enter a valid email or username" }),
});

export const verifyEmailSchema = z.object({
  identifier: emailOrUsernameSchema,
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
});

export const resendVerificationCodeSchema = z.object({
  identifier: emailOrUsernameSchema,
});

export const initiatePasswordResetSchema = z.object({
  identifier: emailOrUsernameSchema,
});

export const resetPasswordSchema = z.object({
  identifier: emailOrUsernameSchema,
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
});

export const sendVerificationEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(1, "Username is required"),
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
  type: z
    .enum(["verification", "resend", "password-reset"])
    .default("verification"),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationCodeFormData = z.infer<
  typeof resendVerificationCodeSchema
>;
export type InitiatePasswordResetFormData = z.infer<
  typeof initiatePasswordResetSchema
>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type SendVerificationEmailFormData = z.infer<
  typeof sendVerificationEmailSchema
>;
