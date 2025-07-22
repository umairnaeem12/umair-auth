import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOtp, getOtpExpiry } from "../utils/sendOtp.js";
import { getPrismaClient } from "../utils/getPrismaClient.js";
import { getJwtSecret } from "../utils/getJwtSecret.js";
import { globalPrisma } from "../utils/globalPrisma.js";

// 🔐 Generate token
async function generateToken(user, projectId) {
  try {
    console.log("🔐 Generating token for user:", user.id, "project:", projectId);

    const jwtSecret = await getJwtSecret(projectId);
    if (!jwtSecret) {
      throw new Error("Missing JWT secret");
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    console.log("✅ Token generated successfully");
    return token;
  } catch (error) {
    console.error("🚨 Token generation failed:", {
      userId: user?.id,
      projectId,
      error: error.message
    });
    throw error;
  }
}

export async function registerUser(projectId, { name, email, password }) {
  const project = await globalPrisma.project.findUnique({ where: { id: projectId } });
  if (!project || !project.dbUrl) throw new Error("Invalid project or dbUrl");

  const prisma = await getPrismaClient(projectId, project.dbUrl);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      isVerified: false,
    },
  });

  return { message: "User registered successfully" };
}

export async function loginUser({ email, password }, projectId) {
  const prisma = await getPrismaClient(projectId);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Invalid password");

  const otp = generateOtp();
  const otpExpiresAt = getOtpExpiry();

  await prisma.user.update({
    where: { email },
    data: { otpCode: otp, otpExpiresAt },
  });

  console.log(`OTP for ${email}: ${otp}`);

  return {
    message: "OTP sent. Please verify your login.",
  };
}

export async function verifySignupOtp({ email, otp }, projectId) {
  try {
    console.log("🔍 Verifying OTP for:", { email, projectId });

    const prisma = await getPrismaClient(projectId);
    console.log("✅ Prisma client obtained for project:", projectId);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error("User not found with email:", email);
      throw new Error("User not found");
    }

    console.log("🔍 User found. Checking OTP...");

    if (user.otpCode !== otp || user.otpExpiresAt < new Date()) {
      console.error("Invalid OTP for user:", user.id);
      throw new Error("Invalid or expired OTP");
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        otpCode: null,
        otpExpiresAt: null,
        isVerified: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        createdAt: true,
      },
    });

    const token = await generateToken(updatedUser, projectId);

    return {
      message: "Login verified successfully",
      user: updatedUser,
      token,
    };
  } catch (error) {
    console.error("🚨 Error in verifySignupOtp:", {
      email,
      projectId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

export async function resetOtp(email, projectId) {
  const prisma = await getPrismaClient(projectId);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const otp = generateOtp();
  const otpExpiresAt = getOtpExpiry();

  await prisma.user.update({
    where: { email },
    data: { otpCode: otp, otpExpiresAt },
  });

  console.log(`OTP for ${email}: ${otp}`);

  return {
    message: "OTP reset successfully. Please verify your login.",
  };
}

export async function forgotYourPassword(email, projectId) {
  const prisma = await getPrismaClient(projectId);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const otp = generateOtp();
  const otpExpiresAt = getOtpExpiry();

  await prisma.user.update({
    where: { email },
    data: { otpCode: otp, otpExpiresAt },
  });

  console.log(`OTP for password reset for ${email}: ${otp}`);

  return {
    message: "OTP sent for password reset. Please verify.",
  };
}

export async function verifyForgetOtp({ email, otp }, projectId) {
  const prisma = await getPrismaClient(projectId);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  if (user.otpCode !== otp || user.otpExpiresAt < new Date()) {
    throw new Error("Invalid or expired OTP");
  }

  return {
    message: "OTP verified successfully. You can now reset your password.",
  };
}

export async function resetYourPassword({ email, newPassword }, projectId) {
  const prisma = await getPrismaClient(projectId);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword, otpCode: null, otpExpiresAt: null },
  });

  return {
    message: "Password reset successfully. You can now log in with your new password.",
  };
}
