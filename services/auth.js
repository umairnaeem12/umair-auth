import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOtp, getOtpExpiry } from "../utils/sendOtp.js";
import { getTenantDb } from "../utils/getTenantDbClient.js";
import { sendOtpEmail } from "../utils/sendMail.js";

// 🔐 Generate token
function generateToken(userId, jwtSecret) {
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

  const token = generateToken(result.rows[0].id, jwtSecret);
  return { message: "User registered", token };
}

export async function loginUser({ email, password }, projectId) {
  const { tenantDb, jwtSecret } = await getTenantDb(projectId);

  const userRes = await tenantDb.query(`SELECT * FROM users WHERE email = $1`, [email]);
  const user = userRes.rows[0];
  if (!user) throw new Error("User not found");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Invalid password");

  const otp = generateOtp();
  const otpExpiresAt = getOtpExpiry();

  await tenantDb.query(
    `UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE email = $3`,
    [otp, otpExpiresAt, email]
  );

  await sendOtpEmail(email, otp);

  console.log(`OTP for ${email}: ${otp}`);
  return { message: "OTP sent. Please verify your login." };
}

export async function verifySignupOtp({ email, otp }, projectId) {
  const { tenantDb, jwtSecret } = await getTenantDb(projectId);

  const userRes = await tenantDb.query(`SELECT * FROM users WHERE email = $1`, [email]);
  const user = userRes.rows[0];
  if (!user) throw new Error("User not found");

  if (user.otp_code !== otp || new Date(user.otp_expires_at) < new Date()) {
    throw new Error("Invalid or expired OTP");
  }

  await tenantDb.query(
    `UPDATE users SET otp_code = NULL, otp_expires_at = NULL, is_verified = true WHERE email = $1`,
    [email]
  );

  const token = generateToken(user.id, jwtSecret);

  return {
    message: "Login verified successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      is_verified: true,
      created_at: user.created_at,
    },
    token,
  };
}

export async function resetOtp(email, projectId) {
  const { tenantDb } = await getTenantDb(projectId);

  const userRes = await tenantDb.query(`SELECT * FROM users WHERE email = $1`, [email]);
  if (userRes.rows.length === 0) throw new Error("User not found");

  const otp = generateOtp();
  const otpExpiresAt = getOtpExpiry();

  await tenantDb.query(
    `UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE email = $3`,
    [otp, otpExpiresAt, email]
  );

  console.log(`OTP for ${email}: ${otp}`);
  return { message: "OTP reset successfully. Please verify your login." };
}

export async function forgotYourPassword(email, projectId) {
  const { tenantDb } = await getTenantDb(projectId);

  const userRes = await tenantDb.query(`SELECT * FROM users WHERE email = $1`, [email]);
  if (userRes.rows.length === 0) throw new Error("User not found");

  const otp = generateOtp();
  const otpExpiresAt = getOtpExpiry();

  await tenantDb.query(
    `UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE email = $3`,
    [otp, otpExpiresAt, email]
  );

  console.log(`OTP for password reset for ${email}: ${otp}`);
  return { message: "OTP sent for password reset. Please verify." };
}

export async function verifyForgetOtp({ email, otp }, projectId) {
  const { tenantDb } = await getTenantDb(projectId);

  const userRes = await tenantDb.query(`SELECT * FROM users WHERE email = $1`, [email]);
  const user = userRes.rows[0];
  if (!user) throw new Error("User not found");

  if (user.otp_code !== otp || new Date(user.otp_expires_at) < new Date()) {
    throw new Error("Invalid or expired OTP");
  }

  return { message: "OTP verified successfully. You can now reset your password." };
}

export async function resetYourPassword({ email, newPassword }, projectId) {
  const { tenantDb } = await getTenantDb(projectId);

  const userRes = await tenantDb.query(`SELECT * FROM users WHERE email = $1`, [email]);
  if (userRes.rows.length === 0) throw new Error("User not found");

  const hashed = await bcrypt.hash(newPassword, 10);

  await tenantDb.query(
    `UPDATE users SET password = $1, otp_code = NULL, otp_expires_at = NULL WHERE email = $2`,
    [hashed, email]
  );

  return { message: "Password reset successfully. You can now log in with your new password." };
}
