import { ApiResponse } from "@/types/api.types";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import type Mail from "nodemailer/lib/mailer";

export type EmailType = "verification" | "resend" | "password-reset";

export async function sendEmail(
  email: string | undefined,
  username: string | undefined,
  verifyCode: string | undefined,
  type: EmailType = "verification"
): Promise<ApiResponse> {
  if (!email) {
    return {
      success: false,
      message: "Email address is required to send verification email",
    };
  }

  if (!username) {
    return {
      success: false,
      message: "Username is required to personalize the email",
    };
  }

  if (!verifyCode) {
    return {
      success: false,
      message: "Verification code is required to send email",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: "Invalid email address format",
    };
  }

  const isPasswordReset = type === "password-reset";
  if (!isPasswordReset) {
    if (!/^[A-Za-z0-9]{6}$/.test(verifyCode)) {
      return {
        success: false,
        message:
          "Invalid verification code format. Expected 6 alphanumeric characters",
      };
    }
  }

  const chars = verifyCode.toString().toUpperCase().split("");

  const BRAND = "#4f7cff";
  const BASE_URL =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  const getEmailContent = (emailType: EmailType) => {
    switch (emailType) {
      case "verification":
        return {
          subject: "StarByte - Verify Your Email",
          greeting: `Hello, <span style="border-bottom: 2px solid ${BRAND}; display: inline-block;">${username}</span>`,
          message: `Thank you for registering on StarByte via <span style=\"color: ${BRAND}; text-decoration: none;\">${email}</span>! Please use the following 6-character code to verify your email address:`,
          buttonText: "Complete Registration",
          buttonUrl: `${BASE_URL}/authentication/verify-email/${username}?code=${encodeURIComponent(
            verifyCode
          )}`,
        };
      case "resend":
        return {
          subject: "StarByte - Verification Code Resent",
          greeting: `Hello again, <span style="border-bottom: 2px solid ${BRAND}; display: inline-block;">${username}</span>`,
          message: `We've resent your verification code as requested. Please use the following 6-character code to verify your email address:`,
          buttonText: "Verify Email",
          buttonUrl: `${BASE_URL}/authentication/verify-email/${username}?code=${encodeURIComponent(
            verifyCode
          )}`,
        };
      case "password-reset":
        return {
          subject: "StarByte - Password Reset",
          greeting: `Hello, <span style="border-bottom: 2px solid ${BRAND}; display: inline-block;">${username}</span>`,
          message: `You've requested to reset your password. Click the button below to continue. If you didn't request this, you can safely ignore this email.`,
          buttonText: "Reset Password",
          buttonUrl: `${BASE_URL}/authentication/reset-password?token=${encodeURIComponent(
            verifyCode
          )}`,
        };
      default:
        return {
          subject: "StarByte - Verification Code",
          greeting: `Hello, <span style="border-bottom: 2px solid ${BRAND}; display: inline-block;">${username}</span>`,
          message: `Please use the following 6-character code to verify your email address:`,
          buttonText: "Verify Email",
          buttonUrl: `${BASE_URL}/authentication/verify-email/${username}?code=${encodeURIComponent(
            verifyCode
          )}`,
        };
    }
  };

  const content = getEmailContent(type);
  const LOGO_URL = `${BASE_URL}/icons/icon512_maskable.png`;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.USER,
        pass: process.env.APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const showBoxes = !isPasswordReset;

    const attachments: Mail.Attachment[] = [];
    let logoImgTag = "";
    try {
      const localLogoPath = path.join(
        process.cwd(),
        "public",
        "icons",
        "icon512_maskable.png"
      );
      const buffer = await fs.readFile(localLogoPath);
      const logoCid = "logo-starbyte";
      attachments.push({
        filename: "logo.png",
        content: buffer,
        cid: logoCid,
        contentType: "image/png",
      });
      logoImgTag = `<img src="cid:${logoCid}" alt="Starbyte" width="32" height="32" style="display: inline-block; vertical-align: middle;" />`;
    } catch {
      logoImgTag = `<img src="${LOGO_URL}" alt="Starbyte" width="32" height="32" style="display: inline-block; vertical-align: middle;" />`;
    }
    const htmlResponse = `
      <body style="font-family: Inter, Arial, sans-serif; background-color: #f7f7f7; overflow-x: hidden; margin: 0; padding: 0; color: #333; display: flex; justify-content: center; align-items: center;">
        <div style="max-width: 800px; overflow-x: hidden; line-height: 2; width: 90%; min-width: 280px; margin: 50px auto; padding: 20px; background: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.08); border-radius: 12px;">
          <div style="margin: 20px auto 10px; width: 100%; max-width: 640px; padding: 0 0 12px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 12px;">
            ${logoImgTag}
            <a href="${BASE_URL}" style="font-size: 1.4em; color: ${BRAND}; text-decoration: none; font-weight: 800; letter-spacing: 0.2px;">Starbyte</a>
          </div>
          <div style="margin: 0 auto; width: 100%; max-width: 640px; padding: 10px 0;">
            <p style="font-size: 1.8em; margin: 0 0 12px 0;">${
              content.greeting
            }</p>
            <p style="font-size: 1.05em; margin: 0 0 20px 0; line-height: 1.6;">${
              content.message
            }</p>
            ${
              showBoxes
                ? `<div style="text-align: center; margin: 24px 0 8px 0;">${chars
                    .map(
                      (c) =>
                        `<span style="display: inline-block; padding: 10px; border-radius: 12px; background-color: #f5f7ff; width: 48px; height: 48px; line-height: 48px; border: 2px solid ${BRAND}20; margin: 0 4px; font-size: 24px; font-weight: 700; color: #1f2937;">${c}</span>`
                    )
                    .join("")}</div>`
                : ``
            }
            <div style="text-align: center; margin: 28px 0 24px 0;">
              <a href="${content.buttonUrl}"
                 style="display: inline-block; padding: 14px 26px; background-color: ${BRAND}; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; border: none; cursor: pointer; box-shadow: 0 4px 14px ${BRAND}4d;">
                 ${content.buttonText}
              </a>
            </div>
            <div style="background-color: #f5f7ff; padding: 16px; border-radius: 10px; margin: 18px 0; border-left: 3px solid ${BRAND};">
              <p style="font-size: 0.92em; margin: 0; color: #42526e; line-height: 1.5;">
                <strong>Security Note:</strong> This ${
                  isPasswordReset ? "link" : "code"
                } will expire in 15 minutes. If you didn't request this email, please ignore it or contact our support team.
              </p>
            </div>
            <p style="font-size: 1em; color: ${BRAND}; margin-top: 18px;">Warm Regards,</p>
            <p style="font-size: 1em; color: ${BRAND}; font-weight: 700;">The Starbyte Team</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0 12px 0;" />
            <div style="text-align: center; padding: 10px 0; color: #98a2b3; font-size: 0.8em; line-height: 1.4; font-weight: 400;">
              <p style="margin: 6px 0;">&copy; ${new Date().getFullYear()} Starbyte. All rights reserved.</p>
              <p style="margin: 6px 0;">Rupandehi, Nepal</p>
              <p style="margin: 6px 0;">
                <a href="${BASE_URL}/privacy" style="color: ${BRAND}; text-decoration: none;">Privacy Policy</a> |
                <a href="${BASE_URL}/terms" style="color: ${BRAND}; text-decoration: none;">Terms of Service</a> |
                <a href="${BASE_URL}/support" style="color: ${BRAND}; text-decoration: none;">Support</a>
              </p>
            </div>
          </div>
        </div>
      </body>
      `;

    const mailOptions: nodemailer.SendMailOptions = {
      from: { name: "Starbyte", address: process.env.USER as string },
      to: email,
      subject: content.subject,
      text: isPasswordReset
        ? `Password reset link: ${content.buttonUrl}`
        : `Verification Code from Starbyte: ${verifyCode}`,
      html: htmlResponse,
      attachments: attachments.length ? attachments : undefined,
    };

    try {
      await transporter.sendMail(mailOptions);
      return {
        success: true,
        message: "Email sent successfully.",
      };
    } catch {
      return { success: false, message: "Failed to send email." };
    }
  } catch {
    return { success: false, message: "Failed to set up email transporter." };
  }
}
