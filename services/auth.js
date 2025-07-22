import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOtp, getOtpExpiry } from "../utils/sendOtp.js";
import { getDbClient } from "../utils/getDbClient.js"; // your new DB client
import { getTenantDb } from "../utils/getTenantDbClient.js";

// 🔐 Generate token
function generateToken(userId) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("Missing JWT_SECRET");
  return jwt.sign({ userId }, jwtSecret, { expiresIn: "7d" });
}

export async function registerUser(projectId, { name, email, password }) {
  const { tenantDb, jwtSecret } = await getTenantDb(projectId);

  const existing = await tenantDb.query("SELECT * FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    throw new Error("Email already registered");
  }

  const hashed = await bcrypt.hash(password, 10);

  const result = await tenantDb.query(
    `INSERT INTO users (name, email, password, is_verified) VALUES ($1, $2, $3, $4) RETURNING id`,
    [name, email, hashed, false]
  );

  const token = jwt.sign({ userId: result.rows[0].id }, jwtSecret, { expiresIn: "7d" });

  return { message: "User registered", token };
}

export async function loginUser({ email, password }, projectId) {
  const db = getDbClientByProject(projectId);
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Invalid password");

  const otp = generateOtp();
  const otpExpiresAt = getOtpExpiry();

  await db.user.update({
    where: { email },
    data: { otpCode: otp, otpExpiresAt },
  });

  console.log(`OTP for ${email}: ${otp}`);

  return { message: "OTP sent. Please verify your login." };
}

export async function verifySignupOtp({ email, otp }, projectId) {
  const db = getDbClientByProject(projectId);

  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  if (user.otpCode !== otp || user.otpExpiresAt < new Date()) {
    throw new Error("Invalid or expired OTP");
  }

  const updatedUser = await db.user.update({
    where: { email },
    data: {
      otpCode: null,
      otpExpiresAt: null,
      isVerified: true,
    },
  });

  const token = generateToken(updatedUser.id);

  return {
    message: "Login verified successfully",
    user: updatedUser,
    token,
  };
}

export async function resetOtp(email, projectId) {
  const db = getDbClientByProject(projectId);

  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const otp = generateOtp();
  const otpExpiresAt = getOtpExpiry();

  await db.user.update({
    where: { email },
    data: { otpCode: otp, otpExpiresAt },
  });

  console.log(`OTP for ${email}: ${otp}`);
  return { message: "OTP reset successfully. Please verify your login." };
}

export async function forgotYourPassword(email, projectId) {
  const db = getDbClientByProject(projectId);

  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const otp = generateOtp();
  const otpExpiresAt = getOtpExpiry();

  await db.user.update({
    where: { email },
    data: { otpCode: otp, otpExpiresAt },
  });

  console.log(`OTP for password reset for ${email}: ${otp}`);
  return { message: "OTP sent for password reset. Please verify." };
}

export async function verifyForgetOtp({ email, otp }, projectId) {
  const db = getDbClientByProject(projectId);

  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  if (user.otpCode !== otp || user.otpExpiresAt < new Date()) {
    throw new Error("Invalid or expired OTP");
  }

  return { message: "OTP verified successfully. You can now reset your password." };
}

export async function resetYourPassword({ email, newPassword }, projectId) {
  const db = getDbClientByProject(projectId);

  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.user.update({
    where: { email },
    data: { password: hashedPassword, otpCode: null, otpExpiresAt: null },
  });

  return { message: "Password reset successfully. You can now log in with your new password." };
}
