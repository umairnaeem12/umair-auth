import { z } from "zod";

const passwordRules = z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[a-zA-Z]/, "Password must contain letters");

const emailRule = z.string().email("Invalid email address");

const otpRule = z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must be numeric");

export const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: emailRule,
    password: passwordRules,
});

export const loginSchema = z.object({
    email: emailRule,
    password: z.string().min(1, "Password is required"),
});

export const verifySignupOtpSchema = z.object({
    email: emailRule,
    otp: otpRule,
});

export const resendSignupOtpSchema = z.object({
    email: emailRule,
});

export const forgotPasswordSchema = z.object({
    email: emailRule,
});

export const verifyForgotOtpSchema = z.object({
    email: emailRule,
    otp: otpRule,
});

export const resetPasswordSchema = z.object({
    email: emailRule,
    // otp: otpRule,
    newPassword: passwordRules,
});

export const resendForgotOtpSchema = z.object({
    email: emailRule,
});
