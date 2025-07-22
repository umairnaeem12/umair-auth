// utils/sendMail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject: "Your OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px">
        <h2>🔐 Your OTP Code</h2>
        <p>Please use the following OTP to complete your verification:</p>
        <h1 style="background: #000; color: #fff; padding: 10px 20px; display: inline-block;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p style="font-size: 12px; color: #888;">If you didn’t request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP sent to ${to}`);
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw new Error("Failed to send OTP email");
  }
}
